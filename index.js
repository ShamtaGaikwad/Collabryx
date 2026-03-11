require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth");
const ideaRoutes = require("./src/routes/ideas");
const requestRoutes = require("./src/routes/request");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/request", requestRoutes);

app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});