const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const authMiddleware = require("../middleware/authMiddleware");

// 🔥 APPLY FOR PROJECT
router.post("/apply/:ideaId", authMiddleware, async (req, res) => {
  const request = new Request({
    ideaId: req.params.ideaId,
    userId: req.user.id
  });

  await request.save();

  res.json({ message: "Applied successfully" });
});

// 🔥 GET MY REQUESTS (optional)
router.get("/my", authMiddleware, async (req, res) => {
  const requests = await Request.find({ userId: req.user.id }).populate("ideaId");
  res.json(requests);
});

module.exports = router;

// 🔥 GET REQUESTS FOR MY IDEAS
router.get("/received", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("ideaId")
      .populate("userId", "name email");

    // filter only requests for ideas created by logged-in user
    const myRequests = requests.filter(
      r => r.ideaId && r.ideaId.createdBy.toString() === req.user.id
    );

    res.json(myRequests);

  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

// 🔥 UPDATE REQUEST STATUS
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    await request.save();

    res.json({ message: "Request updated" });

  } catch (err) {
    res.status(500).json({ message: "Error updating request" });
  }
});