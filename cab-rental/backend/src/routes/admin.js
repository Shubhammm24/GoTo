const router = require("express").Router();
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// Admin dashboard
router.get(
  "/dashboard",
  auth(["admin"]),
  adminController.dashboard
);

// Approvals
router.post(
  "/drivers/:id/approve",
  auth(["admin"]),
  adminController.approveDriver
);

router.post(
  "/vehicles/:id/approve",
  auth(["admin"]),
  adminController.approveVehicle
);

module.exports = router;
