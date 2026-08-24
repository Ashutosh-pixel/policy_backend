const mongoose = require("mongoose")

const agentschema = new mongoose.Schema({
    agentName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    }
}, { timestamps: true });

agentschema.index({ agentName: 1 }, { unique: true });

module.exports = new mongoose.model("Agent", agentschema);