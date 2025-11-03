import express from  "express"

import {handleCompanyRegister} from "../controllers/companyController.js"

let companyRouter = express.Router()

// companyRouter.get("/test",test)

companyRouter.post("/register",handleCompanyRegister)

export {companyRouter}