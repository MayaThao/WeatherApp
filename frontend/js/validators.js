/**
 * validators.js — Kiểm tra dữ liệu đầu vào phía client
 */
const validators = (() => {
  /**
   * Validate tên đăng nhập
   * - Tối thiểu 3 ký tự
   * - Chỉ chứa chữ cái, số, dấu gạch dưới / gạch ngang
   */
  function username(value) {
    const v = (value || "").trim();
    if (!v) return "Vui lòng nhập tên đăng nhập.";
    if (v.length < 3) return "Tên đăng nhập phải có ít nhất 3 ký tự.";
    if (v.length > 30) return "Tên đăng nhập tối đa 30 ký tự.";
    if (!/^[a-zA-Z0-9_\-]+$/.test(v))
      return "Tên đăng nhập chỉ dùng chữ, số, _ hoặc -.";
    return null; // hợp lệ
  }

  /**
   * Validate mật khẩu
   * - Tối thiểu 6 ký tự
   */
  function password(value) {
    const v = value || "";
    if (!v) return "Vui lòng nhập mật khẩu.";
    if (v.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (v.length > 100) return "Mật khẩu quá dài.";
    return null;
  }

  /**
   * Validate confirm password
   */
  function confirmPassword(pass, confirm) {
    if (!confirm) return "Vui lòng xác nhận mật khẩu.";
    if (pass !== confirm) return "Mật khẩu xác nhận không khớp.";
    return null;
  }

  /**
   * Validate tên thành phố trong ô tìm kiếm
   */
  function cityQuery(value) {
    const v = (value || "").trim();
    if (!v) return "Vui lòng nhập tên thành phố.";
    if (v.length < 2) return "Tên thành phố quá ngắn.";
    if (v.length > 100) return "Tên thành phố quá dài.";
    return null;
  }

  /**
   * Validate Telegram Chat ID (phải là số nguyên)
   */
  function telegramChatId(value) {
    const v = (value || "").trim();
    if (!v) return "Vui lòng nhập Telegram Chat ID.";
    if (!/^-?\d+$/.test(v)) return "Chat ID phải là số nguyên.";
    return null;
  }

  /**
   * Kiểm tra form đăng nhập
   * @returns {{ valid: boolean, errors: object }}
   */
  function loginForm({ username: u, password: p }) {
    const errors = {};
    const eu = username(u);
    const ep = password(p);
    if (eu) errors.username = eu;
    if (ep) errors.password = ep;
    return { valid: Object.keys(errors).length === 0, errors };
  }

  /**
   * Kiểm tra form đăng ký
   */
  function registerForm({ username: u, password: p, confirmPassword: cp }) {
    const errors = {};
    const eu = username(u);
    const ep = password(p);
    const ec = confirmPassword(p, cp);
    if (eu) errors.username = eu;
    if (ep) errors.password = ep;
    if (ec) errors.confirmPassword = ec;
    return { valid: Object.keys(errors).length === 0, errors };
  }

  return {
    username,
    password,
    confirmPassword,
    cityQuery,
    telegramChatId,
    loginForm,
    registerForm,
  };
})();
