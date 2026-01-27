const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const User = require("../models/User");

exports.dashboard = async (req, res, next) => {
  try {
    const users = await User.countDocuments();
    const bookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const revenue = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, sum: { $sum: "$totalAmount" } } }
    ]);

    res.json({
      message: "Dashboard stats fetched",
      stats: {
        users,
        bookings,
        completedBookings,
        revenue: revenue[0]?.sum || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json({
      message: "Driver approved successfully",
      driver
    });
  } catch (error) {
    next(error);
  }
};

exports.approveVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({
      message: "Vehicle approved successfully",
      vehicle
    });
  } catch (error) {
    next(error);
  }
};
