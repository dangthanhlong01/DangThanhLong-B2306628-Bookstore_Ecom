import express from "express";
import bookController from "../controllers/book.controller.js";
import upload from "../middlewares/upload.middleware.js";
// Middleware xác thực JWT + kiểm tra quyền admin, dùng chung với route users/banners
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ===== ROUTE CÔNG KHAI (khách hàng xem sách, không cần đăng nhập) =====
router.get("/", bookController.getBooks);
router.get("/slug/:slug", bookController.getBookBySlug);
router.get("/:id", bookController.getBookById);

// ===== ROUTE ADMIN (bắt buộc đăng nhập + quyền admin) =====
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.array("images", 10),
    bookController.createBook
);
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    upload.array("images", 10),
    bookController.updateBook
);
router.delete("/:id", authMiddleware, adminMiddleware, bookController.deleteBook);

export default router;