const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const auth = require("../middleware/auth");
const {
  register,
  login,
  refreshToken,
  logout,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleAuth
} = require("../controllers/authController");

// Stricter rate limit for OTP endpoints (5 requests per minute per IP)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many OTP requests. Please try again in a minute." }
});

// REGISTER — creates user + sends OTPs
router.post("/register", register);

// VERIFY OTP — verify email or phone OTP
router.post("/verify-otp", otpLimiter, verifyOtp);

// RESEND OTP — resend OTP for email or phone
router.post("/resend-otp", otpLimiter, resendOtp);

// LOGIN
router.post("/login", login);

// FORGOT PASSWORD — send reset OTP
router.post("/forgot-password", otpLimiter, forgotPassword);

// RESET PASSWORD — verify OTP + set new password
router.post("/reset-password", otpLimiter, resetPassword);

// REFRESH TOKEN
router.post("/refresh-token", refreshToken);

// LOGOUT (requires auth)
router.post("/logout", auth(), logout);

// GOOGLE AUTH — sign in or sign up via Google
router.post("/google", googleAuth);

module.exports = router;
