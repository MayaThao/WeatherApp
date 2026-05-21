const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function buildEmailMessage(city, current) {
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

  return {
    subject: `🌤 Cảnh báo thời tiết — ${city}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f5f5f5; border-radius: 12px;">
        <h2 style="color: #1a1a2e;">🌤 Cảnh báo thời tiết — ${city}</h2>
        <p>🌡 Nhiệt độ: <b>${temp}°C</b> (cảm giác ${feels}°C)</p>
        <p>☁️ Trời: ${desc}</p>
        <p>💧 Độ ẩm: ${humidity}%</p>
        <p>🌬 Gió: ${wind} km/h</p>
        <hr/>
        <p>${warnings.length ? warnings.join("<br/>") : "✅ Thời tiết bình thường."}</p>
        <p style="color: #999; font-size: 12px;">⏰ ${new Date().toLocaleString("vi-VN")}</p>
      </div>
    `,
  };
}

async function sendEmail(to, city, current) {
  if (!process.env.EMAIL_USER)
    throw new Error("EMAIL_USER chưa được cấu hình.");
  const { subject, html } = buildEmailMessage(city, current);
  await transporter.sendMail({
    from: `"Cảnh báo thời tiết" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
