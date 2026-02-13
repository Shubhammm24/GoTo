const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        relationship: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        priority: {
            type: Number,
            default: 1,
            min: 1,
            max: 5
        }
    },
    { timestamps: true }
);

// Index for user lookups
emergencyContactSchema.index({ userId: 1, priority: 1 });

module.exports = mongoose.model("EmergencyContact", emergencyContactSchema);
