import express from "express"

import { handleUserRegister, handleOTPVerification, handleUserLogin } from "../controllers/userController.js"

import { handleResetPasswordRequest, handleOTPForPasswordReset } from "../controllers/userController.js"

import { handleResetPasswordRequestOldToNew } from "../controllers/userController.js"

import { handleUserFileUpload } from "../controllers/userController.js"

import {AuthUser} from "../middlewares/AuthUser.js"

import { uploadUser } from "../config/multerConfig.js"

let userRouter = express.Router()

// userRouter.get("/test",test)

userRouter.post("/register", handleUserRegister)

userRouter.post("/verify-otp", handleOTPVerification)

userRouter.post("/user-login", handleUserLogin)

userRouter.post("/password-reset-request",handleResetPasswordRequest)

userRouter.post("/verify-reset-password-request",handleOTPForPasswordReset)

userRouter.patch("/old-password-newPassword",AuthUser,handleResetPasswordRequestOldToNew )

// to upload resume/profie/docs we need to verfiy the user

userRouter.post("/upload-file/:file_type",AuthUser,uploadUser.single("file"),handleUserFileUpload)

export {userRouter}

uploadUser.single("file")