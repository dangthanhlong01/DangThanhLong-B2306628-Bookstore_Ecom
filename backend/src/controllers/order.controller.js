import orderBookService from "../services/order.service.js";


// =====================================================
// GET /api/order-books
// Lấy đơn hàng của user đang đăng nhập
// =====================================================

const getOrderBooks = async (req, res) => {
    try {
        const result = await orderBookService.getMyOrders(
            req.user.id,
            req.query
        );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy danh sách đơn hàng",
        });
    }
};


// =====================================================
// GET /api/order-books/:id
// =====================================================

const getOrderBookById = async (req, res) => {
    try {
        const order =
            await orderBookService.getMyOrderById(
                req.user.id,
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết đơn hàng:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy chi tiết đơn hàng",
        });
    }
};


// =====================================================
// POST /api/order-books
// =====================================================

const createOrderBook = async (req, res) => {
    try {
        const order =
            await orderBookService.createOrder(
                req.user.id,
                req.body
            );

        return res.status(201).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể tạo đơn hàng",
        });
    }
};


// =====================================================
// PUT /api/order-books/:id
// =====================================================

const updateOrderBook = async (req, res) => {
    try {
        const order =
            await orderBookService.updateOrder(
                req.user.id,
                req.params.id,
                req.body
            );

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật đơn hàng:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể cập nhật đơn hàng",
        });
    }
};


// =====================================================
// DELETE /api/order-books/:id
// =====================================================

const deleteOrderBook = async (req, res) => {
    try {
        await orderBookService.deleteOrder(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Xoá đơn hàng thành công",
        });
    } catch (error) {
        console.error(
            "Lỗi xoá đơn hàng:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể xoá đơn hàng",
        });
    }
};


// =====================================================
// GET /api/order-books/:orderId/details
// =====================================================

const getOrderDetails = async (req, res) => {
    try {
        const details =
            await orderBookService.getOrderDetails(
                req.user.id,
                req.params.orderId
            );

        return res.status(200).json({
            success: true,
            data: details,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết sách trong đơn:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy chi tiết đơn hàng",
        });
    }
};


// =====================================================
// GET /api/order-books/details/:id
// =====================================================

const getOrderDetailById = async (req, res) => {
    try {
        const detail =
            await orderBookService.getOrderDetailById(
                req.user.id,
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: detail,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy detail:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy chi tiết",
        });
    }
};


// =====================================================
// POST /api/order-books/:orderId/details
// =====================================================

const createOrderDetail = async (req, res) => {
    try {
        const detail =
            await orderBookService.createOrderDetail(
                req.user.id,
                req.params.orderId,
                req.body
            );

        return res.status(201).json({
            success: true,
            data: detail,
        });
    } catch (error) {
        console.error(
            "Lỗi thêm sách vào đơn:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể thêm sách vào đơn",
        });
    }
};


// =====================================================
// PUT /api/order-books/details/:id
// =====================================================

const updateOrderDetail = async (req, res) => {
    try {
        const detail =
            await orderBookService.updateOrderDetail(
                req.user.id,
                req.params.id,
                req.body
            );

        return res.status(200).json({
            success: true,
            data: detail,
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật chi tiết:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể cập nhật chi tiết",
        });
    }
};


// =====================================================
// DELETE /api/order-books/details/:id
// =====================================================

const deleteOrderDetail = async (req, res) => {
    try {
        await orderBookService.deleteOrderDetail(
            req.user.id,
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Xoá sách khỏi đơn thành công",
        });
    } catch (error) {
        console.error(
            "Lỗi xoá chi tiết:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Không thể xoá chi tiết",
        });
    }
};


export default {
    getOrderBooks,
    getOrderBookById,
    createOrderBook,
    updateOrderBook,
    deleteOrderBook,
    getOrderDetails,
    getOrderDetailById,
    createOrderDetail,
    updateOrderDetail,
    deleteOrderDetail,
};