const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth"); 
const driverController = require("../controllers/driverController");

// Register driver profile (protected)
router.post("/register", auth(["customer"]), driverController.registerDriver);

// Get driver profile (protected)
router.get("/me", auth(["driver"]), driverController.getMyDriverProfile);

module.exports = router;