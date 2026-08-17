import express from "express";
import orderBookController from "../controllers/order.controller.js";
import {
    authMiddleware,
    adminMiddleware
} from "../middlewares/auth.middleware.js";

const router = express.Router();


// =====================================================
// ORDER BOOK
// =====================================================

// Lấy danh sách đơn hàng của user
router.get(
    "/",
    authMiddleware,
    orderBookController.getOrderBooks
);

// Lấy một đơn hàng
router.get(
    "/:id",
    authMiddleware,
    orderBookController.getOrderBookById
);

// Tạo đơn hàng
router.post(
    "/",
    authMiddleware,
    orderBookController.createOrderBook
);

// Cập nhật đơn hàng
router.put(
    "/:id",
    authMiddleware,
    orderBookController.updateOrderBook
);

// Xoá đơn hàng
router.delete(
    "/:id",
    authMiddleware,
    orderBookController.deleteOrderBook
);


// =====================================================
// ORDER DETAIL
// =====================================================

// Lấy tất cả sách trong một đơn
router.get(
    "/:orderId/details",
    authMiddleware,
    orderBookController.getOrderDetails
);

// Lấy một detail
router.get(
    "/details/:id",
    authMiddleware,
    orderBookController.getOrderDetailById
);

// Thêm sách vào đơn
router.post(
    "/:orderId/details",
    authMiddleware,
    orderBookController.createOrderDetail
);

// Cập nhật detail
router.put(
    "/details/:id",
    authMiddleware,
    orderBookController.updateOrderDetail
);

// Xoá detail
router.delete(
    "/details/:id",
    authMiddleware,
    orderBookController.deleteOrderDetail
);


export default router;