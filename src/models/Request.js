const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Idea"
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    default: "pending"
  }
});

module.exports = mongoose.model("Request", RequestSchema);