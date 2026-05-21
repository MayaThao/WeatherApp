/**
 * Chuẩn hoá response JSON trả về client
 */

function ok(res, data = {}, message = "Thành công", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function fail(res, message = "Có lỗi xảy ra.", status = 400) {
  return res.status(status).json({ success: false, message });
}

function notFound(res, message = "Không tìm thấy.") {
  return fail(res, message, 404);
}

function unauthorized(res, message = "Chưa xác thực.") {
  return fail(res, message, 401);
}

function forbidden(res, message = "Không có quyền truy cập.") {
  return fail(res, message, 403);
}

function serverError(res, message = "Lỗi máy chủ.") {
  return fail(res, message, 500);
}

module.exports = { ok, fail, notFound, unauthorized, forbidden, serverError };
