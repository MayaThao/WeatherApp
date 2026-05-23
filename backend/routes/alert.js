const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { ok, fail, serverError } = require("../utils/response");
const {
  sendMessage,
  buildAlertMessage,
} = require("../services/telegramService");
const { sendEmail } = require("../services/emailService");
const weatherService = require("../services/weatherService");
const { rateLimiter } = require("../middleware/rateLimiter");
const { User } = require("../services/dbService");

const router = express.Router();

// ── POST /api/alert/test ─────────────────────────
router.post(
  "/test",
  requireAuth,
  rateLimiter({ max: 5, windowMs: 60_000 }),
  async (req, res) => {
    const user = await User.findOne({ id: req.user.id });
    if (!user?.telegramChatId)
      return fail(res, "Chưa liên kết Telegram. Vui lòng cập nhật Chat ID.");

    const city = req.body.city || "Ho Chi Minh City";
    try {
      const { current } = await weatherService.byCity(city);
      const msg = buildAlertMessage(current.name, current);
      await sendMessage(user.telegramChatId, msg);
      return ok(res, {}, "Đã gửi cảnh báo thử nghiệm.");
    } catch (err) {
      return serverError(res, err.message);
    }
  },
);

// ── PATCH /api/alert/toggle ──────────────────────
router.patch("/toggle", requireAuth, async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  if (!user) return fail(res, "Người dùng không tồn tại.", 404);
  if (!user.telegramChatId)
    return fail(res, "Chưa liên kết Telegram. Vui lòng cập nhật Chat ID.");

  user.alertEnabled = !user.alertEnabled;
  await user.save();

  return ok(
    res,
    { alertEnabled: user.alertEnabled },
    user.alertEnabled ? "Đã bật cảnh báo tự động." : "Đã tắt cảnh báo tự động.",
  );
});

// ── GET /api/alert/status ─────────────────────────
router.get("/status", requireAuth, async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  if (!user) return fail(res, "Người dùng không tồn tại.", 404);

  return ok(res, {
    alertEnabled: user.alertEnabled || false,
    telegramLinked: !!user.telegramChatId,
  });
});

// ── POST /api/alert/test-email ───────────────────
router.post(
  "/test-email",
  requireAuth,
  rateLimiter({ max: 5, windowMs: 60_000 }),
  async (req, res) => {
    const user = await User.findOne({ id: req.user.id });
    if (!user?.email)
      return fail(res, "Chưa cập nhật email. Vui lòng nhập email.");

    const city = req.body.city || "Ho Chi Minh City";
    try {
      const { current } = await weatherService.byCity(city);
      await sendEmail(user.email, current.name, current);
      return ok(res, {}, "Đã gửi cảnh báo qua email.");
    } catch (err) {
      console.error("Email error:", err);
      return serverError(res, err.message);
    }
  },
);

module.exports = router;
