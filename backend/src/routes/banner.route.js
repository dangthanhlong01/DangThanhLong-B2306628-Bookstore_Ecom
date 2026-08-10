import express from 'express';
import bannerController from '../controllers/banner.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ===== Route công khai - trang chủ dùng, KHÔNG cần đăng nhập =====
router.get('/active', bannerController.handleGetActiveBanners);

// ===== Route quản lý - CHỈ admin =====
router.get('/', authMiddleware, adminMiddleware, bannerController.handleGetAllBanners);
router.get('/:id', authMiddleware, adminMiddleware, bannerController.handleGetBannerById);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), bannerController.handleCreateBanner);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), bannerController.handleUpdateBanner);
router.delete('/:id', authMiddleware, adminMiddleware, bannerController.handleDeleteBanner);

export default router;