// Booking controller
const Booking = require("../models/Booking");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");

exports.createBooking = async (req, res, next) => {
  try {
    const {
      vehicleId,
      estimatedDistance,
      estimatedDuration,
      vehicleType,
      rentalType,
      pickupLocation,
      dropoffLocation,
      totalAmount
    } = req.body;

    // Validation
    if (!vehicleType || !rentalType || !pickupLocation) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    // For driver-operated rides, dropoff is required
    if (rentalType === 'driver-operated' && !dropoffLocation) {
      return res.status(400).json({ message: "Dropoff location required for driver-operated rides" });
    }

    // For self-drive, vehicleId is required
    if (rentalType === 'self-drive' && !vehicleId) {
      return res.status(400).json({ message: "Vehicle selection required for self-drive" });
    }

    let vehicle = null;
    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle || !vehicle.isAvailable) {
        return res.status(400).json({ message: "Selected vehicle is not available" });
      }
    }

    const booking = await Booking.create({
      customerId: req.user.id,
      vehicleId: vehicleId || null,
      vehicleType,
      rentalType,
      pickupLocation,
      dropoffLocation: dropoffLocation || null,
      estimatedDistance: estimatedDistance || 0,
      estimatedDuration: estimatedDuration || 0,
      totalAmount: totalAmount || 0,
      status: rentalType === 'self-drive' ? 'confirmed' : 'pending',
      paymentStatus: 'pending'
    });

    // If self-drive, mark vehicle as unavailable
    if (rentalType === 'self-drive' && vehicle) {
      vehicle.isAvailable = false;
      await vehicle.save();
    }

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
      isActive: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: booking.pickupLocation.coordinates
          },
          $maxDistance: 5000 // 5km radius
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

/**
 * @desc   Get all bookings (admin only)
 * @route  GET /api/bookings
 * @access Protected (Admin)
 */
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name email phone")
      .populate("vehicleId", "vehicleType brand model licensePlate")
      .populate("driverId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get booking by ID
 * @route  GET /api/bookings/:id
 * @access Protected
 */
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("vehicleId")
      .populate("driverId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to view this booking
    if (
      req.user.role !== "admin" &&
      booking.customerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current user's bookings
 * @route  GET /api/bookings/user/me
 * @access Protected
 */
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate("vehicleId", "vehicleType brand model licensePlate")
      .populate("driverId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Cancel booking
 * @route  PATCH /api/bookings/:id/cancel
 * @access Protected
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only customer can cancel their own booking
    if (booking.customerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if booking can be cancelled
    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // TODO: Process refund based on cancellation policy
    // If payment was completed, initiate refund

    res.json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};
