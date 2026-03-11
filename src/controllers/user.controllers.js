// controllers/user.controller.js

exports.testUser = (req, res) => {
  res.json({
    message: "User API working 🚀",
    roles: ["Idea Provider", "Developer", "Faculty"]
  });
}