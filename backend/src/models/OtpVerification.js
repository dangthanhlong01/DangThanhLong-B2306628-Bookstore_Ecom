// OtpVerification.js - Lưu OTP tạm thời cho email chưa đăng ký,
// tách riêng khỏi User vì lúc gửi OTP thì user CHƯA được tạo trong hệ thống
import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        // Thời hạn hiệu lực của OTP
        expiresAt: {
            type: Date,
            required: true,
        },
        // Đếm số lần nhập sai để chống dò mã
        attempts: {
            type: Number,
            default: 0,
        },
        // Đánh dấu OTP này đã được xác minh đúng chưa
        // (đã verify đúng thì mới cho phép gọi API /register hoàn tất)
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Tự động xoá document sau khi hết hạn 10 phút kể từ lúc tạo
// (MongoDB TTL index - dọn rác tự động, không cần cron job riêng)
otpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);

export default OtpVerification;