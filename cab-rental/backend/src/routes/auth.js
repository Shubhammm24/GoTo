const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { register, login, refreshToken, logout } = require("../controllers/authController");

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// REFRESH TOKEN
router.post("/refresh-token", refreshToken);

// LOGOUT (requires auth to identify user)
router.post("/logout", auth(), logout);

module.exports = router;
