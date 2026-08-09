// generateOtp.js - Sinh mã OTP gồm 6 chữ số ngẫu nhiên
/**
 * Sinh mã OTP 6 số, ví dụ: "045821"
 * @returns {string} - chuỗi 6 chữ số
 */
const generateOtp = () => {
    // Math.random() * 900000 cho ra số từ 0-899999, cộng 100000 để đảm bảo luôn đủ 6 chữ số (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
};

export default generateOtp;