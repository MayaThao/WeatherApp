const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (!MONGO_URI) {
    console.warn("⚠️ MONGO_URI chưa cấu hình, dùng file JSON.");
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công.");
  } catch (err) {
    console.error("❌ Kết nối MongoDB thất bại:", err.message);
  }
}

// Schema User
const userSchema = new mongoose.Schema({
  id: String,
  username: { type: String, unique: true },
  password: String,
  fullName: String,
  email: String,
  telegramChatId: String,
  alertEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Schema History
const historySchema = new mongoose.Schema({
  userId: String,
  city: String,
  searchedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const History =
  mongoose.models.History || mongoose.model("History", historySchema);

module.exports = { connectDB, User, History };
