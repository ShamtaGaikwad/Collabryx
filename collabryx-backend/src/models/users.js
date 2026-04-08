const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  enrollment: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["ideaProvider", "developer", "faculty"]
  },
  skills: [String],
  pendingStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("User", UserSchema);