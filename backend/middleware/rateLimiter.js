/**
 * Rate limiter đơn giản — in-memory, không cần Redis
 * Giới hạn số request trên mỗi IP trong khoảng thời gian windowMs
 */

const clients = new Map(); // ip → { count, resetAt }

/**
 * @param {object} options
 * @param {number} options.windowMs   Cửa sổ thời gian (ms), mặc định 60_000
 * @param {number} options.max        Số request tối đa, mặc định 30
 * @param {string} options.message    Thông báo lỗi
 */
function rateLimiter({
  windowMs = 60_000,
  max = 30,
  message = "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
} = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const entry = clients.get(ip);

    if (!entry || now > entry.resetAt) {
      clients.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({ success: false, message });
    }

    entry.count++;
    next();
  };
}

// Dọn dẹp bộ nhớ định kỳ (tránh memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of clients.entries()) {
    if (now > entry.resetAt) clients.delete(ip);
  }
}, 60_000);

module.exports = { rateLimiter };
