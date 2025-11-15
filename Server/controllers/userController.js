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
  return Math.floor((Math.random() * 9000) + 1000).toString()
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
  `}

    await transporter.sendMail(emailOptions)

    redisClient.setEx(`email:${email}`, 300, otp)

    return { message: "otp sent successfully !", status: true }

  } catch (err) {
    console.log("error sending otp : ", err)
    return { message: "unable to send otp !", status: false }
  }
}

async function sendOTPForPasswordReset(email) {
  try {

    let otp = generateRandomNumber()

    let emailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Password Reset Request !",
      html: `
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;
              font-family:'Segoe UI',Arial,sans-serif;box-shadow:0 4px 15px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#0078ff,#4a90e2);color:#fff;text-align:center;padding:25px;">
      <h2 style="margin:0;font-size:22px;">🔐 Verify Your Email</h2>
      <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">Welcome to <strong>JobStack</strong>!</p>
    </div>

    <div style="padding:30px;text-align:center;color:#333;">
      <p style="font-size:16px;">Hi there 👋,<br>Use the OTP below to verify your email address.</p>

      <div style="margin:25px 0;">
        <span style="display:inline-block;background:#0078ff;color:#fff;font-size:26px;font-weight:700;
                     letter-spacing:4px;padding:15px 35px;border-radius:10px;">
          ${otp}
        </span>
      </div>

      <p style="font-size:14px;color:#666;">⚠️ OTP valid for <strong>5 minutes</strong>. Don’t share it with anyone.</p>

      <a href="#" style="display:inline-block;margin-top:20px;background:#0078ff;color:#fff;
                         padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;
                         box-shadow:0 3px 6px rgba(0,0,0,0.15);">
        Verify Email
      </a>

      <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">

      <p style="font-size:12px;color:#999;">© ${new Date().getFullYear()} <strong>JobStack</strong><br>
      Secure Email Verification System</p>
    </div>
  </div>
`}

    await transporter.sendMail(emailOptions)

    redisClient.setEx(`emailPasswordReset:${email}`, 300, otp.toString())

    return { message: "otp sent successfully !", status: true }

  } catch (err) {
    console.log("error sending otp : ", err)
    return { message: "unable to send otp !", status: false }
  }
}

let handleUserRegister = async (req, res) => {
  try {
    let { name, phone, email, street, city, state, country, pincode, dob, password } = req.body

   if (!name || !phone || !email || !street || !city || !state || !country || !pincode || !dob || !password) throw ("invalid/missing data !")

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

       let address = {
            street, city, state, country, pincode
        }

    // create user object

    // encrypt password before saving

    let hash = await bcrypt.hash(password, 10)

     let newUser = new userModel({ name, phone, email: emailObject, address, dob, password:hash })

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

    if (storeOtp.toString() !== userOtp.toString()) throw ("invalid otp !")

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

let handleUserLogin = async (req, res) => {
  try {
    let { email, password } = req.body

    let userExists = await userModel.findOne({
      "email.userEmail": email
    })

    if (!userExists) throw ("unable to find the email please register the user first !")

    if (!userExists.email.verified) {

      //to send otp
      let result = await sendOTP(email)

      if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

      // redirect user to email verification route

      throw (`user email is not verfied we have sent an otp at ${email} please verify your email !`)
    }

    //compare password 
    let result = await bcrypt.compare(password, userExists.password)

    if (!result) throw ("invalid email/password !")

    // create jwt and send to user 

    let token = await jwt.sign({ email }, process.env.USER_JWT_SECRET_KEY
      , { expiresIn: "240hr" })

    res.status(202).json({ message: `welcome user ${userExists.name} ! login was successfull.`, token })

  } catch (err) {
    console.log("error while login : ", err)
    res.status(400).json({ message: "unable to login", err })
  }
}

let handleResetPasswordRequest = async (req, res) => {
  try {

    let { email } = req.body

    if (!email) throw ("invalid/incomplete data !")

    let userExists = await userModel.findOne({ "email.userEmail": email })

    if (!userExists) throw ("invalid email address/Please register first !")

    let result = await sendOTPForPasswordReset(email)

    if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

    res.status(201).json({ message: `An OTP sent to your email ${email} | valid for 5 mins to reset your password !` })


  } catch (err) {
    console.log("password reset request failed !", err)
    res.status(400).json({ message: "password reset request failed !", err })

  }
}

let handleOTPForPasswordReset = async (req, res) => {
  try {

    let { email, userOtp, newPassword } = req.body;

    if (!email || !userOtp || !newPassword)
      return res.status(400).json({ message: "Email, OTP and new password are required!" });

    //check if email exits
    let emailExits = await userModel.findOne({ "email.userEmail": email })

    if (!emailExits) throw (`email ${email} is not registerd !`)

    let storedOtp = await redisClient.get(`emailPasswordReset:${email}`)

    if (!storedOtp) throw ("otp is expried/not found !")

    if (storedOtp.toString().trim() !== userOtp.toString().trim()) throw ("invalid otp !");

    console.log('otp matched successfully for password reset !')

    // encrypt

    let hash = await bcrypt.hash(newPassword, 10)

    // change verification status to true
    let updateUserObject = await userModel.updateOne({ "email.userEmail": email },
      { $set: { "password": hash } })

    console.log("Password updated:", updateUserObject)

    // remove the temprary otp
    redisClient.del(`emailPasswordReset:${email}`)

    res.status(202).json({ message: "otp verified successfully and password has been changed please head to login !" })

  } catch (err) {
    console.log("error while verifying the otp : ", err)
    res.status(500).json({ message: "failed to verify user otp please try again later !", err })
  }
}

let handleResetPasswordRequestOldToNew = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    // check valid inputs
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Incomplete data provided!" });
    }


    //  Check if user exists
    const user = await userModel.findOne({ "email.userEmail": email });

    if (!user) throw (`User with email ${email} not found!`)


    // Compare old password
    let isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordCorrect) throw ("Old password is incorrect!")


    // Check newPassword == confirmPassword
    if (newPassword !== confirmPassword)
      throw ("New password and Confirm password do not match!")

    // if check the old and new password does not same
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld)
      throw ("New password cannot be the same as the old password!")

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await userModel.updateOne(
      { "email.userEmail": email },
      { $set: { password: hashedPassword } }
    );

    return res.status(200).json({
      message: "Password changed successfully! Please login again.",
    });

  } catch (err) {
    console.error("Error while changing password:", err);
    res.status(500).json({
      message: "Failed to change password. Please try again later.",
      error: err.message,
    });
  }
}

let handleUserFileUpload = async (req, res) => {
  try {
    if (!req.file) throw new Error("Failed to upload a file!");

    let fileName = req.file.filename
    let fileType = req.params.file_type // 'resume' or 'profile_pictures'

    // Determine which field to update

    let updateField = {}

    if (fileType === "resume") {
      updateField = { $push: { documents: fileName } }
    } else if (fileType === "profile_picture") {
      updateField = { profile_picture: fileName }
    } else {
      throw new Error("Invalid file type. Only 'resume' or 'profile_pictures' allowed.");
    }

    // Update the user documents
    const result = await userModel.updateOne(
      { "email.userEmail": req.user.email.userEmail },
      updateField
    );

    if (result.modiFiedCount === 0) {
      throw new Error("User not found or file not saved.");
    }

    const uploadDest = `upload/${fileType}/${fileName}`;

    res.status(202).json({
      message: `${fileType === "resume" ? "Resume" : "Profile picture"} uploaded successfully!`,
      fileName,
      uploadDest,
    });

  } catch (err) {
    console.error("Error in handleUserFileUpload:", err);
    res.status(500).json({
      message: "Failed to upload the file.",
      error: err.message || err,
    });

  }
}

export { handleUserRegister, handleOTPVerification, handleUserLogin }

export { handleResetPasswordRequest, handleOTPForPasswordReset }

export { handleResetPasswordRequestOldToNew }

export { handleUserFileUpload }

