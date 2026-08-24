const mongoose = require("mongoose")

const policyinfoschema = new mongoose.Schema(
    {
        policyNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        policyStartDate: {
            type: Date,
            required: true,
        },

        policyEndDate: {
            type: Date,
            required: true,
        },

        policyCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PolicyCategory",
            required: true,
        },

        carrierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PolicyCarrier",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            required: true
        }
    },
    { timestamps: true }
);

policyinfoschema.index({ policyNumber: 1 }, { unique: true });
policyinfoschema.index({ userId: 1 });
policyinfoschema.index({ agentId: 1 });

module.exports = mongoose.model("PolicyInfo", policyinfoschema);