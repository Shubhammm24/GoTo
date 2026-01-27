// Tracking controller
const Tracking = require("../models/Tracking");
const Booking = require("../models/Booking");

/**
 * 🔴 Save live tracking data
 * Called every 2–5 seconds by driver app
 */
exports.saveTracking = async (req, res, next) => {
  try {
    const {
      bookingId,
      vehicleId,
      lat,
      lng,
      speed,
      heading,
      accuracy
    } = req.body;

    if (!bookingId || !vehicleId || typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "Invalid tracking data" });
    }

    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    // Only allow tracking for active rides
    if (!["in_progress", "driver_assigned"].includes(booking.status))
      return res.status(400).json({ message: "Ride not active" });

    await Tracking.create({
      bookingId,
      vehicleId,
      location: {
        type: "Point",
        coordinates: [lng, lat]
      },
      speed: speed || 0,
      heading: heading || 0,
      accuracy: accuracy || 0,
      timestamp: new Date()
    });

    res.json({ message: "Tracking saved successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * 🟢 Get latest vehicle location
 * Used by customer live map
 */
exports.getLiveLocation = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const location = await Tracking.findOne({ bookingId })
      .sort({ createdAt: -1 })
      .select("location speed heading timestamp");

    if (!location)
      return res.status(404).json({ message: "No tracking data found" });

    res.json(location);
  } catch (error) {
    next(error);
  }
};

/**
 * 📜 Get full tracking history (route playback)
 * Used after ride completion
 */
exports.getTrackingHistory = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const history = await Tracking.find({ bookingId })
      .sort({ createdAt: 1 })
      .select("location timestamp speed");

    res.json({
      message: "Tracking history fetched",
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🚫 Stop tracking (called when ride ends)
 */
exports.stopTracking = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID required" });
    }

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "completed"
    }, { new: true });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Tracking stopped successfully", booking });
  } catch (error) {
    next(error);
  }
};
