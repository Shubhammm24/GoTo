const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");

// ─── OTP Generation ──────────────────────────────────────────
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ─── Email Transport (Gmail SMTP) ────────────────────────────
let emailTransporter = null;

const getEmailTransporter = () => {
  if (!emailTransporter) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return emailTransporter;
};

// Check if SMTP credentials are configured (not placeholder values)
const isSmtpConfigured = () => {
  return process.env.SMTP_USER && 
         process.env.SMTP_PASS && 
         !process.env.SMTP_USER.includes("your-email") &&
         !process.env.SMTP_PASS.includes("your-app-password");
};

// Check if Twilio credentials are configured
const isTwilioConfigured = () => {
  return process.env.TWILIO_SID && 
         process.env.TWILIO_AUTH_TOKEN && 
         !process.env.TWILIO_SID.includes("your-twilio");
};

// ─── Send Email OTP ──────────────────────────────────────────
const sendEmailOtp = async (email, code, purpose) => {
  const subject = purpose === "registration"
    ? "GoTo — Verify Your Email"
    : "GoTo — Reset Your Password";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900;">Go<span style="opacity: 0.9;">To</span></h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your ride, your way</p>
      </div>
      <div style="padding: 32px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">
          ${purpose === "registration" ? "Use this code to verify your email address:" : "Use this code to reset your password:"}
        </p>
        <div style="background: #1e293b; border: 1px solid rgba(249,115,22,0.3); border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #f97316; font-family: 'Courier New', monospace;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 24px 0 0;">
          This code expires in <strong style="color: #94a3b8;">10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
      <div style="background: #0b1120; padding: 16px; text-align: center;">
        <p style="color: #475569; font-size: 11px; margin: 0;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;

  // Always log to console
  console.log(`\n📧 Email OTP for ${email}: ${code}\n`);

  // Try to send via SMTP if credentials are configured
  if (isSmtpConfigured()) {
    try {
      const transporter = getEmailTransporter();
      await transporter.sendMail({
        from: `"GoTo" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html
      });
      console.log(`✅ Email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error("⚠️ Email send failed:", error.message);
      console.log("💡 OTP is still valid — use the code shown above or on screen");
      return true; // Still return true — OTP is valid even if email fails
    }
  } else {
    console.log("ℹ️  SMTP not configured — email not sent. Use the OTP shown above or on the verification screen.");
    return true;
  }
};

// ─── Send Phone OTP (Twilio) ─────────────────────────────────
const sendPhoneOtp = async (phone, code, purpose) => {
  // Always log to console
  console.log(`\n📱 Phone OTP for ${phone}: ${code}\n`);

  // Try to send via Twilio if credentials are configured
  if (isTwilioConfigured()) {
    try {
      const twilio = require("twilio");
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const message = purpose === "registration"
        ? `GoTo: Your verification code is ${code}. Valid for 10 minutes.`
        : `GoTo: Your password reset code is ${code}. Valid for 10 minutes.`;

      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: phone
      });
      console.log(`✅ SMS sent successfully to ${phone}`);
      return true;
    } catch (error) {
      console.error("⚠️ SMS send failed:", error.message);
      console.log("💡 OTP is still valid — use the code shown above or on screen");
      return true;
    }
  } else {
    console.log("ℹ️  Twilio not configured — SMS not sent. Use the OTP shown above or on the verification screen.");
    return true;
  }
};

// ─── Create & Send OTP ───────────────────────────────────────
const createAndSendOtp = async (userId, type, destination, purpose) => {
  // Delete any existing OTP for this user/type/purpose
  await Otp.deleteMany({ userId, type, purpose });

  const code = generateOtp();
  const hashedCode = await bcrypt.hash(code, 10);

  await Otp.create({
    userId,
    code: hashedCode,
    type,
    purpose,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });

  let sent = false;
  if (type === "email") {
    sent = await sendEmailOtp(destination, code, purpose);
  } else if (type === "phone") {
    sent = await sendPhoneOtp(destination, code, purpose);
  }

  // Always return the code so the frontend can display it in dev mode
  const devCode = process.env.NODE_ENV !== "production" ? code : undefined;

  return { sent, devCode };
};

// ─── Verify OTP ──────────────────────────────────────────────
const verifyOtp = async (userId, code, type, purpose) => {
  const otpRecord = await Otp.findOne({ userId, type, purpose });

  if (!otpRecord) {
    return { valid: false, message: "No OTP found. Please request a new one." };
  }

  if (otpRecord.expiresAt < new Date()) {
    await otpRecord.deleteOne();
    return { valid: false, message: "OTP has expired. Please request a new one." };
  }

  if (otpRecord.attempts >= 3) {
    await otpRecord.deleteOne();
    return { valid: false, message: "Too many failed attempts. Please request a new OTP." };
  }

  const isMatch = await bcrypt.compare(code, otpRecord.code);

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = 3 - otpRecord.attempts;
    return {
      valid: false,
      message: remaining > 0
        ? `Invalid OTP. ${remaining} attempt(s) remaining.`
        : "Too many failed attempts. Please request a new OTP."
    };
  }

  // OTP is valid — delete it
  await otpRecord.deleteOne();
  return { valid: true };
};

module.exports = {
  generateOtp,
  createAndSendOtp,
  verifyOtp
};
