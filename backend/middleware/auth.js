const jwt = require("jsonwebtoken");
const { unauthorized } = require("../utils/response");

const SECRET = process.env.JWT_SECRET || "weather_secret_key_2024";

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return unauthorized(res, "Vui lòng đăng nhập.");
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return unauthorized(res, "Token không hợp lệ hoặc đã hết hạn.");
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, SECRET);
    } catch {
      /* bỏ qua */
    }
  }
  next();
}

module.exports = { signToken, requireAuth, optionalAuth };
