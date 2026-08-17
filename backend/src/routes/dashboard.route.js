import express from "express";

import dashboardController
    from "../controllers/dashboard.controller.js";

import {
    authMiddleware,
    adminMiddleware,
} from "../middlewares/auth.middleware.js";


const router = express.Router();


/**
 * GET /api/dashboard/statistics
 *
 * Ví dụ:
 * GET /api/dashboard/statistics?year=2026
 *
 * Chỉ Admin mới được phép truy cập.
 */
router.get(
    "/statistics",
    authMiddleware,
    adminMiddleware,
    dashboardController.getDashboardStatistics
);


export default router;