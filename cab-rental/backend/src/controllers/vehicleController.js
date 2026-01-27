const Vehicle = require("../models/Vehicle");

/**
 * @desc   Create a new vehicle
 * @route  POST /api/vehicles
 * @access Protected (Vehicle Owner)
 */
exports.createVehicle = async (req, res) => {
  try {
    const {
      vehicleType,
      licensePlate,
      brand,
      model,
      rentalType,
      pricePerHour,
      pricePerDay,
      location
    } = req.body;

    // Basic validation
    if (!vehicleType || !licensePlate || !brand || !model || !rentalType) {
      return res.status(400).json({
        message: "Missing required vehicle fields"
      });
    }

    const vehicle = await Vehicle.create({
      ownerId: req.user.id,          // from auth middleware
      vehicleType,
      licensePlate,
      brand,
      model,
      rentalType,
      pricePerHour,
      pricePerDay,
      location,
      isActive: false                // admin approval required
    });

    return res.status(201).json({
      message: "Vehicle created successfully",
      vehicle
    });
  } catch (error) {
    console.error("CREATE VEHICLE ERROR:", error);
    return res.status(500).json({
      message: "Failed to create vehicle",
      error: error.message
    });
  }
};

/**
 * @desc   Get all approved vehicles
 * @route  GET /api/vehicles
 * @access Public
 */
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isActive: true });

    return res.status(200).json(vehicles);
  } catch (error) {
    console.error("GET VEHICLES ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch vehicles"
    });
  }
};

/**
 * @desc   Get single vehicle by ID
 * @route  GET /api/vehicles/:id
 * @access Public
 */
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    return res.status(200).json(vehicle);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch vehicle"
    });
  }
};

/**
 * @desc   Update vehicle (owner only)
 * @route  PUT /api/vehicles/:id
 * @access Protected
 */
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(vehicle, req.body);
    await vehicle.save();

    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update vehicle"
    });
  }
};

/**
 * @desc   Delete vehicle (owner only)
 * @route  DELETE /api/vehicles/:id
 * @access Protected
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await vehicle.deleteOne();

    return res.status(200).json({
      message: "Vehicle deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete vehicle"
    });
  }
};