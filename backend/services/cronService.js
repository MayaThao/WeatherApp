const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const weatherService = require("./weatherService");
const { sendMessage, buildAlertMessage } = require("./telegramService");
const { sendEmail } = require("./emailService");

const USERS_FILE = path.join(__dirname, "../data/users.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

async function sendDailyAlerts() {
  console.log("⏰ Bắt đầu gửi cảnh báo thời tiết tự động...");
  const users = loadUsers();
  const activeUsers = users.filter((u) => u.alertEnabled);

  if (activeUsers.length === 0) {
    console.log("Không có người dùng nào bật cảnh báo.");
    return;
  }

  for (const user of activeUsers) {
    const city = "Ho Chi Minh City";
    try {
      const { current } = await weatherService.byCity(city);

      // Gửi Telegram
      if (user.telegramChatId) {
        const msg = buildAlertMessage(current.name, current);
        await sendMessage(user.telegramChatId, msg);
        console.log(`✅ Đã gửi Telegram cho ${user.username}`);
      }

      // Gửi Email
      if (user.email) {
        await sendEmail(user.email, current.name, current);
        console.log(`✅ Đã gửi Email cho ${user.username}`);
      }
    } catch (err) {
      console.error(`❌ Lỗi gửi cho ${user.username}:`, err.message);
    }
  }
}

function startCron() {
  // Chạy mỗi sáng lúc 6:00
  cron.schedule("0 6 * * *", sendDailyAlerts, {
    timezone: "Asia/Ho_Chi_Minh",
  });
  console.log(
    "✅ Cron job đã khởi động — gửi cảnh báo lúc 6:00 sáng mỗi ngày.",
  );
}

module.exports = { startCron, sendDailyAlerts };
