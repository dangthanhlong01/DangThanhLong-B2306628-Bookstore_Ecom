// auth.controller.js - Chỉ nhận request, gọi service, trả response
// Toàn bộ logic nghiệp vụ và quyết định status code nằm trong service
import authService from "../services/auth.service.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";

// create user
const handleRegisterUser = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

// login
const handleLoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

// send otp
const handleSendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.sendOtp(email);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

// verify otp
const handleVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOtp(email, otp);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

// login with google
const handleGoogleLogin = async (req, res) => {
    try {
        // Frontend có thể gửi field tên là idToken hoặc credential tuỳ cách bạn code phía Vue.
        // Hỗ trợ cả 2 tên để không bị lệch payload.
        const idToken = req.body.idToken || req.body.credential;

        const result = await authService.loginWithGoogle(idToken);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

// logout
const handleLogoutUser = async (req, res) => {
    try {
        // req.user được gắn từ authMiddleware, lấy id từ đó
        const result = await authService.logoutUser(req.user._id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

export default {
    handleSendOtp,
    handleVerifyOtp,
    handleRegisterUser,
    handleLoginUser,
    handleGoogleLogin,
    handleLogoutUser,
};