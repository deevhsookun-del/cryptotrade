const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");

const router = express.Router();
const rateBuckets = new Map();

function rateLimitHit(key, limit, windowMs) {
  const now = Date.now();
  const entry = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  rateBuckets.set(key, entry);
  return entry.count > limit;
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 chars" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json({
      message: "Registered",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    if (rateLimitHit(`login:ip:${req.ip}`, 15, 10 * 60 * 1000)) {
      return res.status(429).json({ message: "Too many login attempts. Try again later." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (rateLimitHit(`login:email:${normalizedEmail}`, 8, 10 * 60 * 1000)) {
      return res.status(429).json({ message: "Too many login attempts. Try again later." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (user.otpLockedUntil && user.otpLockedUntil.getTime() > Date.now()) {
      return res.status(429).json({ message: "OTP temporarily locked. Try again later." });
    }

    if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < 60 * 1000) {
      return res.status(429).json({ message: "Please wait before requesting another code." });
    }

    const otpCode = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    const otpHash = await bcrypt.hash(otpCode, 10);

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpLastSentAt = new Date();
    user.otpAttempts = 0;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Your CryptoTrade login code",
        text: `Your login code is ${otpCode}. It expires in 10 minutes.`,
        html: `<p>Your login code is <strong>${otpCode}</strong>. It expires in 10 minutes.</p>`,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Email delivery failed. Check SMTP settings/app password.",
        error: err.message,
      });
    }

    return res.json({
      message: "OTP sent",
      requiresOtp: true,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "email and code required" });
    }

    if (rateLimitHit(`otp:ip:${req.ip}`, 20, 10 * 60 * 1000)) {
      return res.status(429).json({ message: "Too many attempts. Try again later." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(401).json({ message: "Invalid or expired code" });
    }

    if (user.otpLockedUntil && user.otpLockedUntil.getTime() > Date.now()) {
      return res.status(429).json({ message: "OTP temporarily locked. Try again later." });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ message: "Invalid or expired code" });
    }

    const ok = await bcrypt.compare(String(code), user.otpHash);
    if (!ok) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = new Date(Date.now() + 10 * 60 * 1000);
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
      }
      await user.save();
      return res.status(401).json({ message: "Invalid or expired code" });
    }

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;
    await user.save();

    const token = jwt.sign(
      { id: String(user._id), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Logged in",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email required" });
    }

    if (rateLimitHit(`forgot:ip:${req.ip}`, 12, 10 * 60 * 1000)) {
      return res.status(429).json({ message: "Too many requests. Try again later." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.resetLastSentAt && Date.now() - user.resetLastSentAt.getTime() < 60 * 1000) {
        return res.json({
          message: "If an account exists for that email, a reset link was sent.",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetTokenHash = resetTokenHash;
      user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      user.resetLastSentAt = new Date();
      await user.save();

      const front = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetLink = `${front}/reset-password?token=${resetToken}&email=${encodeURIComponent(
        user.email
      )}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your CryptoTrade password",
          text: `Reset your password using this link: ${resetLink}`,
          html: `<p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
        });
      } catch (err) {
        return res.status(500).json({
          message: "Email delivery failed. Check SMTP settings/app password.",
          error: err.message,
        });
      }
    }

    return res.json({
      message: "If an account exists for that email, a reset link was sent.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ message: "email, token, password required" });
    }

    if (rateLimitHit(`reset:ip:${req.ip}`, 12, 10 * 60 * 1000)) {
      return res.status(429).json({ message: "Too many requests. Try again later." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 chars" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (user.resetTokenExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const incomingHash = crypto.createHash("sha256").update(String(token)).digest("hex");
    if (incomingHash !== user.resetTokenHash) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("_id name email");
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({ id: user._id, name: user.name, email: user.email });
});

module.exports = router;
