import mongoose from "mongoose"
import bcrypt from "bcrypt"

let addressObject = {
    street: "", city: "", state: "", country: "", pincode: ""
}

let emailObject = {
    userEmail: "", verify : false
}

let userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type: Object,
        required:true,
        default: emailObject
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
     address: {
        type: Object,
        required: true,
        default: addressObject
    },
    dob: {
        type: String,
        required: true
    },
    qualifications: {
        type: Array,
        default: []
    },
    documents: {
        type: Array,
        default: []
    },
    profile_picture: {
        type: String,
        default: "",
    },
    appliedJobs: {
        type: [String],
        default: [],
    },
    timeStamp: {
        type: Date,
        default: Date.now,
    },
})

// //password hash 
// userSchema.pre("save", async function (next) {
//     try {
//         if (!this.isModified("password")) return next();
//         this.password = await bcrypt.hash(this.password, 10);
//         next();
//     } catch (err) {
//         next(err);
//     }
// });


let userModel = new mongoose.model("users",userSchema)

export {userModel}