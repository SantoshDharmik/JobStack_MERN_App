import express from "express"

import {handleUserRegister,handleOTPVerification,handleUserLogin,handleResetPasswordRequest,handleOTPForPasswordReset,handleResetPasswordRequestOldToNew} from "../controllers/userController.js"

import AuthUser from "../middlewares/AuthUser.js"

let userRouter = express.Router()

// userRouter.get("/test",test)

userRouter.post("/register", handleUserRegister)

userRouter.post("/verify-otp", handleOTPVerification)

userRouter.post("/user-login", handleUserLogin)

userRouter.post("/password-reset-request",handleResetPasswordRequest)

userRouter.post("/verify-reset-password-request",handleOTPForPasswordReset)

userRouter.post("/old-password-newPassword",handleResetPasswordRequestOldToNew )



export {userRouter}