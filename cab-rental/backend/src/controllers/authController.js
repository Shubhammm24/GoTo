const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { createAndSendOtp, verifyOtp } = require("../services/otpService");
const Otp = require("../models/Otp");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Password Validation ─────────────────────────────────────
const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must include a number";
  return null;
};

// ─── Generate Refresh Token ──────────────────────────────────
const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await RefreshToken.create({ userId, token, expiresAt });
  return token;
};

// ─── REGISTER ────────────────────────────────────────────────
// Step 1: Create user → send OTPs to email + phone
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role — only customer and driver can self-register
    const validRoles = ["customer", "driver"];
    const userRole = validRoles.includes(role) ? role : "customer";

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Check for existing users separately for better error messages
    const existingByEmail = await User.findOne({ email });
    const existingByPhone = await User.findOne({ phone });

    // If a verified user already has this email or phone — block
    if (existingByEmail && existingByEmail.isVerified) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    if (existingByPhone && existingByPhone.isVerified && 
        (!existingByEmail || existingByEmail._id.toString() !== existingByPhone._id.toString())) {
      return res.status(400).json({ message: "An account with this phone number already exists" });
    }

    // If an unverified user exists by email, reuse that record
    if (existingByEmail && !existingByEmail.isVerified) {
      // If a different unverified user has the same phone, remove it
      if (existingByPhone && existingByPhone._id.toString() !== existingByEmail._id.toString() && !existingByPhone.isVerified) {
        await Otp.deleteMany({ userId: existingByPhone._id });
        await User.deleteOne({ _id: existingByPhone._id });
      }

      existingByEmail.name = name;
      existingByEmail.password = await bcrypt.hash(password, 12);
      existingByEmail.phone = phone;
      existingByEmail.isEmailVerified = false;
      existingByEmail.isPhoneVerified = false;
      existingByEmail.isVerified = false;
      await existingByEmail.save();

      const emailResult = await createAndSendOtp(existingByEmail._id, "email", email, "registration");
      const phoneResult = await createAndSendOtp(existingByEmail._id, "phone", phone, "registration");

      return res.status(200).json({
        message: "Verification OTPs sent to your email and phone",
        userId: existingByEmail._id,
        pendingVerification: true,
        ...(process.env.NODE_ENV !== "production" && {
          dev: { emailOtp: emailResult.devCode, phoneOtp: phoneResult.devCode }
        })
      });
    }

    // If an unverified user exists by phone only (no email match)
    if (existingByPhone && !existingByPhone.isVerified) {
      existingByPhone.name = name;
      existingByPhone.email = email;
      existingByPhone.password = await bcrypt.hash(password, 12);
      existingByPhone.isEmailVerified = false;
      existingByPhone.isPhoneVerified = false;
      existingByPhone.isVerified = false;
      await existingByPhone.save();

      const emailResult = await createAndSendOtp(existingByPhone._id, "email", email, "registration");
      const phoneResult = await createAndSendOtp(existingByPhone._id, "phone", phone, "registration");

      return res.status(200).json({
        message: "Verification OTPs sent to your email and phone",
        userId: existingByPhone._id,
        pendingVerification: true,
        ...(process.env.NODE_ENV !== "production" && {
          dev: { emailOtp: emailResult.devCode, phoneOtp: phoneResult.devCode }
        })
      });
    }

    // Brand new user
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: userRole
    });

    const emailResult = await createAndSendOtp(user._id, "email", email, "registration");
    const phoneResult = await createAndSendOtp(user._id, "phone", phone, "registration");

    res.status(201).json({
      message: "Account created! Verification OTPs sent to your email and phone.",
      userId: user._id,
      pendingVerification: true,
      ...(process.env.NODE_ENV !== "production" && {
        dev: { emailOtp: emailResult.devCode, phoneOtp: phoneResult.devCode }
      })
    });
  } catch (error) {
    console.error("Register error:", error);
    // Handle MongoDB duplicate key errors gracefully
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      return res.status(400).json({
        message: `An account with this ${field || "information"} already exists`
      });
    }
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// ─── VERIFY OTP ──────────────────────────────────────────────
// Step 2: Verify email or phone OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, code, type } = req.body;

    if (!userId || !code || !type) {
      return res.status(400).json({ message: "userId, code, and type are required" });
    }

    if (!["email", "phone"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'email' or 'phone'" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await verifyOtp(userId, code, type, "registration");

    if (!result.valid) {
      return res.status(400).json({ message: result.message });
    }

    // Mark the appropriate field as verified
    if (type === "email") {
      user.isEmailVerified = true;
    } else {
      user.isPhoneVerified = true;
    }

    // If both are verified, mark the user as fully verified
    if (user.isEmailVerified && user.isPhoneVerified) {
      user.isVerified = true;
    }

    await user.save();

    res.json({
      message: `${type === "email" ? "Email" : "Phone"} verified successfully!`,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isFullyVerified: user.isVerified
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ─── RESEND OTP ──────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const { userId, type } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ message: "userId and type are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already verified for this type
    if (type === "email" && user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    if (type === "phone" && user.isPhoneVerified) {
      return res.status(400).json({ message: "Phone is already verified" });
    }

    // Rate limit: check if OTP was sent in the last 60 seconds
    const recentOtp = await Otp.findOne({
      userId,
      type,
      purpose: "registration",
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOtp) {
      const waitSeconds = Math.ceil((recentOtp.createdAt.getTime() + 60000 - Date.now()) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSeconds} seconds before requesting a new OTP`,
        retryAfter: waitSeconds
      });
    }

    const destination = type === "email" ? user.email : user.phone;
    const result = await createAndSendOtp(userId, type, destination, "registration");

    res.json({
      message: `OTP resent to your ${type}`,
      ...(process.env.NODE_ENV !== "production" && {
        dev: { otp: result.devCode }
      })
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // For old users created before OTP system:
    // If they don't have isEmailVerified/isPhoneVerified fields set but
    // have a valid account, auto-verify them
    if (user.isEmailVerified === undefined || user.isEmailVerified === null) {
      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      user.isVerified = true;
      await user.save();
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Send fresh OTPs so user can verify
      const emailResult = await createAndSendOtp(user._id, "email", user.email, "registration");
      const phoneResult = await createAndSendOtp(user._id, "phone", user.phone, "registration");

      return res.status(403).json({
        message: "Please verify your email and phone number first",
        userId: user._id,
        pendingVerification: true,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        ...(process.env.NODE_ENV !== "production" && {
          dev: { emailOtp: emailResult.devCode, phoneOtp: phoneResult.devCode }
        })
      });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = await generateRefreshToken(user._id);

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: "If this email exists, a reset OTP has been sent." });
    }

    const result = await createAndSendOtp(user._id, "email", email, "forgot-password");

    res.json({
      message: "If this email exists, a reset OTP has been sent.",
      userId: user._id,
      ...(process.env.NODE_ENV !== "production" && {
        dev: { otp: result.devCode }
      })
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { userId, code, newPassword } = req.body;

    if (!userId || !code || !newPassword) {
      return res.status(400).json({ message: "userId, code, and newPassword are required" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const result = await verifyOtp(userId, code, "email", "forgot-password");

    if (!result.valid) {
      return res.status(400).json({ message: result.message });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Invalidate all refresh tokens for security
    await RefreshToken.deleteMany({ userId });

    res.json({ message: "Password reset successfully. Please login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};

// ─── REFRESH TOKEN ───────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) await storedToken.deleteOne();
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Rotate refresh token
    await storedToken.deleteOne();
    const newRefreshToken = await generateRefreshToken(user._id);

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token: accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(500).json({ message: "Token refresh failed" });
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.findOneAndDelete({ token: refreshToken });
    }
    await RefreshToken.deleteMany({ userId: req.user.id });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// ─── GOOGLE AUTH (Login / Register) ──────────────────────────
// Accepts a Google access_token from the frontend (implicit flow),
// fetches user info from Google, then finds-or-creates a user
// and returns a JWT + refreshToken pair.
exports.googleAuth = async (req, res) => {
  try {
    const { idToken, role } = req.body; // idToken is actually the access_token from implicit flow

    if (!idToken) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Fetch user info from Google using the access token
    let googleUser;
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (!response.ok) {
        return res.status(401).json({ message: "Invalid Google token" });
      }

      googleUser = await response.json();
    } catch (err) {
      console.error("Google userinfo fetch error:", err);
      return res.status(401).json({ message: "Failed to verify Google token" });
    }

    const { sub: googleId, email, name, picture, email_verified } = googleUser;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Could not retrieve user info from Google" });
    }

    if (email_verified === false) {
      return res.status(400).json({ message: "Google account email is not verified" });
    }

    // Try to find an existing user by Google ID or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google account to existing local user if needed
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && !user.profileImage) user.profileImage = picture;
        // Mark email verified since Google verified it
        user.isEmailVerified = true;
        if (!user.phone) {
          user.isVerified = true;
        } else {
          user.isVerified = user.isEmailVerified && user.isPhoneVerified;
        }
        await user.save();
      }
    } else {
      // New user — create account
      const validRoles = ["customer", "driver"];
      const userRole = validRoles.includes(role) ? role : "customer";

      user = await User.create({
        name: name || "Google User",
        email,
        googleId,
        authProvider: "google",
        profileImage: picture || "",
        role: userRole,
        isEmailVerified: true,
        isPhoneVerified: false,
        isVerified: true, // Google already verified the email
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = await generateRefreshToken(user._id);

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage || null,
        isNewUser: !user.phone // flag so frontend knows if phone is missing
      }
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
