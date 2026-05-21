const CONFIG = {
  // Backend API (tự động lấy origin, hoặc ghi đè thủ công)
  API_BASE: window.location.origin + "/api",

  // Fallback khi không lấy được vị trí GPS
  FALLBACK_CITY: "Ho Chi Minh City",

  // Đơn vị nhiệt độ hiển thị
  LANG: "vi",
  UNITS: "metric",

  // Key lưu token trong localStorage
  TOKEN_KEY: "weather_token",
  USER_KEY: "weather_user",
};
