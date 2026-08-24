const mongoose = require("mongoose")

const userschema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    dob: Date,
    address: String,
    phone: String,
    state: String,
    zipCode: String,
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    gender: String,
    userType: String

}, { timestamps: true });

module.exports = new mongoose.model("User", userschema);