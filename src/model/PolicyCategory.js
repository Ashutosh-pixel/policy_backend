const mongoose = require("mongoose")

const policycategoryschema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
    },
    { timestamps: true }
);

policycategoryschema.index({ categoryName: 1 }, { unique: true });

module.exports = mongoose.model("PolicyCategory", policycategoryschema);