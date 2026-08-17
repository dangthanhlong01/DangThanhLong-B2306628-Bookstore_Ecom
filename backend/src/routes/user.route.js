// user.route.js - Định nghĩa các endpoint liên quan tới tài khoản người dùng
import express from "express";
import userController from "../controllers/user.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Tất cả route đều cần đăng nhập (dùng authMiddleware) vì thao tác trên chính tài khoản của mình
router.get("/profile", authMiddleware, userController.handleGetProfile);
router.put("/profile", authMiddleware, userController.handleUpdateProfile);
router.put("/change-password", authMiddleware, userController.handleChangePassword);

router.get(
    "/addresses",
    authMiddleware,
    userController.handleGetAddresses
);
router.post("/addresses", authMiddleware, userController.handleAddAddress);
router.put("/addresses/:addressId", authMiddleware, userController.handleUpdateAddress);
router.delete("/addresses/:addressId", authMiddleware, userController.handleDeleteAddress);

// Chỉ admin mới được xem/sửa/xoá danh sách người dùng khác
router.get("/", authMiddleware, adminMiddleware, userController.handleGetAllUsers);
router.post("/", authMiddleware, adminMiddleware, userController.handleCreateUser);
router.put("/:id", authMiddleware, adminMiddleware, userController.handleAdminUpdateUser);
router.delete("/:id", authMiddleware, adminMiddleware, userController.handleDeleteUser);


export default router;