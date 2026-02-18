const Driver = require("../models/Driver");
const Booking = require("../models/Booking");

exports.registerDriver = async (req, res, next) => {
  try {
    const { licenseNumber, licenseExpiry, yearsOfExperience, vehicleDetails, bankDetails } = req.body;

    if (!licenseNumber || !licenseExpiry || !yearsOfExperience) {
      return res.status(400).json({ message: "Missing required driver fields" });
    }

    const existingDriver = await Driver.findOne({ licenseNumber });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver with this license already exists" });
    }

    // Check if user already has a driver profile
    const existingProfile = await Driver.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: "You already have a driver profile" });
    }

    const driver = await Driver.create({
      userId: req.user.id,
      licenseNumber,
      licenseExpiry,
      yearsOfExperience,
      vehicleDetails, // { brand, model, licensePlate, vehicleType, color, year }
      bankDetails,    // { accountNumber, ifsc, accountName }
      isApproved: false,
      isActive: false, // Ensure they are inactive until approved
      isOnDuty: false
    });

    return res.status(201).json({
      message: "Driver registered successfully. Pending admin approval.",
      driver
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id }).populate("userId", "-password");

    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    return res.status(200).json({
      message: "Driver profile fetched",
      driver
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Complete driver registration with documents
 * @route  PUT /api/drivers/complete-registration
 * @access Protected (Driver)
 */
exports.completeRegistration = async (req, res, next) => {
  try {
    const {
      licenseDoc,
      bankDetails,
      vehicleDetails,
      profilePhoto
    } = req.body;

    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    // Update driver profile
    if (licenseDoc) driver.licenseDoc = licenseDoc;
    if (bankDetails) driver.bankDetails = bankDetails;
    if (profilePhoto) driver.profilePhoto = profilePhoto;

    await driver.save();

    res.json({
      message: "Driver registration completed. Pending admin approval.",
      driver
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Toggle driver availability (on/off duty)
 * @route  PATCH /api/drivers/toggle-availability
 * @access Protected (Driver)
 */
exports.toggleAvailability = async (req, res, next) => {
  try {
    const { isOnDuty, currentLocation } = req.body;

    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    if (!driver.isActive) {
      return res.status(403).json({
        message: "Driver account not approved by admin"
      });
    }

    driver.isOnDuty = isOnDuty;

    // Update location if going on duty
    if (isOnDuty && currentLocation) {
      driver.currentLocation = {
        type: "Point",
        coordinates: currentLocation.coordinates
      };
    }

    await driver.save();

    res.json({
      message: `Driver is now ${isOnDuty ? 'ON' : 'OFF'} duty`,
      driver
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update driver's current location
 * @route  PATCH /api/drivers/update-location
 * @access Protected (Driver)
 */
exports.updateLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        message: "Valid coordinates [lng, lat] required"
      });
    }

    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.currentLocation = {
      type: "Point",
      coordinates
    };

    await driver.save();

    res.json({
      message: "Location updated successfully",
      location: driver.currentLocation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get rides assigned to driver
 * @route  GET /api/drivers/assigned-rides
 * @access Protected (Driver)
 */
exports.getAssignedRides = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const rides = await Booking.find({
      driverId: driver._id,
      status: { $in: ["driver_assigned", "in_progress"] }
    })
      .populate("customerId", "name phone")
      .populate("vehicleId", "vehicleType brand model licensePlate")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rides.length,
      rides
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Accept ride request
 * @route  POST /api/drivers/rides/:rideId/accept
 * @access Protected (Driver)
 */
exports.acceptRide = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const booking = await Booking.findById(req.params.rideId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if already assigned to this driver
    if (booking.driverId && booking.driverId.toString() !== driver._id.toString()) {
      return res.status(400).json({
        message: "Ride already assigned to another driver"
      });
    }

    booking.driverId = driver._id;
    booking.status = "driver_assigned";
    await booking.save();

    res.json({
      message: "Ride accepted successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Reject ride request
 * @route  POST /api/drivers/rides/:rideId/reject
 * @access Protected (Driver)
 */
exports.rejectRide = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const booking = await Booking.findById(req.params.rideId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if assigned to this driver
    if (booking.driverId && booking.driverId.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove driver assignment and set status back to pending
    booking.driverId = null;
    booking.status = "pending";
    await booking.save();

    res.json({
      message: "Ride rejected",
      reason: reason || "Driver rejected the ride"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Start ride
 * @route  POST /api/drivers/rides/:rideId/start
 * @access Protected (Driver)
 */
exports.startRide = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const booking = await Booking.findById(req.params.rideId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.driverId.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "driver_assigned") {
      return res.status(400).json({
        message: "Ride must be in driver_assigned status to start"
      });
    }

    booking.status = "in_progress";
    booking.actualStartTime = new Date();
    await booking.save();

    res.json({
      message: "Ride started successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get driver earnings summary
 * @route  GET /api/drivers/earnings
 * @access Protected (Driver)
 */
exports.getEarnings = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Get completed rides
    const completedRides = await Booking.find({
      driverId: driver._id,
      status: "completed"
    });

    // Calculate earnings
    const totalEarnings = completedRides.reduce((sum, ride) => {
      return sum + (ride.pricing?.totalAmount || 0);
    }, 0);

    res.json({
      success: true,
      earnings: {
        totalEarnings: driver.earnings?.totalEarnings || totalEarnings,
        pendingAmount: driver.earnings?.pendingAmount || 0,
        withdrawnAmount: driver.earnings?.withdrawnAmount || 0,
        availableBalance: (driver.earnings?.totalEarnings || 0) - (driver.earnings?.withdrawnAmount || 0)
      },
      completedRides: driver.completedRides,
      recentRides: completedRides.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get driver ride history
 * @route  GET /api/drivers/ride-history
 * @access Protected (Driver)
 */
exports.getRideHistory = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const { page = 1, limit = 20, status } = req.query;

    const query = { driverId: driver._id };
    if (status) {
      query.status = status;
    }

    const rides = await Booking.find(query)
      .populate("customerId", "name phone rating")
      .populate("vehicleId", "vehicleType brand model")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      rides
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all drivers (admin)
 * @route  GET /api/drivers
 * @access Protected (Admin)
 */
exports.getAllDrivers = async (req, res, next) => {
  try {
    const { isActive, isOnDuty } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (isOnDuty !== undefined) query.isOnDuty = isOnDuty === "true";

    const drivers = await Driver.find(query)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: drivers.length,
      drivers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get pending ride requests near driver's location
 * @route  GET /api/drivers/pending-rides
 * @access Protected (Driver)
 */
exports.getPendingRides = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.isOnDuty) {
      return res.json({ success: true, rides: [], message: "Driver is off duty" });
    }

    // Fetch pending driver-operated bookings not yet assigned
    const rides = await Booking.find({
      status: { $in: ["pending", "requested"] },
      rentalType: "driver-operated",
      driverId: null
    })
      .populate("customerId", "name phone rating")
      .sort({ createdAt: -1 })
      .limit(20);

    // Haversine helper
    const haversine = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
    };

    const driverCoords = driver.currentLocation?.coordinates; // [lng, lat]

    const enriched = rides
      .map(ride => {
        const distKm = ride.estimatedDistance || 0;
        const estimatedEarnings = ride.totalAmount
          ? Math.round(ride.totalAmount * 0.8)
          : Math.round(12 + distKm * 2);

        let distToPickup = null;
        const pc = ride.pickupLocation?.coordinates; // [lng, lat]
        if (driverCoords && driverCoords.length === 2 && pc && pc.length === 2) {
          distToPickup = haversine(driverCoords[1], driverCoords[0], pc[1], pc[0]);
        }

        return { ...ride.toObject(), estimatedEarnings, distToPickup };
      })
      // Sort by distance to pickup (nulls last), then limit to 5 closest
      .sort((a, b) => {
        if (a.distToPickup == null) return 1;
        if (b.distToPickup == null) return -1;
        return a.distToPickup - b.distToPickup;
      })
      .filter(r => r.distToPickup == null || r.distToPickup <= 15) // within 15km
      .slice(0, 5);

    res.json({ success: true, count: enriched.length, rides: enriched });
  } catch (error) {
    next(error);
  }
};
