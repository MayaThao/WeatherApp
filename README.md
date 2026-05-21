# 🌤️ Weather Alert App

> Ứng dụng theo dõi thời tiết và gửi cảnh báo tự động qua **Email** và **Telegram**.  
> Backend Node.js + Express · Frontend HTML/CSS/JS thuần

---

## 📁 Cấu trúc thư mục

```
project/
├── backend/
│   ├── data/
│   │   ├── history.json        # Lịch sử cảnh báo (tự sinh)
│   │   └── users.json          # Dữ liệu người dùng (tự sinh)
│   ├── middleware/
│   │   ├── auth.js             # Xác thực JWT
│   │   ├── cache.js            # Cache response
│   │   └── rateLimiter.js      # Giới hạn request
│   ├── routes/
│   │   ├── alert.js            # GET/POST /api/alert
│   │   ├── auth.js             # POST /api/auth/login, /register
│   │   └── weather.js          # GET /api/weather
│   ├── services/
│   │   ├── cronService.js      # Cron job kiểm tra & gửi cảnh báo
│   │   ├── emailService.js     # Gửi email qua Nodemailer
│   │   ├── telegramService.js  # Gửi tin nhắn Telegram Bot
│   │   └── weatherService.js  # Gọi API thời tiết bên ngoài
│   ├── utils/
│   ├── .env                    # Biến môi trường (KHÔNG commit)
│   ├── package.json
│   └── server.js               # Entry point — port 3000
└── frontend/
    ├── css/index.css
    ├── js/
    │   ├── api.js · app.js · config.js
    │   ├── profile.js · storage.js
    │   ├── ui.js · validators.js
    │   └── moment.js (thư viện ngày giờ)
    ├── index.html
    ├── login.html
    └── profile.html
```

---

## ⚙️ Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
| ------- | ------------------- |
| Node.js | **18.0.0+**         |
| npm     | **8+**              |

---

## 🚀 Cài đặt & Chạy

### 1. Clone repository

```bash
git clone https://github.com/MayaThao/WeatherApp.git
cd WeatherApp
```

### 2. Cài dependencies

```bash
cd backend
npm install
```

### 3. Tạo file `.env`

Tạo file `backend/.env` với nội dung sau:

# Telegram Bot (lấy từ @BotFather trên Telegram)

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Email gửi cảnh báo (dùng Gmail App Password)

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Tùy chọn

PORT=3000
CORS_ORIGIN=\*

> ⚠️ **Không commit file `.env` lên Git!** File này đã được `.gitignore` bảo vệ.

#### Cách lấy Gmail App Password:

1. Vào **Google Account → Security → 2-Step Verification** (bật nếu chưa có)
2. Tìm **App passwords** → Tạo mới → Copy mật khẩu 16 ký tự
3. Dán vào `EMAIL_PASS`

#### Cách tạo Telegram Bot:

1. Nhắn tin cho **@BotFather** trên Telegram
2. Gõ `/newbot` → đặt tên → copy token
3. Dán vào `TELEGRAM_BOT_TOKEN`

### 4. Khởi động server

# Production

npm start

# Development (tự reload khi sửa code)

npm run dev

✅ Server chạy tại: **http://localhost:3000**  
🌐 Frontend được serve tự động tại cùng địa chỉ (không cần chạy riêng).

---

## 📦 Scripts

| Lệnh          | Mô tả                                    |
| ------------- | ---------------------------------------- |
| `npm start`   | Chạy server bằng `node server.js`        |
| `npm run dev` | Chạy server bằng `nodemon` (auto-reload) |

---

## 🔑 Tính năng

- 🌦️ Xem thời tiết theo địa điểm thực tế
- 🔔 Tạo & quản lý cảnh báo thời tiết cá nhân
- 📧 Nhận cảnh báo qua **Email** (Nodemailer + Gmail SMTP)
- 💬 Nhận cảnh báo qua **Telegram Bot**
- ⏰ Cron job tự động kiểm tra & gửi cảnh báo theo lịch
- 👤 Đăng ký / đăng nhập với **JWT Authentication** + **bcrypt**

---

## 🛠️ Công nghệ

**Backend** (`package.json`):

| Package                 | Mục đích          |
| ----------------------- | ----------------- |
| `express`               | Web framework     |
| `jsonwebtoken`          | Xác thực JWT      |
| `bcryptjs`              | Mã hóa mật khẩu   |
| `nodemailer`            | Gửi email         |
| `node-telegram-bot-api` | Gửi Telegram      |
| `node-cron`             | Lên lịch tự động  |
| `node-fetch`            | Gọi API thời tiết |
| `cors` + `dotenv`       | Middleware        |
| `nodemon` _(dev)_       | Auto-reload       |

**Frontend:** HTML5 · CSS3 · Vanilla JS · Moment.js

---

## 🤝 Đóng góp

git checkout -b feature/ten-tinh-nang

# ... code ...

git commit -m "feat: mô tả thay đổi"
git push origin feature/ten-tinh-nang

# Tạo Pull Request trên GitHub

---

## 📄 License

MIT License
