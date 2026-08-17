import express from "express";
import voucherController from "../controllers/voucher.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ===== ROUTE PUBLIC (không cần đăng nhập) =====
// Khách xem danh sách voucher đang active — dùng cho trang "Voucher hôm nay"
router.get("/active", voucherController.getActiveVouchers);

// ===== ROUTE KHÁCH HÀNG (cần đăng nhập, không cần quyền admin) =====
router.post("/validate", authMiddleware, voucherController.validateVoucher);
router.post("/collect", authMiddleware, voucherController.collectVoucher);
router.get("/my", authMiddleware, voucherController.getMyVouchers);
router.put("/use", authMiddleware, voucherController.markVoucherUsed);

// ===== ROUTE ADMIN (bắt buộc đăng nhập + quyền admin) =====
router.get("/", authMiddleware, adminMiddleware, voucherController.getVouchers);
router.get("/collected", authMiddleware, adminMiddleware, voucherController.getVoucherUsers);
router.get("/:id", authMiddleware, adminMiddleware, voucherController.getVoucherById);
router.post("/", authMiddleware, adminMiddleware, voucherController.createVoucher);
router.put("/:id", authMiddleware, adminMiddleware, voucherController.updateVoucher);
router.delete("/:id", authMiddleware, adminMiddleware, voucherController.deleteVoucher);

export default router;