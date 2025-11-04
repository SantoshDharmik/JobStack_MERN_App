import express from  "express"

import {handleCompanyRegister, handleOTPVerification,handleCompanyLogin} from "../controllers/companyController.js"

let companyRouter = express.Router()

// companyRouter.get("/test",test)

companyRouter.post("/register",handleCompanyRegister)

companyRouter.post("/verify-otp",handleOTPVerification)

companyRouter.post("/company-login", handleCompanyLogin)

export {companyRouter}