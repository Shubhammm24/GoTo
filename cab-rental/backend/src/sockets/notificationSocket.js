// Notification socket handler
module.exports = (io, socket) => {

  // Generic notification
  socket.on("notify", ({ toUserId, message }) => {
    io.to(toUserId).emit("notification", {
      message,
      time: new Date()
    });
  });

};
