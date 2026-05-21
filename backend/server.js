require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const weatherRoutes = require("./routes/weather");
const alertRoutes = require("./routes/alert");

const app = express();
const { startCron } = require("./services/cronService");
startCron();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend tĩnh
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/js", express.static(path.join(__dirname, "../frontend/js")));
app.use("/css", express.static(path.join(__dirname, "../frontend/css")));
app.use(
  "/js/moment.js",
  express.static(path.join(__dirname, "../frontend/js/moment.js")),
);

// ── API Routes ──────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/alert", alertRoutes);

// ── Catch-all: trả về frontend ──────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ── Global error handler ────────────────────────
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
