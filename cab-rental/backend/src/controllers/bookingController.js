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

    // For self-drive: atomically check and reserve vehicle to prevent race conditions
    let vehicle = null;
    if (vehicleId) {
      if (rentalType === 'self-drive') {
        // Atomic check-and-update to prevent double-booking
        vehicle = await Vehicle.findOneAndUpdate(
          { _id: vehicleId, isAvailable: true },
          { isAvailable: false },
          { new: true }
        );
        if (!vehicle) {
          return res.status(400).json({ message: "Selected vehicle is not available" });
        }
      } else {
        vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || !vehicle.isAvailable) {
          return res.status(400).json({ message: "Selected vehicle is not available" });
        }
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
      status: rentalType === 'self-drive' ? 'confirmed' : 'requested',
      paymentStatus: 'pending'
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
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Authorization: verify the requesting driver is the assigned driver
    const driver = await Driver.findOne({ userId: req.user.id });
    if (!driver || !booking.driverId || booking.driverId.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this booking" });
    }

    if (booking.status !== "in_progress") {
      return res.status(400).json({ message: "Booking must be in_progress to complete" });
    }

    booking.status = "completed";
    booking.paymentStatus = "completed";
    booking.dropoffTime = new Date();
    booking.actualEndTime = new Date();
    await booking.save();

    // If self-drive, release the vehicle
    if (booking.rentalType === 'self-drive' && booking.vehicleId) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: true });
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
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("customerId", "name email phone")
      .populate("vehicleId", "vehicleType brand model licensePlate")
      .populate("driverId")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
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
    const { page = 1, limit = 20, status } = req.query;
    const query = { customerId: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("vehicleId", "vehicleType brand model licensePlate")
      .populate("driverId")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
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
