const ChatMessage = require("../models/ChatMessage");
const Booking = require("../models/Booking");

/**
 * @desc   Get chat messages for a booking
 * @route  GET /api/chat/booking/:bookingId/messages
 * @access Protected (Customer/Driver of this booking)
 */
exports.getChatMessages = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId)
            .populate("customerId", "_id")
            .populate("driverId");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify user is part of this booking
        const isCustomer = booking.customerId._id.toString() === req.user.id;
        const isDriver = booking.driverId && booking.driverId.userId.toString() === req.user.id;

        if (!isCustomer && !isDriver) {
            return res.status(403).json({ message: "Not authorized to view this chat" });
        }

        // Get non-deleted messages
        const messages = await ChatMessage.find({
            bookingId,
            deletedAt: null
        })
            .populate("senderId", "name profileImage")
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Send chat message
 * @route  POST /api/chat/booking/:bookingId/message
 * @access Protected (Customer/Driver of this booking)
 */
exports.sendMessage = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        if (message.length > 500) {
            return res.status(400).json({ message: "Message too long (max 500 characters)" });
        }

        const booking = await Booking.findById(bookingId)
            .populate("customerId", "_id")
            .populate("driverId");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Only allow chat for active rides
        if (!["driver_assigned", "in_progress"].includes(booking.status)) {
            return res.status(400).json({
                message: "Chat is only available during active rides"
            });
        }

        // Verify user is part of this booking
        const isCustomer = booking.customerId._id.toString() === req.user.id;
        const isDriver = booking.driverId && booking.driverId.userId.toString() === req.user.id;

        if (!isCustomer && !isDriver) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const senderRole = isDriver ? "driver" : "customer";

        const chatMessage = await ChatMessage.create({
            bookingId,
            senderId: req.user.id,
            senderRole,
            message: message.trim()
        });

        await chatMessage.populate("senderId", "name profileImage");

        // Emit via Socket.io (will be set up in app.js)
        const io = req.app.get("io");
        if (io) {
            io.to(`booking-${bookingId}`).emit("new-message", chatMessage);
        }

        res.status(201).json({
            success: true,
            message: chatMessage
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Delete chat history (soft delete)
 * @route  DELETE /api/chat/booking/:bookingId/messages
 * @access Protected (Customer/Driver of this booking)
 */
exports.deleteChatHistory = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId)
            .populate("customerId", "_id")
            .populate("driverId");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify user is part of this booking
        const isCustomer = booking.customerId._id.toString() === req.user.id;
        const isDriver = booking.driverId && booking.driverId.userId.toString() === req.user.id;

        if (!isCustomer && !isDriver) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Soft delete all messages
        await ChatMessage.updateMany(
            { bookingId },
            { deletedAt: new Date() }
        );

        res.json({
            success: true,
            message: "Chat history deleted"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Mark messages as read
 * @route  PATCH /api/chat/booking/:bookingId/read
 * @access Protected
 */
exports.markMessagesAsRead = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        await ChatMessage.updateMany(
            {
                bookingId,
                senderId: { $ne: req.user.id },
                isRead: false
            },
            { isRead: true }
        );

        res.json({
            success: true,
            message: "Messages marked as read"
        });
    } catch (error) {
        next(error);
    }
};
