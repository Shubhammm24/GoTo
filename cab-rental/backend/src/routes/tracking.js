// Tracking routes
const router = require("express").Router();
const auth = require("../middleware/auth");
const tracking = require("../controllers/trackingController");

// Driver sends GPS updates
router.post("/update", auth(["driver"]), tracking.saveTracking);

// User gets live location
router.get("/live/:bookingId", auth(), tracking.getLiveLocation);

// Playback route
router.get("/history/:bookingId", auth(), tracking.getTrackingHistory);

// Stop tracking
router.post("/stop", auth(["driver"]), tracking.stopTracking);

module.exports = router;
