const router = require("express").Router();
const auth = require("../middleware/auth");
const parcelController = require("../controllers/parcelController");

// Create parcel delivery request
router.post(
    "/",
    auth(["customer"]),
    parcelController.createParcel
);

// Get all parcels (admin)
router.get(
    "/",
    auth(["admin"]),
    parcelController.getAllParcels
);

// Get user's parcels
router.get(
    "/user/me",
    auth(["customer"]),
    parcelController.getMyParcels
);

// Get parcel by ID
router.get(
    "/:id",
    auth(),
    parcelController.getParcelById
);

// Assign driver to parcel (admin)
router.post(
    "/:id/assign-driver",
    auth(["admin"]),
    parcelController.assignDriver
);

// Confirm pickup (driver)
router.patch(
    "/:id/pickup",
    auth(["driver"]),
    parcelController.confirmPickup
);

// Confirm delivery (driver)
router.patch(
    "/:id/deliver",
    auth(["driver"]),
    parcelController.confirmDelivery
);

// Cancel parcel (customer/admin)
router.patch(
    "/:id/cancel",
    auth(["customer", "admin"]),
    parcelController.cancelParcel
);

module.exports = router;
