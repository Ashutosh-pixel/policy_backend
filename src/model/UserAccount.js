const mongoose = require("mongoose")

const useraccountschema = new mongoose.Schema(
    {
        accountName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

useraccountschema.index({ accountName: 1 }, { unique: true });

module.exports = mongoose.model("UserAccount", useraccountschema);