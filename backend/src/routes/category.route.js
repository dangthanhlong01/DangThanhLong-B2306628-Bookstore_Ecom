import express from "express";

import categoryController from "../controllers/category.controller.js";

// Middleware xác thực JWT + kiểm tra quyền admin
import {
    authMiddleware,
    adminMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// ===== ROUTE CÔNG KHAI =====

// GET /api/categories
router.get(
    "/",
    categoryController.getCategories
);

// GET /api/categories/slug/:slug
router.get(
    "/slug/:slug",
    categoryController.getCategoryBySlug
);

// GET /api/categories/:id
router.get(
    "/:id",
    categoryController.getCategoryById
);

// ===== ROUTE ADMIN =====

// POST /api/categories
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    categoryController.createCategory
);

// PUT /api/categories/:id
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    categoryController.updateCategory
);

// DELETE /api/categories/:id
// Không xóa DB, chỉ chuyển status = inactive
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    categoryController.deleteCategory
);

export default router;