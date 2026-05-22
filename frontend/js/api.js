/**
 * api.js — Gọi backend API
 * Tất cả request đều đính kèm JWT nếu đã đăng nhập.
 */
const api = (() => {
  function _headers(extra = {}) {
    const token = storage.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }

  async function _request(method, path, body = null) {
    const opts = { method, headers: _headers() };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${CONFIG.API_BASE}${path}`, opts);
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || "Lỗi không xác định.");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // ── Weather ──────────────────────────────────
  async function weatherByCity(city) {
    return _request("GET", `/weather/city?q=${encodeURIComponent(city)}`);
  }

  async function weatherByCoords(lat, lon) {
    return _request("GET", `/weather/coords?lat=${lat}&lon=${lon}`);
  }

  async function weatherHistory(limit = 20) {
    return _request("GET", `/weather/history?limit=${limit}`);
  }

  async function clearHistory() {
    return _request("DELETE", "/weather/history");
  }

  // ── Auth ─────────────────────────────────────
  async function login(username, password) {
    return _request("POST", "/auth/login", { username, password });
  }

  async function register(username, password, fullName) {
    return _request("POST", "/auth/register", { username, password, fullName });
  }

  async function getMe() {
    return _request("GET", "/auth/me");
  }

  async function updateTelegram(telegramChatId) {
    return _request("PATCH", "/auth/telegram", { telegramChatId });
  }

  // ── Alerts ───────────────────────────────────
  async function testAlert(city) {
    return _request("POST", "/alert/test", { city });
  }

  async function toggleAlert() {
    return _request("PATCH", "/alert/toggle");
  }

  async function alertStatus() {
    return _request("GET", "/alert/status");
  }

  async function updateEmail(email) {
    return _request("PATCH", "/auth/email", { email });
  }

  async function testEmailAlert(city) {
    return _request("POST", "/alert/test-email", { city });
  }

  async function changePassword(currentPassword, newPassword) {
    return _request("PATCH", "/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }

  return {
    weatherByCity,
    weatherByCoords,
    weatherHistory,
    clearHistory,
    login,
    register,
    getMe,
    updateTelegram,
    updateEmail,
    changePassword,
    testAlert,
    testEmailAlert,
    toggleAlert,
    alertStatus,
  };
})();
