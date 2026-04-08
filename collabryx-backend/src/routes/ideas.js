const express = require("express");
const router = express.Router();

const Idea = require("../models/Idea");
const Request = require("../models/Request");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, async (req, res) => {
  const { title, description, requiredSkills } = req.body;
  const idea = new Idea({ title, description, requiredSkills, createdBy: req.user.id });
  await idea.save();
  res.json(idea);
});

router.get("/", async (req, res) => {
  const ideas = await Idea.find().populate("createdBy", "name").populate("assignedFaculty", "name email");
  res.json(ideas);
});

// Suggest ideas based on logged-in user's skills
router.get("/suggestions", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/users");
    const user = await User.findById(req.user.id);
    const skills = (user.skills || []).map(s => s.toLowerCase());
    if (skills.length === 0) return res.json([]);
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

// My ideas
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const ideas = await Idea.find({ createdBy: req.user.id }).populate("createdBy", "name");
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user ideas" });
  }
});

// Assign faculty to an idea (idea owner only)
router.put("/assign-faculty/:ideaId", authMiddleware, async (req, res) => {
  try {
    const { facultyId } = req.body;
    const idea = await Idea.findById(req.params.ideaId);
    if (!idea) return res.status(404).json({ message: "Idea not found" });
    if (idea.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });
    idea.assignedFaculty = facultyId;
    await idea.save();
    res.json({ message: "Faculty assigned" });
  } catch (err) {
    res.status(500).json({ message: "Error assigning faculty" });
  }
});

// Get my team — ideas I'm part of (as creator or accepted member)
router.get("/my-team", authMiddleware, async (req, res) => {
  try {
    const asCreator = await Idea.find({ createdBy: req.user.id })
      .populate("createdBy", "name email")
      .populate("assignedFaculty", "name email");

    const acceptedRequests = await Request.find({ userId: req.user.id, status: "accepted" })
      .populate({
        path: "ideaId",
        populate: [
          { path: "createdBy", select: "name email" },
          { path: "assignedFaculty", select: "name email" }
        ]
      });

    const asMember = acceptedRequests.map(r => r.ideaId).filter(Boolean);
    const allIdeas = [...asCreator, ...asMember];
    const unique = [...new Map(allIdeas.map(i => [i._id.toString(), i])).values()];

    const teams = await Promise.all(unique.map(async idea => {
      const members = await Request.find({ ideaId: idea._id, status: "accepted" })
        .populate("userId", "name email skills");
      return { idea, members: members.map(r => r.userId) };
    }));

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Error fetching my team" });
  }
});

// Faculty: get all teams assigned to me
router.get("/faculty-teams", authMiddleware, async (req, res) => {
  try {
    const ideas = await Idea.find({ assignedFaculty: req.user.id })
      .populate("createdBy", "name email");
    const teams = await Promise.all(ideas.map(async idea => {
      const members = await Request.find({ ideaId: idea._id, status: "accepted" })
        .populate("userId", "name email skills");
      return { idea, members: members.map(r => r.userId) };
    }));
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Error fetching faculty teams" });
  }
});

module.exports = router;
