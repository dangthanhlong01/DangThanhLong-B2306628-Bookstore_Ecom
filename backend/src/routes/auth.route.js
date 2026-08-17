// auth.route.js - Định nghĩa các endpoint liên quan đến xác thực
import express from "express";
import authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

// POST /api/auth/register - đăng ký tài khoản
router.post("/register", authController.handleRegisterUser);

// POST /api/auth/google - đăng nhập bằng Google
router.post("/google", authController.handleGoogleLogin);

// POST /api/auth/login - đăng nhập
router.post("/login", authController.handleLoginUser);

// xác minh email bằng OTP
router.post("/verify-otp", authController.handleVerifyOtp);  

// gửi lại OTP mới
router.post("/send-otp", authController.handleSendOtp);   
// logout 
router.post("/logout", authMiddleware, authController.handleLogoutUser);
export default router;  