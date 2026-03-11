const express = require("express");
const router = express.Router();

const Request = require("../models/Request");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/send", authMiddleware, async (req, res) => {
  const { ideaId } = req.body;

  const request = new Request({
    ideaId,
    developerId: req.user.id
  });

  await request.save();

  res.json(request);
});

router.get("/myrequests", authMiddleware, async (req, res) => {
  const requests = await Request.find({
    developerId: req.user.id
  }).populate("ideaId");

  res.json(requests);
});

module.exports = router;