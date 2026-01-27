const Booking = require("../models/Booking");
const Driver = require("../models/Driver");

module.exports = (io, socket) => {

  // 🚕 Customer requests a ride
  socket.on("ride:request", async (bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    // Find nearby drivers
    const drivers = await Driver.find({
      isOnDuty: true,
      isActive: true
    }).limit(5);

    drivers.forEach(driver => {
      io.to(driver.userId.toString()).emit("ride:incoming", booking);
    });
  });

  // ✅ Driver accepts ride
  socket.on("ride:accept", async ({ bookingId }) => {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        driverId: socket.user.id,
        status: "driver_assigned"
      },
      { new: true }
    );

    await Driver.findOneAndUpdate(
      { userId: socket.user.id },
      { isOnDuty: false }
    );

    // Notify customer
    io.to(booking.customerId.toString())
      .emit("ride:accepted", booking);
  });

  // ❌ Driver rejects ride
  socket.on("ride:reject", ({ bookingId }) => {
    socket.emit("ride:rejected", bookingId);
  });

  // ▶ Ride started
  socket.on("ride:start", async (bookingId) => {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "in_progress" },
      { new: true }
    );

    io.to(booking.customerId.toString())
      .emit("ride:started", booking);
  });

  // ⏹ Ride ended
  socket.on("ride:end", async (bookingId) => {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "completed" },
      { new: true }
    );

    io.to(booking.customerId.toString())
      .emit("ride:completed", booking);
  });
};
