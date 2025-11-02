import nodemailer from "nodemailer"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { redisClient } from "../utils/redisClient.js"
import { userModel } from "../models/userSchema.js"

dotenv.config({ path: "./config.env" })

// to send a email we need a transporter 

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',   // Gmail SMTP
  port: 465,                // 465 for SSL, 587 for STARTTLS
  secure: true,             // true for 465, false for 587
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_EMAIL_PASSWORD,
  }
})

function generateRandomNumber() {
  return Math.floor((Math.random() * 9000) + 1000)
}

async function sendOTP(email) {
  try {

    let otp = generateRandomNumber()

    // style otp 
    let emailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "🔐 Verify Your Email Address | OTP valid for 5 mins",
      html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; padding: 40px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="text-align: center; background: linear-gradient(135deg, #4a90e2, #0078ff); padding: 20px; border-radius: 10px 10px 0 0; color: #fff;">
        <h2 style="margin: 0; font-size: 24px;">🔐 Email Verification</h2>
      </div>

      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
          Hi there 👋,
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Thank you for joining <strong>JobStack</strong>!  
          Please use the OTP below to verify your email address.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #0078ff, #4a90e2); color: white; font-size: 26px; font-weight: bold; letter-spacing: 4px; padding: 15px 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            ${otp}
          </div>
        </div>

        <p style="font-size: 14px; color: #555; text-align: center;">
          ⚠️ This OTP is valid for only <strong>5 minutes</strong>.  
          Do not share it with anyone for your security.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

        <p style="text-align: center;">
          <a href="#" style="background: #0078ff; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">
            Verify Email
          </a>
        </p>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 25px;">
          © ${new Date().getFullYear()} <strong>JobStack</strong> | Secure Email Verification System
        </p>
      </div>
    </div>
  `
    };

    await transporter.sendMail(emailOptions)

    // Convert OTP to string before storing
    await redisClient.setEx(`email:${email}`, 300, otp.toString())

    return { message: "otp sent successfully !", status: true }

  } catch (err) {
    console.log("error sending otp : ", err)

    return { message: "unable to send otp !", status: false }
  }
}

let handleUserRegister = async (req, res) => {
  try {
    let { name, phone, email, address, dob, password, qualifications } = req.body

    if (!name || !phone || !email || !address || !dob || !password || !qualifications) throw ("invalid/missing data !")

    // check if user exits
    let checkIfUserExits = await userModel.findOne({
      $or: [{ "email.userEmail": email }, { "phone": phone }]
    })

    // if found then error
    if (checkIfUserExits) throw ("uanble to register user please change email/phone and try again !")

    let emailObject = {
      userEmail: email, verified: false
    }

    // to send otp

    let result = await sendOTP(email)

    if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

    // create user object

    // encrypt password
    let newUser = new userModel({ name, phone, email: emailObject, address, dob, qualifications, password })

    // save user object
    await newUser.save();

    // exit
    res.status(202).json({ message: `user registered successfully please verify the email using otp that is sent on email ${email}` })

  } catch (err) {
    console.log("error while registering user : ", err)
    res.status(400).json({ message: "unable to register user !", err })
  }
}

let handleOTPVerification = async (req, res) => {
  try {
    let { email, userOtp } = req.body

    //check if email exit
    let emailExits = await userModel.findOne({
      "email.userEmail": email
    })

    if (!emailExits) throw (`email ${email} is not registred !`)

    let storeOtp = await
      redisClient.get(`email:${email}`)

    if (!storeOtp) throw ("otp is expried/not found !")

    if (storeOtp != userOtp) throw ("invalid otp !")

    console.log('otp matched successfully !')

    // change verification status to true
    let updateUserObject = await userModel.updateOne(
      { "email.userEmail": email }, { $set: { "email.verified": true } })

    console.log(updateUserObject)

    // remove the temp otp

    redisClient.del(`email:${email}`)

    res.status(202).json({ message: "otp verified successfully please head to login !" })

  } catch (err) {
    console.log("error while verifying the otp : ", err)
        res.status(500).json({ message: "failed to verify user otp please try again later !", err })

  }
}


let handleUserLogin = async (req,res) => {
 try {
        let {email, password} = req.body

        if (!email || !password) throw ({ message: `Incomplete/invalid data`, status:400})

        let user = await userModel.findOne({ "email.userEmail": email})
        
        if (!user) throw ({ message: `user not found with email ${email}. Please register the user first.`, status: 404 })
        
        let validPassword = await bcrypt.compare(password,user.password)
        
        if (!validPassword) throw ({message: `incorret email/password !`, status: 401})

             let playLoad = {  "email.userEmail": email }

              let token = await jwt.sign(playLoad
            , process.env.JWT_SECRET_KEY, { expiresIn: "0.25hr" })

        res.status(202).json({ message: "login successfull !", token })   


    } catch(error) {
        console.log("error while login : ", error)
        res.status(error.status || 401).json({ message: error.message || "unable to login at this moment. Please try again later !", error })
    }
}

export { handleUserRegister, handleOTPVerification,handleUserLogin}


// Test the router
// let test = (req,res) => {
//     res.status(200).json({
//         message: " Welcome to user test route ! "
//     })
// }
// export {test}