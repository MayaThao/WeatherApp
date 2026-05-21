const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireAuth } = require("../middleware/auth");
const { ok, fail, serverError } = require("../utils/response");
const {
  sendMessage,
  buildAlertMessage,
} = require("../services/telegramService");
const weatherService = require("../services/weatherService");
const { rateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();
const USERS_FILE = path.join(__dirname, "../data/users.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ── POST /api/alert/test ─────────────────────────
// Gửi cảnh báo thử nghiệm tới Telegram
router.post(
  "/test",
  requireAuth,
  rateLimiter({ max: 5, windowMs: 60_000 }),
  async (req, res) => {
    const users = loadUsers();
    const user = users.find((u) => u.id === req.user.id);

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
// Bật/tắt cảnh báo tự động
router.patch("/toggle", requireAuth, (req, res) => {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return fail(res, "Người dùng không tồn tại.", 404);

  if (!users[idx].telegramChatId)
    return fail(res, "Chưa liên kết Telegram. Vui lòng cập nhật Chat ID.");

  users[idx].alertEnabled = !users[idx].alertEnabled;
  saveUsers(users);

  return ok(
    res,
    { alertEnabled: users[idx].alertEnabled },
    users[idx].alertEnabled
      ? "Đã bật cảnh báo tự động."
      : "Đã tắt cảnh báo tự động.",
  );
});

// ── GET /api/alert/status ─────────────────────────
router.get("/status", requireAuth, (req, res) => {
  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return fail(res, "Người dùng không tồn tại.", 404);

  return ok(res, {
    alertEnabled: user.alertEnabled || false,
    telegramLinked: !!user.telegramChatId,
  });
});

const { sendEmail } = require("../services/emailService");

// ── POST /api/alert/test-email ───────────────────
// Gửi cảnh báo thử nghiệm qua Email
router.post(
  "/test-email",
  requireAuth,
  rateLimiter({ max: 5, windowMs: 60_000 }),
  async (req, res) => {
    const users = loadUsers();
    const user = users.find((u) => u.id === req.user.id);

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
