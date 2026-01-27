// Tracking socket handler
const Tracking = require("../models/Tracking");

module.exports = (io, socket) => {

  // Driver joins booking room
  socket.on("tracking:join", (bookingId) => {
    socket.join(bookingId);
  });

  // Driver sends GPS updates
  socket.on("tracking:update", async (data) => {
    const { bookingId, lat, lng, speed } = data;

    await Tracking.create({
      bookingId,
      location: {
        type: "Point",
        coordinates: [lng, lat]
      },
      speed,
      timestamp: new Date()
    });

    // Broadcast to user
    io.to(bookingId).emit("tracking:location", data);
  });
};
