import mongoose from "mongoose";
import bcrypt from "bcrypt";

let addressObject = {
  city: "",
  state: "",
  country: "",
  pincode: ""
}

let emailObject = {
  companyEmail: "",
  verify: false
}

let contactPersonObject = {
    name: "",
    email: "",
    phone: ""
}

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  email: {
    type: Object,
    required: true,
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
  industryType: {
    type: String,
    required: true
  },
  companySize: {
    type: String,
    default: "1-10 employees"
  },
  establishedYear: {
    type: Number,
    required: true
  },
  contactPerson:{
    type: Object,
    required: true,
    default: contactPersonObject
  },
  description: {
    type: String,
    default: "No description provided."
  },
  website: {
    type: String,
    default: ""
  },
  timeStamp: {
    type: Date,
    default: Date.now
  }
});


companySchema.pre("save", async function () {
  try {
    if (this.isModified("password")) {
      console.log("Company password is:", this.password);
      this.password = await bcrypt.hash(this.password, 10);
      console.log("Password hashed and saved!");
    }
  } catch (err) {
    console.log("Error in pre method:", err);
    throw err;
  }
});

let companyModel = new mongoose.model("companies", companySchema);

export { companyModel };