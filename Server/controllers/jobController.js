import { companyModel } from "../models/companySchema.js";
import  jobModel  from "../models/jobSchema.js";
import { userModel } from "../models/userSchema.js";

// create a job
let createJob = async (req, res) => {
    try {

        let company = req.company

        if (!company) throw ("Invalid request. Please register/login first !")

        let { title, jobRequirements } = req.body

        if (!title || !jobRequirements) throw ("invalid or missing data to create job !");

        let { type, category, exprience, location, postDate, offeredSalary, description } = jobRequirements

        if (!type || !category || !exprience || !location || !postDate || !offeredSalary || !description) throw ("jobRequirements data is not valid !")

        let newJob = new jobModel({ title, jobCreatedBy: company._id, jobRequirements })

        let result = await newJob.save()

        // add job id to company data [createdJobs]
        console.log(result)

        let updateCompany = companyModel.findByIdAndUpdate(company._id, { $push: { "createdJobs": result.insertedId } })

        if (updateCompany.modifiedCount == 0) throw ("unable to store job in company data !")

        res.status(202).json({ message: "new job created successfully !" })

    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "unable to add job !", err })
    }
}



export { createJob}
