import express from "express";
import User from "../models/User.js";
import { hashPassword, comparePassword, signAccessToken } from "../utils/auth.js";

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate role (default to customer if not provided)
    const normalizedRole = (role || "customer").toLowerCase();
    if (!["seller", "customer"].includes(normalizedRole)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role selected" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });

    await user.save();

    // Generate token for new user
    const token = signAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    // Handle duplicate email error
    if (err.code === 11000 || err.keyPattern?.email) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    res
      .status(500)
      .json({ success: false, message: err.message || "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = signAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role || "customer",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "customer",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
});

export default router;
