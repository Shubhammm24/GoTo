const Driver = require("../models/Driver");

exports.registerDriver = async (req, res, next) => {
  try {
    const { licenseNumber, licenseExpiry, yearsOfExperience } = req.body;

    if (!licenseNumber || !licenseExpiry || !yearsOfExperience) {
      return res.status(400).json({ message: "Missing required driver fields" });
    }

    const existingDriver = await Driver.findOne({ licenseNumber });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver with this license already exists" });
    }

    const driver = await Driver.create({
      userId: req.user.id,
      licenseNumber,
      licenseExpiry,
      yearsOfExperience,
      isApproved: false,
      isOnDuty: false
    });

    return res.status(201).json({
      message: "Driver registered successfully",
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