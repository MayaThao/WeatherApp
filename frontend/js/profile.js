/**
 * profile.js — Xử lý trang hồ sơ cá nhân
 */

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

async function loadProfile() {
  try {
    const res = await api.getMe();
    const user = res.data;
    document.getElementById("fullName").value = user.fullName || "";
    document.getElementById("username").value = user.username || "";
    document.getElementById("createdAt").value = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("vi-VN")
      : "";
    document.getElementById("telegramChatId").value = user.telegramChatId || "";
    document.getElementById("alertEmail").value = user.email || "";

    const toggleBtn = document.getElementById("alert-toggle-btn");
    toggleBtn.textContent = user.alertEnabled
      ? "🔔 Tắt cảnh báo"
      : "🔕 Bật cảnh báo";
  } catch (err) {
    showToast("Không thể tải thông tin. Vui lòng đăng nhập lại.");
    setTimeout(() => (window.location.href = "/login.html"), 2000);
  }
}

// Đổi mật khẩu
document
  .getElementById("change-password-btn")
  ?.addEventListener("click", async () => {
    const currentPassword = document
      .getElementById("currentPassword")
      .value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu mới không khớp.");
      return;
    }
    try {
      await api.changePassword(currentPassword, newPassword);
      showToast("✅ Đổi mật khẩu thành công!");
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    } catch (ex) {
      showToast(ex.message);
    }
  });

// Lưu Telegram
document
  .getElementById("save-telegram-btn")
  ?.addEventListener("click", async () => {
    const chatId = document.getElementById("telegramChatId").value.trim();
    if (!chatId) {
      showToast("Vui lòng nhập Telegram Chat ID.");
      return;
    }
    try {
      await api.updateTelegram(chatId);
      showToast("✅ Đã lưu Telegram Chat ID!");
    } catch (ex) {
      showToast(ex.message);
    }
  });

// Lưu Email
document
  .getElementById("save-email-btn")
  ?.addEventListener("click", async () => {
    const email = document.getElementById("alertEmail").value.trim();
    if (!email) {
      showToast("Vui lòng nhập email.");
      return;
    }
    try {
      await api.updateEmail(email);
      showToast("✅ Đã lưu email!");
    } catch (ex) {
      showToast(ex.message);
    }
  });

// Bật/tắt cảnh báo
document
  .getElementById("alert-toggle-btn")
  ?.addEventListener("click", async () => {
    try {
      const res = await api.toggleAlert();
      document.getElementById("alert-toggle-btn").textContent = res.data
        .alertEnabled
        ? "🔔 Tắt cảnh báo"
        : "🔕 Bật cảnh báo";
      showToast(res.message);
    } catch (ex) {
      showToast(ex.message);
    }
  });

// Đăng xuất
document.getElementById("logout-btn")?.addEventListener("click", () => {
  storage.clearAuth();
  window.location.href = "/login.html";
});

// Kiểm tra đăng nhập
if (!storage.isLoggedIn()) {
  window.location.href = "/login.html";
} else {
  loadProfile();
}
