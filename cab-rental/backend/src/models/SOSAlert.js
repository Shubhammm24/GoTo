const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking"
        },

        alertType: {
            type: String,
            enum: ["police", "emergency_contact", "platform_support"],
            required: true
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                required: true
            },
            address: String
        },

        status: {
            type: String,
            enum: ["active", "responded", "resolved", "false_alarm"],
            default: "active"
        },

        policeStationContacted: String,

        responseTime: Date,

        resolvedAt: Date,

        notes: String,

        metadata: {
            driverInfo: {
                name: String,
                phone: String,
                vehicleNumber: String
            },
            deviceInfo: String,
            batteryLevel: Number
        }
    },
    { timestamps: true }
);

// Geospatial index for location-based queries
sosAlertSchema.index({ location: "2dsphere" });

// Index for status queries
sosAlertSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SOSAlert", sosAlertSchema);
