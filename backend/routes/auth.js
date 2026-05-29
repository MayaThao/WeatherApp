const express = require("express");
const bcrypt = require("bcryptjs");
const { signToken, requireAuth } = require("../middleware/auth");
const { ok, fail, unauthorized } = require("../utils/response");
const { rateLimiter } = require("../middleware/rateLimiter");
const { User } = require("../services/dbService");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  rateLimiter({ max: 5, windowMs: 60_000 }),
  async (req, res) => {
    const { username, password, fullName } = req.body;

    // 1. Kiểm tra xem dữ liệu có tồn tại không
    if (!username || !password)
      return fail(res, "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");

    // 2. Tiến hành loại bỏ toàn bộ khoảng trắng ở đầu và cuối của username
    const trimmedUsername = username.trim();

    // 3. Kiểm tra lại độ dài sau khi đã xóa khoảng trắng
    if (trimmedUsername.length < 3)
      return fail(
        res,
        "Tên đăng nhập phải có ít nhất 3 ký tự (không tính khoảng trắng).",
      );
    if (password.length < 6)
      return fail(res, "Mật khẩu phải có ít nhất 6 ký tự.");

    // 4. Khi tìm kiếm hoặc tạo mới, hãy dùng chuỗi đã được loại bỏ khoảng trắng (trimmedUsername)
    const existing = await User.findOne({ username: trimmedUsername });
    if (existing) return fail(res, "Tên đăng nhập đã tồn tại.");

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      id: Date.now().toString(),
      username: trimmedUsername, // Lưu username sạch vào database
      password: hash,
      fullName: fullName || trimmedUsername,
      telegramChatId: null,
      alertEnabled: false,
    });

    const token = signToken({ id: newUser.id, username: newUser.username });
    return ok(
      res,
      {
        token,
        user: {
          id: newUser.id,
          username: trimmedUsername,
          fullName: newUser.fullName,
        },
      },
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

    const user = await User.findOne({ username });
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
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  if (!user) return fail(res, "Người dùng không tồn tại.", 404);
  const { password, ...safe } = user.toObject();
  return ok(res, safe);
});

// PATCH /api/auth/telegram
router.patch("/telegram", requireAuth, async (req, res) => {
  const { telegramChatId } = req.body;
  if (!telegramChatId) return fail(res, "Thiếu telegramChatId.");

  const user = await User.findOneAndUpdate(
    { id: req.user.id },
    { telegramChatId: String(telegramChatId) },
    { new: true },
  );
  if (!user) return fail(res, "Người dùng không tồn tại.", 404);
  return ok(
    res,
    { telegramChatId: user.telegramChatId },
    "Cập nhật Telegram thành công.",
  );
});

// PATCH /api/auth/email
router.patch("/email", requireAuth, async (req, res) => {
  const { email } = req.body;
  if (!email) return fail(res, "Thiếu email.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail(res, "Email không hợp lệ.");

  const user = await User.findOneAndUpdate(
    { id: req.user.id },
    { email },
    { new: true },
  );
  if (!user) return fail(res, "Người dùng không tồn tại.", 404);
  return ok(res, { email }, "Cập nhật email thành công.");
});

// PATCH /api/auth/change-password
router.patch("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return fail(res, "Vui lòng nhập đầy đủ thông tin.");
  if (newPassword.length < 6)
    return fail(res, "Mật khẩu mới phải có ít nhất 6 ký tự.");

  const user = await User.findOne({ id: req.user.id });
  if (!user) return fail(res, "Người dùng không tồn tại.", 404);

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return fail(res, "Mật khẩu hiện tại không đúng.");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return ok(res, {}, "Đổi mật khẩu thành công.");
});

module.exports = router;
