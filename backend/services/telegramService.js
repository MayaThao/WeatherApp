/**
 * Telegram Alert Service
 * Gửi cảnh báo thời tiết tới Telegram bot
 */

const fetch = require("node-fetch");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Gửi tin nhắn tới một chat_id
 * @param {string} chatId
 * @param {string} text  HTML hoặc plain text
 */
async function sendMessage(chatId, text) {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN chưa được cấu hình.");

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Gửi Telegram thất bại.");
  return data;
}

/**
 * Tạo nội dung cảnh báo thời tiết đẹp
 */
function buildAlertMessage(city, current) {
  const temp = Math.round(current.main.temp);
  const feels = Math.round(current.main.feels_like);
  const desc = current.weather[0].description;
  const humidity = current.main.humidity;
  const wind = (current.wind.speed * 3.6).toFixed(1);

  const warnings = [];
  if (temp >= 37) warnings.push("🥵 Nắng cực độ! Uống đủ nước.");
  if (temp <= 10) warnings.push("🥶 Trời rất lạnh! Mặc đủ ấm.");
  const id = current.weather[0].id;
  if (id >= 200 && id < 300) warnings.push("⛈️ Dông bão! Hạn chế ra ngoài.");
  else if (id >= 500 && id < 600) warnings.push("☂️ Có mưa! Nhớ mang ô.");
  if (current.wind.speed * 3.6 >= 50)
    warnings.push("💨 Gió rất mạnh! Cẩn thận.");

  return [
    `🌤 <b>Cảnh báo thời tiết — ${city}</b>`,
    ``,
    `🌡 Nhiệt độ: <b>${temp}°C</b> (cảm giác ${feels}°C)`,
    `☁️ Trời: ${desc}`,
    `💧 Độ ẩm: ${humidity}%`,
    `🌬 Gió: ${wind} km/h`,
    ``,
    warnings.length ? warnings.join("\n") : "✅ Thời tiết bình thường.",
    ``,
    `⏰ ${new Date().toLocaleString("vi-VN")}`,
  ].join("\n");
}

module.exports = { sendMessage, buildAlertMessage };
