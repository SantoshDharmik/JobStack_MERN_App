import express from  "express"

import {handleCompanyRegister, handleOTPVerification,handleCompanyLogin,handleResetPasswordRequest,handleOTPForPasswordReset,handleResetPasswordRequestOldToNew} from "../controllers/companyController.js"

let companyRouter = express.Router()

// companyRouter.get("/test",test)

companyRouter.post("/register",handleCompanyRegister)

companyRouter.post("/verify-otp",handleOTPVerification)

companyRouter.post("/company-login", handleCompanyLogin)

companyRouter.post("/password-reset-request", handleResetPasswordRequest)

companyRouter.post("/verify-reset-password-request",handleOTPForPasswordReset)

companyRouter.patch("/old-password-newPassword",handleResetPasswordRequestOldToNew )


export {companyRouter}