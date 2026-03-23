require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/auth");
const ideaRoutes = require("./src/routes/ideas");
const requestRoutes = require("./src/routes/request");
const dashboardRoutes = require("./src/routes/Dashboardpage");
const app = express();

// Middleware
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());

// Connect DB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);   // 🔥 IMPORTANT PREFIX
app.use("/api/request", requestRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Test route
app.get("/", (req, res) => {
res.send("Server Running 🚀");
});

app.get("/api/faculty", async (req, res) => {
  try {
    const faculty = await Faculty.find(); // your model
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});