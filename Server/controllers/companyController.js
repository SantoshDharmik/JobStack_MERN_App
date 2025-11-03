import nodemailer from "nodemailer"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { companyModel } from "../models/companySchema.js"
import { redisClient } from "../utils/redisClient.js"

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
  `}

    await transporter.sendMail(emailOptions)

    redisClient.setEx(`email:${email}`, 300, otp.toString())

    return { message: "OTP sent successfully !", status: true }

  } catch (err) {
    console.log("error sending otp : ", err)
    return { message: "unable to send otp !", status: false }
  }
}

let handleCompanyRegister = async (req, res) => {
  try {

    let { companyName, phone, email, password, address, industryType, companySize, description, website, establishedYear,contactPerson} = req.body;

    if (!companyName || !phone || !email || !password || !address || !industryType || !companySize || !description || !website || !contactPerson || !establishedYear) {
      throw ("Invalid or missing data!");
    }

    // check if user exits
    let checkIfCompanyExits = await companyModel.findOne({
      $or: [{ "email.companyEmail": email }, { "phone": phone }]
    })

    // if found then error
    if (checkIfCompanyExits) throw ("uanble to register company please change email/phone and try again !")

    let emailObject = {
      companyEmail: email, verified: false
    }

    // to send otp

    let result = await sendOTP(email)

    if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

    // create user object

    // encrypt password before saving

    let hash = await bcrypt.hash(password, 10)

    // let newCompany = new companyModel({ CompanyName, phone, email: emailObject, address, establishedYear, industryType, companySize, description, website, contactPerson, password: hash })


    let newCompany = new companyModel({companyName, phone, email:emailObject, password, address, industryType, companySize, description, website,establishedYear,contactPerson,
      password: hash })



    await newCompany.save();

    // exit
    res.status(202).json({ message: `Company registered successfully please verify the email using otp that is sent on email ${email}` })


  } catch (err) {

    console.log("error while registering user : ", err)
    res.status(400).json({ message: "unable to register user !", err })
  }
}

export { handleCompanyRegister }






























// // Test the router
// let test = (req,res) => {
//     res.status(200).json({
//         message: " Welcome to company test route ! "
//     })
// }
// export {test}