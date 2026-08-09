import dotenv from "dotenv";
import connectDB from "./src/config/database.js"; // Hàm kết nối MongoDB
import app from "./src/app.js";          // Ứng dụng Express đã được cấu hình
         // Đọc biến môi trường từ file .env
dotenv.config(); // Nạp các biến trong file .env vào process.env

connectDB(); // Kết nối đến MongoDB


const PORT = process.env.PORT || 5000; // Lấy PORT từ .env, mặc định là 5000

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});