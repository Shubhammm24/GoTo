const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver"
        },

        pickupLocation: {
            address: String,
            coordinates: [Number], // [lng, lat]
            contactName: String,
            contactPhone: String
        },

        dropoffLocation: {
            address: String,
            coordinates: [Number], // [lng, lat]
            contactName: String,
            contactPhone: String
        },

        parcelDetails: {
            description: String,
            weight: Number, // in kg
            dimensions: {
                length: Number,
                width: Number,
                height: Number
            },
            value: Number, // declared value
            fragile: { type: Boolean, default: false }
        },

        vehicleTypeRequired: {
            type: String,
            enum: ["bike", "scooter", "car"],
            default: "bike"
        },

        estimatedDistance: Number,
        actualDistance: Number,

        pricing: {
            baseFare: Number,
            distanceFare: Number,
            weightCharge: Number,
            totalAmount: Number
        },

        status: {
            type: String,
            enum: [
                "pending",
                "driver_assigned",
                "picked_up",
                "in_transit",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending"
        },

        paymentMethod: {
            type: String,
            enum: ["credit_card", "debit_card", "wallet", "upi"]
        },

        scheduledPickupTime: Date,
        actualPickupTime: Date,
        actualDeliveryTime: Date,

        images: [String], // parcel photos
        deliveryProof: String, // delivery confirmation photo

        specialInstructions: String
    },
    { timestamps: true }
);

module.exports = mongoose.model("Parcel", parcelSchema);
