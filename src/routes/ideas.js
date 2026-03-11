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