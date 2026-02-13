const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        senderRole: {
            type: String,
            enum: ["customer", "driver"],
            required: true
        },

        message: {
            type: String,
            required: true,
            maxlength: 500
        },

        messageType: {
            type: String,
            enum: ["text", "system"],
            default: "text"
        },

        isRead: {
            type: Boolean,
            default: false
        },

        deletedAt: Date // Soft delete after ride completion
    },
    { timestamps: true }
);

// Index for faster queries
chatMessageSchema.index({ bookingId: 1, createdAt: 1 });

// Auto-delete messages 24 hours after creation (GDPR compliance)
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
