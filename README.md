# 🌤️ Weather Alert App

> Ứng dụng theo dõi thời tiết và gửi cảnh báo tự động qua **Email** và **Telegram**.  
> Backend Node.js + Express · Frontend HTML/CSS/JS thuần · Database MongoDB Atlas

---

## 📁 Cấu trúc thư mục

project/
├── backend/
│ ├── data/
│ │ ├── history.json # Lịch sử tìm kiếm (fallback)
│ │ └── users.json # Dữ liệu người dùng (fallback)
│ ├── middleware/
│ │ ├── auth.js # Xác thực JWT
│ │ ├── cache.js # Cache response
│ │ └── rateLimiter.js # Giới hạn request
│ ├── routes/
│ │ ├── alert.js # GET/POST /api/alert
│ │ ├── auth.js # POST /api/auth/login, /register
│ │ └── weather.js # GET /api/weather
│ ├── services/
│ │ ├── cronService.js # Cron job gửi cảnh báo lúc 6:00 sáng
│ │ ├── dbService.js # Kết nối MongoDB + Schema
│ │ ├── emailService.js # Gửi email qua Nodemailer
│ │ ├── telegramService.js # Gửi tin nhắn Telegram Bot
│ │ └── weatherService.js # Gọi API thời tiết bên ngoài
│ ├── utils/
│ ├── .env # Biến môi trường (KHÔNG commit)
│ ├── package.json
│ └── server.js # Entry point — port 3000
└── frontend/
├── css/index.css
├── js/
│ ├── api.js · app.js · config.js
│ ├── profile.js · storage.js
│ ├── ui.js · validators.js
│ └── moment.js
├── index.html
├── login.html
└── profile.html

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

Tạo file `backend/.env` với nội dung:
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/weatherapp
JWT_SECRET=your_jwt_secret
PORT=3000
CORS_ORIGIN=\*

> ⚠️ **Không commit file `.env` lên Git!**

#### Cách lấy Gmail App Password:

1. Vào **Google Account → Bảo mật → Xác minh 2 bước** (bật nếu chưa có)
2. Tìm **Mật khẩu ứng dụng** → Tạo mới → Copy mật khẩu 16 ký tự
3. Dán vào `EMAIL_PASS`

#### Cách tạo Telegram Bot:

1. Nhắn tin cho **@BotFather** trên Telegram
2. Gõ `/newbot` → đặt tên → copy token
3. Dán vào `TELEGRAM_BOT_TOKEN`

#### Cách lấy MongoDB URI:

1. Đăng ký tài khoản tại [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster **Free**
3. Tạo database user → Copy connection string
4. Dán vào `MONGO_URI`

### 4. Khởi động server

```bash
# Production
npm start

# Development (tự reload khi sửa code)
npm run dev
```

✅ Server chạy tại: **http://localhost:3000**

---

## 📦 Scripts

| Lệnh          | Mô tả                             |
| ------------- | --------------------------------- |
| `npm start`   | Chạy server bằng `node server.js` |
| `npm run dev` | Chạy server bằng `nodemon`        |

---

## 🔑 Tính năng

- 🌦️ Xem thời tiết theo địa điểm thực tế và GPS
- 📅 Dự báo thời tiết 7 ngày
- 🔔 Tạo & quản lý cảnh báo thời tiết cá nhân
- 📧 Nhận cảnh báo qua **Email** (Nodemailer + Gmail SMTP)
- 💬 Nhận cảnh báo qua **Telegram Bot**
- ⏰ Cron job tự động gửi cảnh báo lúc **6:00 sáng** mỗi ngày
- 👤 Đăng ký / đăng nhập với **JWT Authentication** + **bcrypt**
- 👤 Trang Profile — xem thông tin, đổi mật khẩu, cài đặt cảnh báo
- 🗄️ Lưu trữ dữ liệu với **MongoDB Atlas**

---

## 🛠️ Công nghệ

**Backend:**

| Package           | Mục đích          |
| ----------------- | ----------------- |
| `express`         | Web framework     |
| `jsonwebtoken`    | Xác thực JWT      |
| `bcryptjs`        | Mã hóa mật khẩu   |
| `mongoose`        | Kết nối MongoDB   |
| `nodemailer`      | Gửi email         |
| `node-fetch`      | Gọi API thời tiết |
| `node-cron`       | Lên lịch tự động  |
| `cors` + `dotenv` | Middleware        |
| `nodemon` (dev)   | Auto-reload       |

**Frontend:** HTML5 · CSS3 · Vanilla JS · Moment.js

---

## 🤝 Đóng góp

```bash
git checkout -b feature/ten-tinh-nang
# ... code ...
git commit -m "feat: mô tả thay đổi"
git push origin feature/ten-tinh-nang
# Tạo Pull Request trên GitHub
```

---

## 📄 License

MIT License
