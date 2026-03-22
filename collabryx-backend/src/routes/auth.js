const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/users");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", async (req, res) => {
  try {
    const { name, password, role, enrollment } = req.body;
    const email = req.body.email.toLowerCase();
    console.log("Register email (lowercased):", email);

    // Validate enrollment exists
    if (!enrollment) {
      return res.status(400).json({ message: "Enrollment number required" });
    }

    // Validate enrollment format (8-12 digits)
    if (!/^\d{8,12}$/.test(enrollment)) {
      return res.status(400).json({ message: "Invalid enrollment format. Must be 8-12 digits." });
    }

    // Check if enrollment already exists
    const existingEnrollment = await User.findOne({ enrollment });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Enrollment number already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      enrollment,
      role
    });

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: error.message || "Registration error" });
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { password } = req.body;
  console.log("Login email (lowercased):", email);

  const user = await User.findOne({ email });
  console.log("User found:", user ? `${user.name} (${user.email})` : "null");

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ 
    message: "Login successful",
    token: token 
  });
});

// ====== GET USER PROFILE (Protected Route) ======
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

module.exports = router;