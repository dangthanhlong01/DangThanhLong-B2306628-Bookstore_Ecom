import express from "express";
import shippingTypeController from "../controllers/shippingType.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ==================== USER + ADMIN ====================

// User đã đăng nhập được xem tất cả loại vận chuyển
router.get(
    "/",
    authMiddleware,
    shippingTypeController.getAllShippingTypes
);

// User đã đăng nhập được xem chi tiết loại vận chuyển
router.get(
    "/:id",
    authMiddleware,
    shippingTypeController.getShippingTypeById
);

// ==================== ADMIN ====================

// Admin thêm loại vận chuyển
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    shippingTypeController.createShippingType
);

// Admin cập nhật loại vận chuyển
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    shippingTypeController.updateShippingType
);

// Admin xóa loại vận chuyển
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    shippingTypeController.deleteShippingType
);

export default router;