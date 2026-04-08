const mongoose = require("mongoose");

const IdeaSchema = new mongoose.Schema({
  title: String,
  description: String,
  requiredSkills: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  assignedFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  status: {
    type: String,
    default: "open"
  }
});

module.exports = mongoose.model("Idea", IdeaSchema);