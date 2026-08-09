// errorCodes.js - Định nghĩa các mã lỗi nghiệp vụ dùng chung trong toàn bộ hệ thống
// Giúp Service trả lỗi thống nhất, Controller không cần đoán status code

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,       // lỗi do client gửi dữ liệu sai/thiếu
    UNAUTHORIZED: 401,       // chưa đăng nhập / token không hợp lệ
    FORBIDDEN: 403,          // đã đăng nhập nhưng không đủ quyền / tài khoản bị khoá
    NOT_FOUND: 404,          // không tìm thấy tài nguyên
    CONFLICT: 409,           // dữ liệu bị trùng (VD: email đã tồn tại)
    TOO_MANY_REQUESTS: 429,  // vượt quá giới hạn (VD: nhập sai OTP quá nhiều lần)
    INTERNAL_ERROR: 500,     // lỗi phía server
};