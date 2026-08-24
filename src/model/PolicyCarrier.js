const mongoose = require("mongoose")


const policycarrierschema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
    },
    { timestamps: true }
);

policycarrierschema.index({ companyName: 1 }, { unique: true });

module.exports = mongoose.model("PolicyCarrier", policycarrierschema);