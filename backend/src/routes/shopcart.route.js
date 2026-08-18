// shopcart.route.js
// Định nghĩa các API liên quan đến giỏ hàng.

import express from "express";
import shopCartController from "../controllers/shopcart.controller.js";

const router = express.Router();


// ============================================================
// LẤY TOÀN BỘ GIỎ HÀNG CỦA USER
// GET /api/shopcart/:userId
// ============================================================

router.get(
    "/:userId",
    shopCartController.getAllShopCartByUserId
);


// ============================================================
// THÊM SÁCH VÀO GIỎ HÀNG
// POST /api/shopcart
// ============================================================

router.post(
    "/",
    shopCartController.addShopCart
);


// ============================================================
// CẬP NHẬT SỐ LƯỢNG
// PUT /api/shopcart/:id
// ============================================================

router.put(
    "/:id",
    shopCartController.updateQuantity
);


// ============================================================
// XOÁ SẢN PHẨM
// DELETE /api/shopcart/:id
// ============================================================

router.delete(
    "/:id",
    shopCartController.deleteItemShopCart
);
router.delete(
    "/clear/:userId",
    shopCartController.clearShopCart
);

export default router;