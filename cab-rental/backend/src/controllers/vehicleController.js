// Vehicle controller
const Vehicle = require("../models/Vehicle");

// Get all vehicles (admin)
exports.getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      message: "Vehicles retrieved successfully",
      vehicles,
      total: vehicles.length
    });
  } catch (error) {
    next(error);
  }
};

// Search vehicles based on location and filters
exports.searchVehicles = async (req, res, next) => {
  try {
    const { lat, lng, vehicleType, rentalType, maxDistance = 10000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location coordinates required" });
    }

    const query = {
      isAvailable: true,
      isActive: true
    };

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (rentalType) {
      query.$or = [
        { rentalType: rentalType },
        { rentalType: 'both' }
      ];
    }

    // Find vehicles near location
    const vehicles = await Vehicle.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
      .populate('ownerId', 'name phone rating')
      .limit(20);

    res.json({
      message: "Vehicles found",
      vehicles,
      total: vehicles.length
    });
  } catch (error) {
    next(error);
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('ownerId', 'name email phone');

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ vehicle });
  } catch (error) {
    next(error);
  }
};

// Create vehicle (admin)
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicleData = {
      ...req.body,
      ownerId: req.body.ownerId || req.user.id
    };

    // Ensure location is in correct GeoJSON format
    if (vehicleData.location && !vehicleData.location.type) {
      vehicleData.location = {
        type: "Point",
        coordinates: vehicleData.location.coordinates || [0, 0]
      };
    }

    const vehicle = await Vehicle.create(vehicleData);

    res.status(201).json({
      message: "Vehicle created successfully",
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Update vehicle (admin)
exports.updateVehicle = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Ensure location is in correct GeoJSON format if provided
    if (updates.location && !updates.location.type) {
      updates.location = {
        type: "Point",
        coordinates: updates.location.coordinates || [0, 0]
      };
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({
      message: "Vehicle updated successfully",
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Toggle vehicle availability (admin)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.isAvailable = !vehicle.isAvailable;
    await vehicle.save();

    res.json({
      message: `Vehicle ${vehicle.isAvailable ? 'enabled' : 'disabled'} successfully`,
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Delete vehicle (admin)
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get nearby drivers (for customers to see live availability)
exports.getNearbyDrivers = async (req, res, next) => {
  try {
    const { lat, lng, vehicleType, maxDistance = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location coordinates required" });
    }

    const query = {
      isOnDuty: true,
      isActive: true
    };

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    const drivers = await Driver.find({
      ...query,
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
      .select('name phone vehicleType currentLocation rating totalRides')
      .limit(10);

    res.json({
      message: "Nearby drivers found",
      drivers,
      total: drivers.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
