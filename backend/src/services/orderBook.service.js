import OrderBook from "../models/OrderBook.js";
import OrderDetail from "../models/OrderDetail.js";

// =====================================================
// CUSTOMER - HELPER
// =====================================================

const ensureOwnOrder = async (userId, orderId) => {
    const order = await OrderBook.findById(orderId);

    if (!order) {
        const error = new Error("Không tìm thấy đơn hàng");
        error.statusCode = 404;
        throw error;
    }

    if (String(order.userId) !== String(userId)) {
        const error = new Error(
            "Bạn không có quyền truy cập đơn hàng này"
        );

        error.statusCode = 403;
        throw error;
    }

    return order;
};

// =====================================================
// CUSTOMER - ORDER BOOK
// =====================================================

const getMyOrders = async (userId, query = {}) => {
    const filter = {
        userId,
    };

    if (query.statusId) {
        filter.statusId = query.statusId;
    }

    return await OrderBook.find(filter).sort({
        createdAt: -1,
    });
};

const getMyOrderById = async (userId, orderId) => {
    return await ensureOwnOrder(
        userId,
        orderId
    );
};

const createOrder = async (userId, data) => {
    const order = await OrderBook.create({
        ...data,
        userId,
        statusId:
            data.statusId || "pending",
    });

    return order;
};

// =====================================================
// CUSTOMER - UPDATE ORDER
// =====================================================

const CUSTOMER_CANCELLABLE_STATUSES = [
    "pending",
    "confirmed",
];

const updateOrder = async (
    userId,
    orderId,
    data
) => {
    const order =
        await ensureOwnOrder(
            userId,
            orderId
        );

    if (data.statusId !== undefined) {
        if (
            data.statusId === "cancelled" &&
            !CUSTOMER_CANCELLABLE_STATUSES.includes(
                order.statusId
            )
        ) {
            const error = new Error(
                "Đơn hàng đã được xử lý, không thể huỷ"
            );

            error.statusCode = 400;
            throw error;
        }

        order.statusId =
            data.statusId;
    }

    if (data.note !== undefined) {
        order.note = data.note;
    }

    return await order.save();
};

// =====================================================
// CUSTOMER - DELETE ORDER
// =====================================================

const deleteOrder = async (
    userId,
    orderId
) => {
    const order =
        await ensureOwnOrder(
            userId,
            orderId
        );

    await OrderDetail.deleteMany({
        orderId,
    });

    await OrderBook.findByIdAndDelete(
        orderId
    );

    return order;
};

// =====================================================
// CUSTOMER - ORDER DETAIL
// =====================================================

const getOrderDetails = async (
    userId,
    orderId
) => {
    await ensureOwnOrder(
        userId,
        orderId
    );

    return await OrderDetail.find({
        orderId,
    })
        .populate({
            path: "bookId",
            select:
                "_id title name images image",
        })
        .sort({
            createdAt: -1,
        });
};

const getOrderDetailById = async (
    userId,
    id
) => {
    const detail =
        await OrderDetail.findById(id)
            .populate({
                path: "bookId",
                select:
                    "_id title name images image",
            });

    if (!detail) {
        const error = new Error(
            "Không tìm thấy chi tiết đơn hàng"
        );

        error.statusCode = 404;
        throw error;
    }

    await ensureOwnOrder(
        userId,
        detail.orderId
    );

    return detail;
};

const createOrderDetail = async (
    userId,
    orderId,
    data
) => {
    await ensureOwnOrder(
        userId,
        orderId
    );

    const {
        bookId,
        quantity,
        realPrice,
    } = data;

    if (!bookId) {
        const error = new Error(
            "bookId không được để trống"
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        !quantity ||
        Number(quantity) < 1
    ) {
        const error = new Error(
            "Số lượng phải lớn hơn 0"
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        realPrice === undefined ||
        Number(realPrice) < 0
    ) {
        const error = new Error(
            "Giá thực tế không hợp lệ"
        );

        error.statusCode = 400;
        throw error;
    }

    const detail =
        await OrderDetail.create({
            orderId,
            bookId,
            quantity:
                Number(quantity),
            realPrice:
                Number(realPrice),
        });

    return await OrderDetail.findById(
        detail._id
    ).populate({
        path: "bookId",
        select:
            "_id title name images image",
    });
};

const updateOrderDetail = async (
    userId,
    id,
    data
) => {
    const detail =
        await OrderDetail.findById(id);

    if (!detail) {
        const error = new Error(
            "Không tìm thấy chi tiết đơn hàng"
        );

        error.statusCode = 404;
        throw error;
    }

    await ensureOwnOrder(
        userId,
        detail.orderId
    );

    if (data.quantity !== undefined) {
        if (
            Number(data.quantity) < 1
        ) {
            const error = new Error(
                "Số lượng phải lớn hơn 0"
            );

            error.statusCode = 400;
            throw error;
        }

        detail.quantity =
            Number(data.quantity);
    }

    if (data.realPrice !== undefined) {
        if (
            Number(data.realPrice) < 0
        ) {
            const error = new Error(
                "Giá thực tế không hợp lệ"
            );

            error.statusCode = 400;
            throw error;
        }

        detail.realPrice =
            Number(data.realPrice);
    }

    if (data.bookId !== undefined) {
        detail.bookId =
            data.bookId;
    }

    await detail.save();

    return await OrderDetail.findById(
        detail._id
    ).populate({
        path: "bookId",
        select:
            "_id title name images image",
    });
};

const deleteOrderDetail = async (
    userId,
    id
) => {
    const detail =
        await OrderDetail.findById(id);

    if (!detail) {
        const error = new Error(
            "Không tìm thấy chi tiết đơn hàng"
        );

        error.statusCode = 404;
        throw error;
    }

    await ensureOwnOrder(
        userId,
        detail.orderId
    );

    await OrderDetail.findByIdAndDelete(
        id
    );

    return detail;
};

// =====================================================
// ADMIN - LẤY TẤT CẢ ĐƠN HÀNG
// =====================================================

const getAllOrderBooks = async () => {
    return await OrderBook.find()
        .sort({
            createdAt: -1,
        });
};

// =====================================================
// ADMIN - LẤY 1 ĐƠN
// =====================================================

const getOrderBookByIdAdmin = async (
    id
) => {
    const order =
        await OrderBook.findById(id);

    if (!order) {
        const error = new Error(
            "Không tìm thấy đơn hàng"
        );

        error.statusCode = 404;
        throw error;
    }

    return order;
};

// =====================================================
// ADMIN - LẤY CHI TIẾT + THÔNG TIN SẢN PHẨM
// =====================================================

// =====================================================
// ADMIN - ORDER DETAIL
// Admin xem chi tiết sản phẩm của bất kỳ đơn hàng nào
// =====================================================

const getOrderDetailsAdmin = async (orderId) => {
    const order = await OrderBook.findById(orderId);

    if (!order) {
        const error = new Error("Không tìm thấy đơn hàng");
        error.statusCode = 404;
        throw error;
    }

    return await OrderDetail.find({
        orderId,
    })
        .populate({
            path: "bookId",
            select: "_id title name images image price",
        })
        .sort({
            createdAt: -1,
        });
};

// =====================================================
// ADMIN - CHỈ ĐƯỢC ĐỔI STATUS
// =====================================================

const updateOrderAdmin = async (id, data) => {
    const order = await OrderBook.findById(id);

    if (!order) {
        const error = new Error("Không tìm thấy đơn hàng");
        error.statusCode = 404;
        throw error;
    }

    let statusId = data.statusId;

    // Nếu frontend lỡ gửi object:
    // { _id: "...", name: "Đã xác nhận", code: "confirmed" }
    // thì lấy code/statusId tương ứng
    if (typeof statusId === "object" && statusId !== null) {
        statusId =
            statusId.statusId ||
            statusId.code ||
            statusId._id;
    }

    if (!statusId || typeof statusId !== "string") {
        const error = new Error(
            "Trạng thái đơn hàng không hợp lệ"
        );
        error.statusCode = 400;
        throw error;
    }

    // CHỈ cập nhật statusId
    order.statusId = statusId;

    await order.save();

    return order;
};

// =====================================================
// ADMIN - DELETE
// =====================================================

const deleteOrderBookAdmin = async (
    id
) => {
    const order =
        await OrderBook.findById(id);

    if (!order) {
        const error = new Error(
            "Không tìm thấy đơn hàng"
        );

        error.statusCode = 404;
        throw error;
    }

    await OrderDetail.deleteMany({
        orderId: id,
    });

    await OrderBook.findByIdAndDelete(
        id
    );

    return order;
};

// =====================================================
// ADMIN - ORDER DETAIL
// Admin xem chi tiết sản phẩm của bất kỳ đơn hàng nào
// =====================================================


// =====================================================
// EXPORT
// =====================================================

export default {
    // customer
    getMyOrders,
    getMyOrderById,
    createOrder,
    updateOrder,
    deleteOrder,

    getOrderDetails,
    getOrderDetailById,
    createOrderDetail,
    updateOrderDetail,
    deleteOrderDetail,

    // admin
    getAllOrderBooks,
    getOrderBookByIdAdmin,
    getOrderDetailsAdmin,
    updateOrderAdmin,
    deleteOrderBookAdmin,

};