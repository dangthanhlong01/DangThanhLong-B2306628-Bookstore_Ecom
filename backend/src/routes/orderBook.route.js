import express from "express";

import orderBookController from "../controllers/orderBook.controller.js";

import {
    authMiddleware,
    adminMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// =====================================================
// ADMIN - ORDER BOOK
// =====================================================

// -----------------------------------------------------
// 1. ADMIN LẤY TẤT CẢ ĐƠN HÀNG
// GET /api/order-books/admin/all
// -----------------------------------------------------
router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    orderBookController.getAllOrderBooks
);

// -----------------------------------------------------
// 2. ADMIN XEM 1 ĐƠN HÀNG
// GET /api/order-books/admin/:id
// -----------------------------------------------------
router.get(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    orderBookController.getOrderBookByIdAdmin
);

// -----------------------------------------------------
// 3. ADMIN XEM SẢN PHẨM TRONG ĐƠN
// GET /api/order-books/admin/:orderId/details
//
// API này dùng để modal "Xem chi tiết" lấy:
// - bookId
// - title
// - image
// - images
// - quantity
// - realPrice
// -----------------------------------------------------
router.get(
    "/admin/:orderId/details",
    authMiddleware,
    adminMiddleware,
    orderBookController.getOrderDetailsAdmin
);

// -----------------------------------------------------
// 4. ADMIN CHỈ ĐƯỢC CẬP NHẬT TRẠNG THÁI
//
// PUT /api/order-books/admin/:id/status
//
// Body:
// {
//     "statusId": "confirmed"
// }
//
// KHÔNG cho sửa:
// - typeShipId
// - addressUserId
// - voucherId
// - userId
// - totalPrice
// - note
// -----------------------------------------------------
router.put(
    "/admin/:id/status",
    authMiddleware,
    adminMiddleware,
    orderBookController.updateOrderBookAdmin
);

// -----------------------------------------------------
// 5. ADMIN XÓA ĐƠN
// DELETE /api/order-books/admin/:id
// -----------------------------------------------------
router.delete(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    orderBookController.deleteOrderBookAdmin
);


// =====================================================
// CUSTOMER - ORDER BOOK
// =====================================================

// -----------------------------------------------------
// 6. CUSTOMER LẤY DANH SÁCH ĐƠN CỦA MÌNH
// GET /api/order-books
// -----------------------------------------------------
router.get(
    "/",
    authMiddleware,
    orderBookController.getOrderBooks
);

// -----------------------------------------------------
// 7. CUSTOMER TẠO ĐƠN
// POST /api/order-books
// -----------------------------------------------------
router.post(
    "/",
    authMiddleware,
    orderBookController.createOrderBook
);


// =====================================================
// CUSTOMER - ORDER DETAIL
// =====================================================

// -----------------------------------------------------
// 8. CUSTOMER XEM SẢN PHẨM TRONG ĐƠN
// GET /api/order-books/:orderId/details
// -----------------------------------------------------
router.get(
    "/:orderId/details",
    authMiddleware,
    orderBookController.getOrderDetails
);

// -----------------------------------------------------
// 9. CUSTOMER THÊM SẢN PHẨM VÀO ĐƠN
// POST /api/order-books/:orderId/details
// -----------------------------------------------------
router.post(
    "/:orderId/details",
    authMiddleware,
    orderBookController.createOrderDetail
);

// -----------------------------------------------------
// 10. CUSTOMER XEM 1 CHI TIẾT ĐƠN
// GET /api/order-books/details/:id
// -----------------------------------------------------
router.get(
    "/details/:id",
    authMiddleware,
    orderBookController.getOrderDetailById
);

// -----------------------------------------------------
// 11. CUSTOMER SỬA CHI TIẾT
// PUT /api/order-books/details/:id
// -----------------------------------------------------
router.put(
    "/details/:id",
    authMiddleware,
    orderBookController.updateOrderDetail
);

// -----------------------------------------------------
// 12. CUSTOMER XÓA CHI TIẾT
// DELETE /api/order-books/details/:id
// -----------------------------------------------------
router.delete(
    "/details/:id",
    authMiddleware,
    orderBookController.deleteOrderDetail
);


// =====================================================
// CUSTOMER - ORDER
// =====================================================

// -----------------------------------------------------
// 13. CUSTOMER XEM 1 ĐƠN
// GET /api/order-books/:id
// -----------------------------------------------------
router.get(
    "/:id",
    authMiddleware,
    orderBookController.getOrderBookById
);

// -----------------------------------------------------
// 14. CUSTOMER CẬP NHẬT ĐƠN
// Ví dụ: hủy đơn
// PUT /api/order-books/:id
// -----------------------------------------------------
router.put(
    "/:id",
    authMiddleware,
    orderBookController.updateOrderBook
);

// -----------------------------------------------------
// 15. CUSTOMER XÓA ĐƠN
// DELETE /api/order-books/:id
// -----------------------------------------------------
router.delete(
    "/:id",
    authMiddleware,
    orderBookController.deleteOrderBook
);


export default router;