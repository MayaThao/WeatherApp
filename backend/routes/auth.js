const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { signToken, requireAuth } = require("../middleware/auth");
const { ok, fail, unauthorized } = require("../utils/response");
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

// POST /api/auth/register
router.post(
  "/register",
  rateLimiter({ max: 5, windowMs: 60_000 }),
  async (req, res) => {
    const { username, password, fullName } = req.body;
    if (!username || !password)
      return fail(res, "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
    if (username.length < 3)
      return fail(res, "Tên đăng nhập phải có ít nhất 3 ký tự.");
    if (password.length < 6)
      return fail(res, "Mật khẩu phải có ít nhất 6 ký tự.");
    const users = loadUsers();
    if (users.find((u) => u.username === username))
      return fail(res, "Tên đăng nhập đã tồn tại.");
    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hash,
      fullName: fullName || username,
      telegramChatId: null,
      alertEnabled: false,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const token = signToken({ id: newUser.id, username: newUser.username });
    return ok(
      res,
      { token, user: { id: newUser.id, username, fullName: newUser.fullName } },
      "Đăng ký thành công!",
      201,
    );
  },
);

// POST /api/auth/login
router.post(
  "/login",
  rateLimiter({ max: 10, windowMs: 60_000 }),
  async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
      return fail(res, "Vui lòng nhập tên đăng nhập và mật khẩu.");
    const users = loadUsers();
    const user = users.find((u) => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return unauthorized(res, "Tên đăng nhập hoặc mật khẩu không đúng.");
    const token = signToken({ id: user.id, username: user.username });
    return ok(
      res,
      {
        token,
        user: { id: user.id, username: user.username, fullName: user.fullName },
      },
      "Đăng nhập thành công!",
    );
  },
);

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return fail(res, "Người dùng không tồn tại.", 404);
  const { password, ...safe } = user;
  return ok(res, safe);
});

// PATCH /api/auth/telegram
router.patch("/telegram", requireAuth, (req, res) => {
  const { telegramChatId } = req.body;
  if (!telegramChatId) return fail(res, "Thiếu telegramChatId.");
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return fail(res, "Người dùng không tồn tại.", 404);
  users[idx].telegramChatId = String(telegramChatId);
  saveUsers(users);
  return ok(
    res,
    { telegramChatId: users[idx].telegramChatId },
    "Cập nhật Telegram thành công.",
  );
});

// PATCH /api/auth/email
router.patch("/email", requireAuth, (req, res) => {
  const { email } = req.body;
  if (!email) return fail(res, "Thiếu email.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail(res, "Email không hợp lệ.");

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return fail(res, "Người dùng không tồn tại.", 404);

  users[idx].email = email;
  saveUsers(users);

  return ok(res, { email }, "Cập nhật email thành công.");
});

// PATCH /api/auth/change-password
router.patch("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return fail(res, "Vui lòng nhập đầy đủ thông tin.");
  if (newPassword.length < 6)
    return fail(res, "Mật khẩu mới phải có ít nhất 6 ký tự.");

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return fail(res, "Người dùng không tồn tại.", 404);

  const match = await bcrypt.compare(currentPassword, users[idx].password);
  if (!match) return fail(res, "Mật khẩu hiện tại không đúng.");

  users[idx].password = await bcrypt.hash(newPassword, 10);
  saveUsers(users);
  return ok(res, {}, "Đổi mật khẩu thành công.");
});

module.exports = router;
