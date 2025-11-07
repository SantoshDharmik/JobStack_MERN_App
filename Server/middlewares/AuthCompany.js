import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { companyModel } from "../models/companySchema.js"

dotenv.config({ path: "./config.env" })

const AuthCompany = async (req, res, next) => {
    try {

        let companyToken = req.headers.authorization

        if (!companyToken) throw ("Token not found or invalid!")

        //verify

        let result = jwt.verify(companyToken, process.env.COMPANY_JWT_SECRET_KEY)

        let company = await companyModel.findOne({
            "email.companyEmail": result.email,
        })

        if (!company) throw ("Company not found!")

        if (!company.email.verified)
            throw ("Email not verified. Please verify first!")

        req.company = company

        next()


    } catch (err) {
        console.log("AuthCompany failed with an error : ", err)
        res.status(401).json({ message: "auth company failed please login !" })
    }
}

export {AuthCompany}