const express = require("express");
const router = express.Router();

// ✅ import correct models
const Idea = require("../models/Idea");
const Request = require("../models/Request");
const User = require("../models/users");

// GET dashboard stats
router.get("/stats", async (req, res) => {
  console.log("🔥 NEW DASHBOARD ROUTE RUNNING");
  try {
    const totalIdeas = await Idea.countDocuments();   // ideas = projects
    const totalRequests = await Request.countDocuments();
    const totalUsers = await User.countDocuments(); // 🔥 important

    res.json({
      totalIdeas,
      totalRequests,
      totalUsers
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/faculty", async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/*
router.get("/stats", async (req, res) => {
  try {
    const totalIdeas = await Idea.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalIdeas,
      totalRequests,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/
module.exports = router;