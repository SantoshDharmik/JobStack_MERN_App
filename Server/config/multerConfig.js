import multer from "multer"
import path from "path"
import fs from "fs"


function createStorage(allowedTypes) {
    let storage = multer.diskStorage({
         destination: (req, file, cb) => {
      const fileType = req.params.file_type;
        
       // Validate file type
      if (!allowedTypes.includes(fileType)) {
         return cb(new Error(`Invalid upload type. Allowed types: ${allowedTypes.join(", ")}`))
         }
    


 // Define destination based on type

        let uploadPath = path.join
            (
                "upload",
                fileType === "resume"
                ? "resumes"
                : fileType === "profile_picture"
                ? "profile_pictures"
                : fileType === "logo"
                ? "company_logos" : "upload"
            )

             cb(null, uploadPath)

        },


      filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  return storage;
}
    


// Creating  separate uploaders for user and company

let uploadUser = multer({ storage: createStorage(["resume", "profile_picture"]) });

let uploadCompany = multer({ storage: createStorage(["resume", "profile_picture", "logo"]) });

export {uploadUser,uploadCompany}


// let upload = multer({ storage })
// export { upload }

