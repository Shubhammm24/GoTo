// Vehicle routes
const router = require("express").Router();
const auth = require("../middleware/auth");
const vehicleController = require("../controllers/vehicleController");

// Public routes
router.get("/search", vehicleController.searchVehicles);
router.get("/nearby-drivers", vehicleController.getNearbyDrivers);
router.get("/:id", vehicleController.getVehicleById);

// Admin routes
router.get("/", auth(["admin"]), vehicleController.getAllVehicles);
router.post("/", auth(["admin"]), vehicleController.createVehicle);
router.put("/:id", auth(["admin"]), vehicleController.updateVehicle);
router.patch("/:id/toggle-availability", auth(["admin"]), vehicleController.toggleAvailability);
router.delete("/:id", auth(["admin"]), vehicleController.deleteVehicle);

module.exports = router;