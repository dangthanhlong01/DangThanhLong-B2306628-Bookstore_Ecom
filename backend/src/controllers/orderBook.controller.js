import orderBookService from "../services/orderBook.service.js";

// =====================================================
// CUSTOMER - ORDER BOOK
// =====================================================

const getOrderBooks = async (
    req,
    res
) => {
    try {
        const data =
            await orderBookService.getMyOrders(
                req.user.id,
                req.query
            );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy danh sách đơn hàng",
        });
    }
};

const getOrderBookById = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        const data =
            await orderBookService.getMyOrderById(
                req.user.id,
                id
            );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy đơn hàng",
        });
    }
};

const createOrderBook = async (
    req,
    res
) => {
    try {
        const data =
            await orderBookService.createOrder(
                req.user.id,
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Tạo đơn hàng thành công",
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi tạo đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể tạo đơn hàng",
        });
    }
};

const updateOrderBook = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        const data =
            await orderBookService.updateOrder(
                req.user.id,
                id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Cập nhật đơn hàng thành công",
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể cập nhật đơn hàng",
        });
    }
};

const deleteOrderBook = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        await orderBookService.deleteOrder(
            req.user.id,
            id
        );

        return res.status(200).json({
            success: true,
            message:
                "Xóa đơn hàng thành công",
        });
    } catch (error) {
        console.error(
            "Lỗi xóa đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể xóa đơn hàng",
        });
    }
};

// =====================================================
// CUSTOMER - ORDER DETAIL
// =====================================================

const getOrderDetails = async (
    req,
    res
) => {
    try {
        const { orderId } =
            req.params;

        const data =
            await orderBookService.getOrderDetails(
                req.user.id,
                orderId
            );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy chi tiết đơn hàng",
        });
    }
};

const getOrderDetailById = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        const data =
            await orderBookService.getOrderDetailById(
                req.user.id,
                id
            );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy chi tiết đơn hàng",
        });
    }
};

const createOrderDetail = async (
    req,
    res
) => {
    try {
        const { orderId } =
            req.params;

        const data =
            await orderBookService.createOrderDetail(
                req.user.id,
                orderId,
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Thêm chi tiết đơn hàng thành công",
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi thêm chi tiết đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể thêm chi tiết đơn hàng",
        });
    }
};

const updateOrderDetail = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        const data =
            await orderBookService.updateOrderDetail(
                req.user.id,
                id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Cập nhật chi tiết đơn hàng thành công",
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật chi tiết đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể cập nhật chi tiết đơn hàng",
        });
    }
};

const deleteOrderDetail = async (
    req,
    res
) => {
    try {
        const { id } =
            req.params;

        await orderBookService.deleteOrderDetail(
            req.user.id,
            id
        );

        return res.status(200).json({
            success: true,
            message:
                "Xóa chi tiết đơn hàng thành công",
        });
    } catch (error) {
        console.error(
            "Lỗi xóa chi tiết đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể xóa chi tiết đơn hàng",
        });
    }
};

// =====================================================
// ADMIN
// =====================================================

const getAllOrderBooks = async (
    req,
    res
) => {
    try {
        const data =
            await orderBookService.getAllOrderBooks();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi admin lấy đơn hàng:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Không thể lấy danh sách đơn hàng",
        });
    }
};

const getOrderBookByIdAdmin =
    async (req, res) => {
        try {
            const { id } =
                req.params;

            const data =
                await orderBookService.getOrderBookByIdAdmin(
                    id
                );

            return res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            console.error(
                "Lỗi admin lấy đơn hàng:",
                error
            );

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Không thể lấy đơn hàng",
            });
        }
    };

const getOrderDetailsAdmin = async (req, res) => {
    try {
        const { orderId } = req.params;

        const data =
            await orderBookService.getOrderDetailsAdmin(orderId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết đơn hàng admin:",
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

const updateOrderBookAdmin =
    async (req, res) => {
        try {
            const { id } =
                req.params;

            // Chỉ lấy statusId
            // Các field khác bị bỏ qua
            const data =
                await orderBookService.updateOrderAdmin(
                    id,
                    {
                        statusId:
                            req.body.statusId,
                    }
                );

            return res.status(200).json({
                success: true,
                message:
                    "Cập nhật trạng thái đơn hàng thành công",
                data,
            });
        } catch (error) {
            console.error(
                "Lỗi cập nhật trạng thái admin:",
                error
            );

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Không thể cập nhật trạng thái đơn hàng",
            });
        }
    };

const deleteOrderBookAdmin =
    async (req, res) => {
        try {
            const { id } =
                req.params;

            await orderBookService.deleteOrderBookAdmin(
                id
            );

            return res.status(200).json({
                success: true,
                message:
                    "Xóa đơn hàng thành công",
            });
        } catch (error) {
            console.error(
                "Lỗi admin xóa đơn hàng:",
                error
            );

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Không thể xóa đơn hàng",
            });
        }
    };

export default {
    // customer
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

    // admin
    getAllOrderBooks,
    getOrderBookByIdAdmin,
    getOrderDetailsAdmin,
    updateOrderBookAdmin,
    deleteOrderBookAdmin,
};