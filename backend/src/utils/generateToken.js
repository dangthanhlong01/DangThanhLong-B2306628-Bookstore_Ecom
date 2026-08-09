// generateToken.js - Hàm tạo JWT token dùng cho việc xác thực người dùng
import jwt from "jsonwebtoken";

/**
 * Tạo access token chứa thông tin id và role của user
 * @param {string} userId - id của user trong MongoDB
 * @param {string} role - vai trò của user (customer/admin)
 * @returns {string} - chuỗi JWT token
 */
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role }, // payload: dữ liệu được mã hoá trong token
        process.env.JWT_SECRET, // chuỗi bí mật để ký token (lưu trong .env)
        { expiresIn: "5m" } // thời gian hết hạn của token
    );
};

export default generateToken;