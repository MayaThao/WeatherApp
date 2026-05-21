const ui = (() => {
  // DOM refs
  const el = {
    cityName: document.getElementById("city-name"),
    weatherState: document.getElementById("weather-state"),
    weatherIcon: document.getElementById("weather-icon"),
    temperature: document.getElementById("temperature"),
    sunrise: document.getElementById("sunrise"),
    sunset: document.getElementById("sunset"),
    humidity: document.getElementById("humidity"),
    windSpeed: document.getElementById("wind-speed"),
    dateLabel: document.getElementById("date-label"),
    tipsList: document.getElementById("tips-list"),
    forecastList: document.getElementById("forecast-list"),
    errorToast: document.getElementById("error-toast"),
    errorMsg: document.getElementById("error-msg"),
    loadingOverlay: document.getElementById("loading-overlay"),
    weatherCard: document.getElementById("weather-card"),
    userPanel: document.getElementById("user-panel"),
    userGreet: document.getElementById("user-greet"),
    loginLink: document.getElementById("login-link"),
    logoutBtn: document.getElementById("logout-btn"),
    historyList: document.getElementById("history-list"),
    historySection: document.getElementById("history-section"),
  };

  const ICON_URL = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`;

  // ── Loading ──────────────────────────────────
  function setLoading(on) {
    el.loadingOverlay?.classList.toggle("show", on);
    el.weatherCard?.classList.toggle("refreshing", on);
  }

  // ── Error toast ──────────────────────────────
  function showError(msg = "Có lỗi xảy ra, thử lại sau.") {
    if (!el.errorMsg || !el.errorToast) return;
    el.errorMsg.textContent = msg;
    el.errorToast.classList.add("show");
    setTimeout(() => el.errorToast.classList.remove("show"), 3500);
  }

  function showSuccess(msg) {
    showError(msg); // reuse toast;
  }

  // ── Date label ───────────────────────────────
  function renderDate() {
    if (!el.dateLabel) return;
    const DAYS = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const now = moment();
    el.dateLabel.innerHTML = `${DAYS[now.day()]}<br>${now.format("DD/MM/YYYY")}`;
  }

  // ── Current weather ──────────────────────────
  function renderCurrent(data) {
    if (!el.cityName) return;
    el.cityName.textContent = data.name;
    el.weatherState.textContent = data.weather[0].description;
    el.weatherIcon.src = ICON_URL(data.weather[0].icon);
    el.temperature.textContent = Math.round(data.main.temp);
    el.sunrise.textContent = moment.unix(data.sys.sunrise).format("H:mm");
    el.sunset.textContent = moment.unix(data.sys.sunset).format("H:mm");
    el.humidity.textContent = data.main.humidity;
    el.windSpeed.textContent = (data.wind.speed * 3.6).toFixed(1);
    storage.setLastCity(data.name);
  }

  // ── Tips ─────────────────────────────────────
  function _buildTips({ weather, main, wind }) {
    const tips = [];
    const id = weather[0].id;
    const temp = main.temp;
    const hum = main.humidity;
    const kmh = wind.speed * 3.6;
    const hour = moment().hour();

    if (id >= 200 && id < 300) {
      tips.push({
        emoji: "⛈️",
        text: "Có dông bão — hạn chế ra ngoài, tránh xa cây cối.",
        type: "rain",
      });
      tips.push({
        emoji: "☂️",
        text: "Mang áo mưa dù chỉ đi ngắn.",
        type: "rain",
      });
    } else if (id >= 300 && id < 400) {
      tips.push({
        emoji: "🌂",
        text: "Mưa phùn — mang ô gấp hoặc áo khoác chống thấm.",
        type: "rain",
      });
    } else if (id >= 500 && id < 600) {
      if (id >= 502) {
        tips.push({
          emoji: "⛈️",
          text: "Mưa rất to — nên ở nhà nếu không cần thiết.",
          type: "rain",
        });
        tips.push({
          emoji: "🚗",
          text: "Lái xe chậm, bật đèn, cẩn thận ngập nước.",
          type: "rain",
        });
      } else {
        tips.push({
          emoji: "☂️",
          text: "Nhớ mang ô trước khi ra khỏi nhà!",
          type: "rain",
        });
        tips.push({
          emoji: "👟",
          text: "Tránh mặc giày vải — dễ ướt và khó chịu.",
          type: "rain",
        });
      }
    } else if (id >= 600 && id < 700) {
      tips.push({
        emoji: "🧥",
        text: "Có tuyết! Mặc áo dày, đi giày chống trơn.",
        type: "cold",
      });
      tips.push({
        emoji: "🧤",
        text: "Đừng quên găng tay và khăn quàng.",
        type: "cold",
      });
    }

    if (id >= 700 && id < 800) {
      tips.push({
        emoji: "😷",
        text: "Không khí kém — đeo khẩu trang khi ra ngoài.",
        type: "wind",
      });
      tips.push({
        emoji: "🚗",
        text: "Tầm nhìn hạn chế, bật đèn sương khi lái xe.",
        type: "wind",
      });
    }

    if (id === 800) {
      tips.push({
        emoji: "🕶️",
        text: "Nắng đẹp — đeo kính mát và thoa kem chống nắng SPF 30+.",
        type: "sun",
      });
      if (hour >= 10 && hour <= 15)
        tips.push({
          emoji: "🧴",
          text: "Nắng đỉnh điểm từ 10h–15h, hạn chế ra ngoài.",
          type: "sun",
        });
    }

    if (temp >= 37) {
      tips.push({
        emoji: "🥵",
        text: "Nóng cực độ! Uống nhiều nước, mặc đồ nhạt màu thoáng khí.",
        type: "hot",
      });
    } else if (temp >= 32) {
      tips.push({
        emoji: "🌡️",
        text: "Trời nắng nóng — uống đủ nước và hạn chế vận động mạnh.",
        type: "hot",
      });
      tips.push({
        emoji: "👕",
        text: "Nên mặc áo sáng màu, chất liệu cotton hoặc linen.",
        type: "hot",
      });
    } else if (temp >= 25 && tips.length === 0) {
      tips.push({
        emoji: "🌤️",
        text: "Thời tiết dễ chịu — thích hợp dạo phố hoặc tập thể dục!",
        type: "normal",
      });
    } else if (temp >= 18) {
      tips.push({
        emoji: "🧣",
        text: "Hơi se lạnh — mang áo khoác mỏng phòng khi gió về.",
        type: "cold",
      });
    } else if (temp >= 10) {
      tips.push({
        emoji: "🧥",
        text: "Trời lạnh — mặc áo ấm, đặc biệt buổi sáng và tối.",
        type: "cold",
      });
    } else {
      tips.push({
        emoji: "🥶",
        text: "Rất lạnh! Mặc nhiều lớp, bảo vệ tay và tai.",
        type: "cold",
      });
    }

    if (kmh >= 50)
      tips.push({
        emoji: "💨",
        text: "Gió rất mạnh — tránh đi xe máy, cẩn thận vật dễ bay.",
        type: "wind",
      });
    else if (kmh >= 30)
      tips.push({
        emoji: "🌬️",
        text: "Gió khá mạnh — cẩn thận khi đi xe máy.",
        type: "wind",
      });

    if (hum >= 85 && id === 800)
      tips.push({
        emoji: "💦",
        text: "Độ ẩm cao — cảm giác nóng hơn nhiệt độ thực.",
        type: "hot",
      });

    if (hour >= 21 || hour < 6)
      tips.push({
        emoji: "🌙",
        text: "Đêm khuya — mặc ấm thêm một chút.",
        type: "cold",
      });

    return tips.slice(0, 3);
  }

  function renderTips(data) {
    if (!el.tipsList) return;
    el.tipsList.innerHTML = _buildTips(data)
      .map(
        (t) => `
        <div class="tip-chip ${t.type}">
          <span class="tip-emoji">${t.emoji}</span>
          <span>${t.text}</span>
        </div>`,
      )
      .join("");
  }

  // ── Forecast ─────────────────────────────────
  function _groupByDay(list) {
    const byDay = {};
    list.forEach((item) => {
      const [date, time] = item.dt_txt.split(" ");
      const hour = parseInt(time);
      if (
        !byDay[date] ||
        Math.abs(hour - 12) <
          Math.abs(parseInt(byDay[date].dt_txt.split(" ")[1]) - 12)
      ) {
        byDay[date] = item;
      }
    });
    return byDay;
  }

  function _forecastRowHTML(date, item) {
    const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const today = moment().format("YYYY-MM-DD");
    const m = moment(date);
    const isToday = date === today;
    const dayLabel = isToday ? "Hôm nay" : DAYS[m.day()];
    const dateStr = m.format("DD/MM");
    const pop = Math.round((item.pop || 0) * 100);
    return `
      <div class="forecast-row">
        <div class="forecast-day ${isToday ? "today" : ""}">
          ${dayLabel}<br>
          <small style="font-size:11px;opacity:.55">${dateStr}</small>
        </div>
        <img class="forecast-icon" src="${ICON_URL(item.weather[0].icon)}" alt="${item.weather[0].description}" />
        <div class="forecast-desc">${item.weather[0].description}</div>
        <div class="forecast-rain ${pop < 10 ? "hidden" : ""}">
          <i class="fa-solid fa-droplet"></i>${pop}%
        </div>
        <div class="forecast-temps">
          <span class="f-high">${Math.round(item.main.temp_max)}°</span>
          <span class="f-low">${Math.round(item.main.temp_min)}°</span>
        </div>
      </div>`;
  }

  function renderForecast(list) {
    if (!el.forecastList) return;
    const byDay = _groupByDay(list);
    el.forecastList.innerHTML = Object.entries(byDay)
      .slice(0, 7)
      .map(([date, item]) => _forecastRowHTML(date, item))
      .join("");
  }

  // ── User panel ───────────────────────────────
  function renderUserPanel() {
    if (!el.userPanel) return;
    const user = storage.getUser();
    if (user) {
      el.userGreet &&
        (el.userGreet.textContent = `👋 ${user.fullName || user.username}`);
      el.loginLink && (el.loginLink.style.display = "none");
      el.logoutBtn && (el.logoutBtn.style.display = "flex");
    } else {
      el.userGreet && (el.userGreet.textContent = "");
      el.loginLink && (el.loginLink.style.display = "flex");
      el.logoutBtn && (el.logoutBtn.style.display = "none");
    }
  }

  // ── History ──────────────────────────────────
  function renderHistory(history) {
    if (!el.historyList) return;
    if (!history?.length) {
      el.historySection && (el.historySection.style.display = "none");
      return;
    }
    el.historySection && (el.historySection.style.display = "block");
    el.historyList.innerHTML = history
      .map(
        (h) => `
        <button class="history-chip" data-city="${h.city}">
          <i class="fa-solid fa-clock-rotate-left"></i> ${h.city}
          <small>${moment(h.searchedAt).fromNow()}</small>
        </button>`,
      )
      .join("");
  }

  return {
    setLoading,
    showError,
    showSuccess,
    renderDate,
    renderCurrent,
    renderTips,
    renderForecast,
    renderUserPanel,
    renderHistory,
  };
})();
