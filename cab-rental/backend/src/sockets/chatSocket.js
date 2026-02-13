// Socket.io handler for real-time chat

module.exports = (io, socket) => {
    console.log(`[Chat Socket] User connected: ${socket.id}`);

    // Store user info in socket (set by auth middleware)
    const user = socket.user;

    // Join booking chat room
    socket.on("join-ride-chat", (bookingId) => {
        socket.join(`booking-${bookingId}`);
        console.log(`[Chat] User ${user?.name || socket.id} joined chat for booking ${bookingId}`);

        socket.to(`booking-${bookingId}`).emit("user-joined", {
            userId: user?.id,
            role: user?.role,
            name: user?.name
        });
    });

    // Send message
    socket.on("send-message-realtime", (data) => {
        const { bookingId, message } = data;

        if (!message || message.trim().length === 0 || message.length > 500) {
            socket.emit("error", { message: "Invalid message" });
            return;
        }

        io.to(`booking-${bookingId}`).emit("new-message", {
            bookingId,
            senderId: user?.id,
            senderRole: user?.role,
            senderName: user?.name,
            message: message.trim(),
            timestamp: new Date()
        });
    });

    // Typing indicators
    socket.on("typing", (bookingId) => {
        socket.to(`booking-${bookingId}`).emit("user-typing", {
            userId: user?.id,
            role: user?.role,
            name: user?.name
        });
    });

    socket.on("stop-typing", (bookingId) => {
        socket.to(`booking-${bookingId}`).emit("user-stopped-typing", { userId: user?.id });
    });

    // Leave chat
    socket.on("leave-ride-chat", (bookingId) => {
        socket.leave(`booking-${bookingId}`);
        socket.to(`booking-${bookingId}`).emit("user-left", { userId: user?.id, role: user?.role });
    });

    // Location updates
    socket.on("update-location", (data) => {
        const { bookingId, location } = data;
        socket.to(`booking-${bookingId}`).emit("location-updated", {
            userId: user?.id,
            role: user?.role,
            location,
            timestamp: new Date()
        });
    });

    // SOS alert
    socket.on("sos-alert", (data) => {
        const { bookingId, location, alertType } = data;
        io.to("admin-room").emit("sos-triggered", {
            userId: user?.id,
            userName: user?.name,
            bookingId,
            location,
            alertType,
            timestamp: new Date()
        });
        console.log(`[SOS] Alert from user ${user?.id}, type: ${alertType}`);
    });
};
