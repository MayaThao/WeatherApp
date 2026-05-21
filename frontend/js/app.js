const app = (() => {
  const searchInput = document.getElementById("search-input");
  const locateBtn = document.getElementById("locate-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const historyList = document.getElementById("history-list");

  // ── Render ───────────────────────────────────
  async function _render({ current, forecast }) {
    ui.renderCurrent(current);
    ui.renderTips(current);
    ui.renderForecast(forecast.list);
  }

  // ── Search by city ───────────────────────────
  async function searchCity(city) {
    const err = validators.cityQuery(city);
    if (err) {
      ui.showError(err);
      return;
    }

    ui.setLoading(true);
    try {
      const res = await api.weatherByCity(city);
      await _render(res.data);
      if (storage.isLoggedIn()) loadHistory();
    } catch (e) {
      ui.showError(e.message || "Không tìm thấy thành phố này.");
    } finally {
      ui.setLoading(false);
    }
  }

  // ── Search by coords ─────────────────────────
  async function searchByCoords(lat, lon) {
    ui.setLoading(true);
    try {
      const res = await api.weatherByCoords(lat, lon);
      await _render(res.data);
      if (storage.isLoggedIn()) loadHistory();
    } catch (e) {
      ui.showError("Không lấy được dữ liệu vị trí.");
    } finally {
      ui.setLoading(false);
    }
  }

  // ── Geolocation ──────────────────────────────
  function locateUser() {
    if (!navigator.geolocation) {
      ui.showError("Trình duyệt không hỗ trợ định vị.");
      searchCity(CONFIG.FALLBACK_CITY);
      return;
    }
    locateBtn?.classList.add("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locateBtn?.classList.remove("loading");
        searchByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        locateBtn?.classList.remove("loading");
        const last = storage.getLastCity();
        searchCity(last || CONFIG.FALLBACK_CITY);
      },
      { timeout: 8000 },
    );
  }

  // ── History ──────────────────────────────────
  async function loadHistory() {
    if (!storage.isLoggedIn()) return;
    try {
      const res = await api.weatherHistory(10);
      ui.renderHistory(res.data);
    } catch {
      /* bỏ qua */
    }
  }

  // ── Logout ───────────────────────────────────
  function logout() {
    storage.clearAuth();
    ui.renderUserPanel();
    ui.renderHistory([]);
  }

  // ── Events ───────────────────────────────────
  function _bindEvents() {
    searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        searchCity(e.target.value);
        e.target.blur();
      }
    });

    searchInput?.addEventListener("change", (e) => searchCity(e.target.value));

    locateBtn?.addEventListener("click", locateUser);

    logoutBtn?.addEventListener("click", logout);

    // History chips — delegated
    historyList?.addEventListener("click", (e) => {
      const chip = e.target.closest(".history-chip");
      if (chip) {
        const city = chip.dataset.city;
        if (searchInput) searchInput.value = city;
        searchCity(city);
      }
    });

    // Telegram / alert form
    const tgForm = document.getElementById("telegram-form");
    tgForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const chatId = document.getElementById("tg-chat-id")?.value?.trim();
      const err = validators.telegramChatId(chatId);
      if (err) {
        ui.showError(err);
        return;
      }
      try {
        await api.updateTelegram(chatId);
        ui.showError("✅ Đã lưu Telegram Chat ID!");
      } catch (ex) {
        ui.showError(ex.message);
      }
    });

    const alertToggle = document.getElementById("alert-toggle");
    alertToggle?.addEventListener("click", async () => {
      try {
        const res = await api.toggleAlert();
        alertToggle.textContent = res.data.alertEnabled
          ? "🔔 Tắt cảnh báo"
          : "🔕 Bật cảnh báo";
        ui.showError(res.message);
      } catch (ex) {
        ui.showError(ex.message);
      }
    });

    const testAlertBtn = document.getElementById("test-alert-btn");
    testAlertBtn?.addEventListener("click", async () => {
      const city = storage.getLastCity() || CONFIG.FALLBACK_CITY;
      try {
        await api.testAlert(city);
        ui.showError("✅ Đã gửi cảnh báo thử nghiệm qua Telegram!");
      } catch (ex) {
        ui.showError(ex.message);
      }
      try {
        await api.testEmailAlert(city);
        ui.showError("✅ Đã gửi cảnh báo thử nghiệm qua Email!");
      } catch (ex) {
        ui.showError(ex.message);
      }
    });

    const emailForm = document.getElementById("email-form");
    emailForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("alert-email")?.value?.trim();
      if (!email) {
        ui.showError("Vui lòng nhập email.");
        return;
      }
      try {
        await api.updateEmail(email);
        ui.showError("✅ Đã lưu email!");
      } catch (ex) {
        ui.showError(ex.message);
      }
    });
  }

  // ── Init ─────────────────────────────────────
  async function init() {
    ui.renderDate();
    ui.renderUserPanel();
    _bindEvents();

    if (storage.isLoggedIn()) {
      loadHistory();
    }

    locateUser();
  }

  return { init, searchCity };
})();

app.init();
