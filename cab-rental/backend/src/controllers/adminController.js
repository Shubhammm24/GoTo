const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const User = require("../models/User");

/* ─── Dashboard Stats ─────────────────────────────────────────── */
exports.dashboard = async (req, res, next) => {
  try {
    const [users, bookings, completedBookings, activeRides, pendingDrivers, pendingVehicles, revenue] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "in_progress" }),
      Driver.countDocuments({ isActive: false }),
      Vehicle.countDocuments({ isActive: false }),
      Booking.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, sum: { $sum: "$totalAmount" } } }
      ])
    ]);

    res.json({
      message: "Dashboard stats fetched",
      stats: {
        users,
        bookings,
        completedBookings,
        activeRides,
        pendingDrivers,
        pendingVehicles,
        revenue: revenue[0]?.sum || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Get all pending drivers (not yet approved) ──────────────── */
exports.getPendingDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ isActive: false })
      .populate("userId", "name email phone createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: drivers.length, drivers });
  } catch (error) {
    next(error);
  }
};

/* ─── Approve driver ──────────────────────────────────────────── */
exports.approveDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isActive: true, isApproved: true },
      { new: true }
    ).populate("userId", "name email");

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json({ message: "Driver approved successfully", driver });
  } catch (error) {
    next(error);
  }
};

/* ─── Reject / deactivate driver ─────────────────────────────── */
exports.rejectDriver = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isActive: false, rejectionReason: reason || "Rejected by admin" },
      { new: true }
    );

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json({ message: "Driver rejected", driver });
  } catch (error) {
    next(error);
  }
};

/* ─── Get all pending vehicles (not yet approved) ─────────────── */
exports.getPendingVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ isActive: false })
      .populate("ownerId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
};

/* ─── Approve vehicle ─────────────────────────────────────────── */
exports.approveVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isActive: true, isAvailable: true },
      { new: true }
    ).populate("ownerId", "name email");

    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.json({ message: "Vehicle approved successfully", vehicle });
  } catch (error) {
    next(error);
  }
};

/* ─── Reject vehicle ──────────────────────────────────────────── */
exports.rejectVehicle = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isActive: false, rejectionReason: reason || "Rejected by admin" },
      { new: true }
    );

    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.json({ message: "Vehicle rejected", vehicle });
  } catch (error) {
    next(error);
  }
};

/* ─── Get all vehicles (fleet management) ─────────────────────── */
exports.getAllVehicles = async (req, res, next) => {
  try {
    const { type, isActive, isAvailable } = req.query;
    const query = {};
    if (type) query.vehicleType = type;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";

    const vehicles = await Vehicle.find(query)
      .populate("ownerId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
};

/* ─── Add vehicle (admin adds self-drive fleet vehicles) ──────── */
exports.addVehicle = async (req, res, next) => {
  try {
    const {
      vehicleType, licensePlate, brand, model, year,
      seatCapacity, rentalType, pricePerHour, pricePerDay,
      registrationDoc, insuranceDoc, images
    } = req.body;

    if (!vehicleType || !licensePlate || !brand || !model) {
      return res.status(400).json({ message: "Missing required vehicle fields" });
    }

    const vehicle = await Vehicle.create({
      ownerId: req.user.id, // admin is the owner
      vehicleType,
      licensePlate,
      brand,
      model,
      year: year || new Date().getFullYear(),
      seatCapacity: seatCapacity || 4,
      rentalType: rentalType || "self-drive",
      pricePerHour: pricePerHour || 0,
      pricePerDay: pricePerDay || 0,
      registrationDoc,
      insuranceDoc,
      images: images || [],
      isActive: true,
      isAvailable: true
    });

    res.status(201).json({ message: "Vehicle added successfully", vehicle });
  } catch (error) {
    next(error);
  }
};

/* ─── Update vehicle ──────────────────────────────────────────── */
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.json({ message: "Vehicle updated", vehicle });
  } catch (error) {
    next(error);
  }
};

/* ─── Delete vehicle ──────────────────────────────────────────── */
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    next(error);
  }
};

/* ─── Get all users ───────────────────────────────────────────── */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/* ─── Get all drivers ─────────────────────────────────────────── */
exports.getAllDrivers = async (req, res, next) => {
  try {
    const { isActive, isOnDuty } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (isOnDuty !== undefined) query.isOnDuty = isOnDuty === "true";

    const drivers = await Driver.find(query)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: drivers.length, drivers });
  } catch (error) {
    next(error);
  }
};

/* ─── Get all bookings ────────────────────────────────────────── */
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("customerId", "name email phone")
      .populate("driverId")
      .populate("vehicleId", "vehicleType brand model licensePlate")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

/* ─── Get live vehicle locations (on-duty drivers) ────────────── */
exports.getLiveLocations = async (req, res, next) => {
  try {
    const drivers = await Driver.find({
      isOnDuty: true,
      isActive: true,
      "currentLocation.coordinates": { $exists: true, $ne: [] }
    })
      .populate("userId", "name phone")
      .select("currentLocation userId isOnDuty rating completedRides");

    const locations = drivers.map(d => ({
      driverId: d._id,
      name: d.userId?.name,
      phone: d.userId?.phone,
      coordinates: d.currentLocation?.coordinates,
      rating: d.rating,
      completedRides: d.completedRides
    }));

    res.json({ success: true, count: locations.length, locations });
  } catch (error) {
    next(error);
  }
};

/* ─── Get SOS / emergency alerts ─────────────────────────────── */
exports.getSosAlerts = async (req, res, next) => {
  try {
    const sosBookings = await Booking.find({
      "safetyStatus.sosActivated": true
    })
      .populate("customerId", "name phone")
      .populate("driverId")
      .sort({ "safetyStatus.sosTimestamp": -1 })
      .limit(20);

    res.json({ success: true, count: sosBookings.length, alerts: sosBookings });
  } catch (error) {
    next(error);
  }
};

/* ─── Resolve SOS alert ───────────────────────────────────────── */
exports.resolveSos = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { "safetyStatus.sosActivated": false },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "SOS alert resolved", booking });
  } catch (error) {
    next(error);
  }
};
