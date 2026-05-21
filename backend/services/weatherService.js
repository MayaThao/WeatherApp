const fetch = require("node-fetch");

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const APP_ID = process.env.OWM_API_KEY || "02e4265cab9ffc977581f170f42a680a";
const COMMON = `&appid=${APP_ID}&units=metric&lang=vi`;

/**
 * Gọi đồng thời current weather + forecast
 */
async function fetchBoth(query) {
  const [wRes, fRes] = await Promise.all([
    fetch(`${BASE_URL}/weather?${query}${COMMON}`),
    fetch(`${BASE_URL}/forecast?${query}${COMMON}`),
  ]);

  const [current, forecast] = await Promise.all([wRes.json(), fRes.json()]);

  if (!wRes.ok)
    throw Object.assign(new Error(current.message || "Không tìm thấy."), {
      status: wRes.status === 404 ? 404 : 502,
    });

  return { current, forecast };
}

async function byCity(city) {
  return fetchBoth(`q=${encodeURIComponent(city)}`);
}

async function byCoords(lat, lon) {
  return fetchBoth(`lat=${lat}&lon=${lon}`);
}

/**
 * Lưu lịch sử tìm kiếm (không trùng, tối đa 20 mục)
 */
const fs = require("fs");
const path = require("path");
const HISTORY_FILE = path.join(__dirname, "../data/history.json");

function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function addToHistory(username, cityName) {
  const history = loadHistory();
  const entry = {
    username,
    city: cityName,
    searchedAt: new Date().toISOString(),
  };
  history.unshift(entry);
  const trimmed = history.slice(0, 100); // giữ 100 bản ghi gần nhất
  saveHistory(trimmed);
}

function getHistory(username, limit = 20) {
  const history = loadHistory();
  return history.filter((h) => h.username === username).slice(0, limit);
}

module.exports = { byCity, byCoords, addToHistory, getHistory };
