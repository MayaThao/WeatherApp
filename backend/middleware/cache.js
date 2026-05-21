/**
 * In-memory cache middleware
 * Dùng cho các route GET tốn tài nguyên (gọi API thời tiết)
 */

const store = new Map(); // key → { data, expiresAt }

/**
 * Tạo middleware cache với TTL (giây)
 * @param {number} ttlSeconds  Thời gian cache (mặc định 5 phút)
 */
function cache(ttlSeconds = 300) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const entry = store.get(key);

    if (entry && Date.now() < entry.expiresAt) {
      return res.json({ success: true, cached: true, data: entry.data });
    }

    // Monkey-patch res.json để lưu kết quả vào cache
    const _json = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200 && body?.success !== false) {
        store.set(key, {
          data: body.data ?? body,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
      }
      _json(body);
    };

    next();
  };
}

/**
 * Xoá toàn bộ cache (dùng khi cần invalidate)
 */
function clearCache() {
  store.clear();
}

/**
 * Xoá cache theo prefix key
 */
function clearCacheByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { cache, clearCache, clearCacheByPrefix };
