// shopcart.controller.js
// Controller nhận request từ frontend,
// gọi service xử lý nghiệp vụ rồi trả response.

import shopCartService from "../services/shopcart.service.js";


// ============================================================
// LẤY GIỎ HÀNG
// GET /api/shopcart/:userId
// ============================================================

const getAllShopCartByUserId = async (req, res) => {

    try {

        const { userId } = req.params;


        const result =
            await shopCartService.getAllShopCartByUserId(userId);


        return res
            .status(result.statusCode)
            .json(result);

    } catch (error) {

        console.error("Lỗi lấy giỏ hàng:", error);

        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Lỗi server khi lấy giỏ hàng",
        });
    }
};


// ============================================================
// THÊM SÁCH VÀO GIỎ
// POST /api/shopcart
// ============================================================

const addShopCart = async (req, res) => {

    try {

        const {
            userId,
            bookId,
            quantity,
        } = req.body;


        const result =
            await shopCartService.addShopCart({
                userId,
                bookId,
                quantity,
            });


        return res
            .status(result.statusCode)
            .json(result);

    } catch (error) {

        console.error("Lỗi thêm giỏ hàng:", error);

        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Lỗi server khi thêm vào giỏ hàng",
        });
    }
};


// ============================================================
// CẬP NHẬT SỐ LƯỢNG
// PUT /api/shopcart/:id
// ============================================================

const updateQuantity = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            userId,
            quantity,
        } = req.body;


        const result =
            await shopCartService.updateQuantity({
                id,
                userId,
                quantity,
            });


        return res
            .status(result.statusCode)
            .json(result);

    } catch (error) {

        console.error("Lỗi cập nhật số lượng:", error);

        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Lỗi server khi cập nhật số lượng",
        });
    }
};


// ============================================================
// XOÁ SẢN PHẨM
// DELETE /api/shopcart/:id
// ============================================================

const deleteItemShopCart = async (req, res) => {

    try {

        const { id } = req.params;

        const { userId } = req.body;


        const result =
            await shopCartService.deleteItemShopCart({
                id,
                userId,
            });


        return res
            .status(result.statusCode)
            .json(result);

    } catch (error) {

        console.error("Lỗi xoá sản phẩm:", error);

        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Lỗi server khi xoá sản phẩm",
        });
    }
};

// ============================================================
// XOÁ TOÀN BỘ GIỎ HÀNG
// DELETE /api/shopcart/clear/:userId
// ============================================================

const clearShopCart = async (req, res) => {

    try {

        const { userId } = req.params;

        const result =
            await shopCartService.clearShopCart(userId);

        return res
            .status(result.statusCode)
            .json(result);

    } catch (error) {

        console.error("Lỗi xoá toàn bộ giỏ hàng:", error);

        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Lỗi server khi xoá toàn bộ giỏ hàng",
        });
    }
};
export default {
    getAllShopCartByUserId,
    addShopCart,
    updateQuantity,
    deleteItemShopCart,
    clearShopCart,
};