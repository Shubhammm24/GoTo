const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const vehicleController = require("../controllers/vehicleController");

router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);

router.post("/", auth(["vehicle_owner"]), vehicleController.createVehicle);
router.put("/:id", auth(["vehicle_owner"]), vehicleController.updateVehicle);
router.delete("/:id", auth(["vehicle_owner"]), vehicleController.deleteVehicle);

module.exports = router;