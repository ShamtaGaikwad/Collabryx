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