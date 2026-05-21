/**
 * storage.js — Wrapper LocalStorage an toàn
 * Tất cả lỗi parse/write đều được bắt, không throw ra ngoài.
 */
const storage = (() => {
  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  }

  function clear() {
    try {
      localStorage.clear();
    } catch {
      /* noop */
    }
  }

  // ── Auth helpers ─────────────────────────────
  function getToken() {
    return get(CONFIG.TOKEN_KEY, null);
  }

  function setToken(token) {
    return set(CONFIG.TOKEN_KEY, token);
  }

  function getUser() {
    return get(CONFIG.USER_KEY, null);
  }

  function setUser(user) {
    return set(CONFIG.USER_KEY, user);
  }

  function clearAuth() {
    remove(CONFIG.TOKEN_KEY);
    remove(CONFIG.USER_KEY);
  }

  function isLoggedIn() {
    return !!getToken();
  }

  // ── Last city ────────────────────────────────
  function getLastCity() {
    return get("weather_last_city", null);
  }

  function setLastCity(city) {
    return set("weather_last_city", city);
  }

  return {
    get,
    set,
    remove,
    clear,
    getToken,
    setToken,
    getUser,
    setUser,
    clearAuth,
    isLoggedIn,
    getLastCity,
    setLastCity,
  };
})();
