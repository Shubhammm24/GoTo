// Booking controller
const Booking = require("../models/Booking");
const Driver = require("../models/Driver");

exports.createBooking = async (req, res, next) => {
  try {
    const {
      estimatedDistance,
      estimatedDuration,
      vehicleType,
      pickupLocation,
      dropoffLocation
    } = req.body;

    // Validation
    if (!estimatedDistance || !estimatedDuration || !vehicleType || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const baseFare = vehicleType === "bike" ? 30 : 50;
    const perKm = vehicleType === "bike" ? 7 : 12;
    const perMin = vehicleType === "bike" ? 1 : 2;
    const surge = 1.2;

    const totalAmount =
      (baseFare +
        estimatedDistance * perKm +
        estimatedDuration * perMin) * surge;

    const booking = await Booking.create({
      ...req.body,
      customerId: req.user.id,
      baseFare,
      distanceFare: estimatedDistance * perKm,
      timeFare: estimatedDuration * perMin,
      surgePricing: surge,
      totalAmount
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};

exports.assignDriver = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const driver = await Driver.findOne({
      isOnDuty: true,
      currentLocation: {
        $near: {
          $geometry: booking.pickupLocation,
          $maxDistance: 5000
        }
      }
    });

    if (!driver) {
      return res.status(404).json({ message: "No available drivers" });
    }

    booking.driverId = driver._id;
    booking.status = "driver_assigned";
    await booking.save();

    res.json({
      message: "Driver assigned successfully",
      booking,
      driver
    });
  } catch (error) {
    next(error);
  }
};

exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "completed", paymentStatus: "completed", dropoffTime: new Date() },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking completed successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};
