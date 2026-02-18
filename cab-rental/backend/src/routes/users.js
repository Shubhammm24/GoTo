const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMe, updateMe } = require("../controllers/userController");

// GET  /users/me — get own profile
router.get("/me", auth(), getMe);

// PUT  /users/me — update own profile
router.put("/me", auth(), updateMe);

module.exports = router;
