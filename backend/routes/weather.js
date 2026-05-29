const express = require("express");
const weatherService = require("../services/weatherService");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { cache } = require("../middleware/cache");
const { rateLimiter } = require("../middleware/rateLimiter");
const { ok, fail, serverError } = require("../utils/response");

const router = express.Router();

router.use(rateLimiter({ max: 60, windowMs: 60_000 }));

// ── GET /api/weather/city?q=<tên thành phố> ──────
router.get("/city", optionalAuth, cache(300), async (req, res) => {
  const city = (req.query.q || "").trim();
  if (!city) return fail(res, "Thiếu tham số q (tên thành phố).");

  try {
    const data = await weatherService.byCity(city);
    if (req.user) {
      weatherService.addToHistory(req.user.username, data.current.name);
    }
    return ok(res, data);
  } catch (err) {
    console.error("[weather/city]", err.message, err.stack);
    if (err.status === 404)
      return fail(res, "Không tìm thấy thành phố này.", 404);
    return serverError(res, "Lỗi kết nối tới OpenWeatherMap.");
  }
});

// ── GET /api/weather/coords?lat=&lon= ────────────
router.get("/coords", optionalAuth, cache(300), async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);

  if (isNaN(lat) || isNaN(lon))
    return fail(res, "Thiếu hoặc sai tham số lat/lon.");

  try {
    const data = await weatherService.byCoords(lat, lon);
    if (req.user) {
      weatherService.addToHistory(req.user.username, data.current.name);
    }
    return ok(res, data);
  } catch (err) {
    console.error("[weather/coords]", err.message, err.stack);
    return serverError(res, "Lỗi kết nối tới OpenWeatherMap.");
  }
});

// ── GET /api/weather/history ─────────────────────
router.get("/history", (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const history = weatherService.getHistory("cam", limit);
    return ok(res, history);
  } catch (err) {
    console.error("[weather/history]", err.message);
    return serverError(res, "Không thể lấy lịch sử.");
  }
});

// ── DELETE /api/weather/history ──────────────────
router.delete("/history", requireAuth, (req, res) => {
  const fs = require("fs");
  const path = require("path");
  const HISTORY_FILE = path.join(__dirname, "../data/history.json");
  try {
    const all = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
    const filtered = all.filter((h) => h.username !== req.user.username);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(filtered, null, 2));
    return ok(res, {}, "Đã xoá lịch sử tìm kiếm.");
  } catch (err) {
    console.error("[weather/delete-history]", err.message);
    return serverError(res, "Không thể xoá lịch sử.");
  }
});

module.exports = router;
