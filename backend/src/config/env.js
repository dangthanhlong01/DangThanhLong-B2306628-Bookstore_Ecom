// env.js - Đọc và tập trung toàn bộ biến môi trường vào một nơi duy nhất
// Thay vì gọi process.env.XXX rải rác ở nhiều file, mọi nơi chỉ cần import từ đây
import dotenv from "dotenv";

// Nạp các biến môi trường từ file .env vào process.env
// Đặt ở đây để đảm bảo luôn được gọi trước khi bất kỳ file nào khác cần dùng process.env
dotenv.config();

const env = {
    // Cấu hình server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    // Cấu hình MongoDB
    MONGO_URI: process.env.MONGODB_URI,

    // Cấu hình JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

    // Cấu hình gửi email (Nodemailer)
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,

    // Cấu hình Cloudinary (upload ảnh)
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Danh sách các biến bắt buộc phải có, nếu thiếu thì dừng server ngay lúc khởi động
// thay vì để lỗi xảy ra ngầm khi chạy tới đoạn code liên quan (như lỗi Nodemailer bạn gặp)
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "MAIL_USER", "MAIL_PASSWORD"];

requiredEnvVars.forEach((key) => {
    if (!env[key]) {
        console.error(` Thiếu biến môi trường bắt buộc: ${key}. Kiểm tra lại file .env`);
        process.exit(1); // dừng chương trình luôn, tránh chạy tiếp với cấu hình thiếu sót
    }
});

export default env;