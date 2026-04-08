const express = require("express");
const router = express.Router();

const Idea = require("../models/Idea");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, async (req, res) => {
  const { title, description, requiredSkills } = req.body;

  const idea = new Idea({
    title,
    description,
    requiredSkills,
    createdBy: req.user.id
  });

  await idea.save();

  res.json(idea);
});

router.get("/", async (req, res) => {
  const ideas = await Idea.find().populate("createdBy", "name");
  res.json(ideas);
});

// Suggest ideas based on logged-in user's skills
router.get("/suggestions", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/users");
    const user = await User.findById(req.user.id);
    const skills = (user.skills || []).map(s => s.toLowerCase());

    if (skills.length === 0) {
      return res.json([]);
    }

    const ideas = await Idea.find({ status: "open" }).populate("createdBy", "name");

    const scored = ideas
      .map(idea => {
        const ideaSkills = (idea.requiredSkills || []).map(s => s.toLowerCase());
        const matches = ideaSkills.filter(s => skills.includes(s)).length;
        return { idea, matches };
      })
      .filter(item => item.matches > 0)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5)
      .map(item => item.idea);

    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: "Error fetching suggestions" });
  }
});

module.exports = router;

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const ideas = await Idea.find({
      createdBy: req.user.id   // ✅ FILTER BY USER
    }).populate("createdBy", "name");

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user ideas" });
  }
});