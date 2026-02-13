const router = require("express").Router();
const auth = require("../middleware/auth");
const emergencyController = require("../controllers/emergencyController");

// Emergency Contacts Management
router.post(
    "/contacts",
    auth(),
    emergencyController.addEmergencyContact
);

router.get(
    "/contacts",
    auth(),
    emergencyController.getEmergencyContacts
);

router.put(
    "/contacts/:id",
    auth(),
    emergencyController.updateEmergencyContact
);

router.delete(
    "/contacts/:id",
    auth(),
    emergencyController.deleteEmergencyContact
);

// SOS and Emergency Alerts
router.post(
    "/sos",
    auth(),
    emergencyController.triggerSOS
);

router.post(
    "/share-location/:bookingId",
    auth(),
    emergencyController.shareLiveLocation
);

// Safety Settings
router.patch(
    "/settings",
    auth(),
    emergencyController.updateSafetySettings
);

// Admin Routes
router.get(
    "/sos-alerts",
    auth(["admin"]),
    emergencyController.getSOSAlerts
);

router.patch(
    "/sos-alerts/:id/resolve",
    auth(["admin"]),
    emergencyController.resolveSOSAlert
);

module.exports = router;
