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

// action job for delete and close
let handleJobAction = async (req, res) => {
    try {

        let company = req.company

        if (!company) throw ("Invalid request. Please register/login first !")

        let { jobId } = req.params

        let { action } = req.params

        if (action == "delete") {
            let result = await jobModel.findByIdAndDelete(jobId)
            if (!result) throw ("unable to delete the job")
            // remove this job id from user data
            res.status(202).json({ message: "successfully delete the job !" })
        } else if (action == "closed") {
            let result = await jobModel.findByIdAndUpdate(jobId, { $set: { "closed": true } })
            if (result.modifiedCount == 0) throw ("unable to close a job !")
            res.status(202).json({ message: "successfully closed the job !" })
        }

        //  hello im sk  
      
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "unable to delete a job !", err })
    }
}

// get job update 
let handleJobUpdate = async (req, res) => {
  try {
    let company = req.company
    if (!company) throw("Company not logged in!")

    let { jobId } = req.params
    if (!jobId) throw("Invalid job ID!")

    let updates = req.body
    if (!updates ) throw ("No data provided to update!")
    

    //  firstoff all check job exists
    let existingJob = await jobModel.findById(jobId)
    if (!existingJob) {
      return res.status(404).json({ message: "Job not found!" })
    }

    //  Update the job
    let updatedJob = await jobModel.findByIdAndUpdate(
      jobId,
      { $set: updates },
      { new: true }
    )

    res.status(200).json({
      message: "Job updated successfully!",
      data: updatedJob
    })
  } catch (err) {
    console.error("Error while updating job data:", err)
    res.status(400).json({
      message: "Unable to update job data!",
      error: err.message
    })
  }
}

export { createJob, handleJobAction, handleJobApplication, getJobData, handleJobUpdate}
