import OrderBook from "../models/OrderBook.js";
import OrderDetail from "../models/OrderDetail.js";
import Book from "../models/Book.js";

class ServiceError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}


// =====================================================
// LẤY DANH SÁCH ĐƠN HÀNG CỦA USER
// =====================================================

const getMyOrders = async (userId, options = {}) => {
    const {
        page = 1,
        limit = 10,
    } = options;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
        userId,
    };

    const [orders, total] = await Promise.all([
        OrderBook.find(filter)
            .populate("typeShipId")
            .populate("voucherId")
            .sort("-createdAt")
            .skip(skip)
            .limit(limitNumber),

        OrderBook.countDocuments(filter),
    ]);

    const orderIds = orders.map((order) => order._id);

    const details = await OrderDetail.find({
        orderId: { $in: orderIds },
    })
        .populate(
            "bookId",
            "title slug images price discountPrice"
        )
        .sort("createdAt");

    const result = orders.map((order) => {
        const orderDetails = details.filter(
            (detail) =>
                detail.orderId.toString() === order._id.toString()
        );

        const totalMoney = orderDetails.reduce(
            (total, detail) =>
                total + detail.realPrice * detail.quantity,
            0
        );

        return {
            ...order.toObject(),
            details: orderDetails,
            totalMoney,
        };
    });

    return {
        orders: result,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.max(
            1,
            Math.ceil(total / limitNumber)
        ),
    };
};


// =====================================================
// LẤY CHI TIẾT 1 ĐƠN HÀNG CỦA USER
// =====================================================

const getMyOrderById = async (userId, orderId) => {
    const order = await OrderBook.findOne({
        _id: orderId,
        userId,
    })
        .populate("typeShipId")
        .populate("voucherId");

    if (!order) {
        throw new ServiceError(
            "Không tìm thấy đơn hàng",
            404
        );
    }

    const details = await OrderDetail.find({
        orderId: order._id,
    }).populate(
        "bookId",
        "title slug images price discountPrice"
    );

    const totalMoney = details.reduce(
        (total, detail) =>
            total + detail.realPrice * detail.quantity,
        0
    );

    return {
        ...order.toObject(),
        details,
        totalMoney,
    };
};


// =====================================================
// TẠO ĐƠN HÀNG
// =====================================================

const createOrder = async (userId, data) => {
    const {
        addressUserId,
        statusId,
        typeShipId,
        voucherId,
        note,
        isPaymentOnline,
        shipperId,
        image,
        details,
    } = data;

    if (!Array.isArray(details) || details.length === 0) {
        throw new ServiceError(
            "Đơn hàng phải có ít nhất một sách"
        );
    }

    // Kiểm tra từng sách
    for (const item of details) {
        if (!item.bookId) {
            throw new ServiceError(
                "Thiếu bookId trong chi tiết đơn hàng"
            );
        }

        if (!item.quantity || Number(item.quantity) < 1) {
            throw new ServiceError(
                "Số lượng sách phải lớn hơn 0"
            );
        }

        const book = await Book.findById(item.bookId);

        if (!book) {
            throw new ServiceError(
                `Không tìm thấy sách ${item.bookId}`,
                404
            );
        }

        if (book.status !== "active") {
            throw new ServiceError(
                `Sách "${book.title}" hiện không bán`
            );
        }

        if (book.stock < Number(item.quantity)) {
            throw new ServiceError(
                `Sách "${book.title}" không đủ số lượng`
            );
        }
    }

    // Tạo OrderBook
    const order = await OrderBook.create({
        userId,
        addressUserId: addressUserId || null,
        statusId: statusId || null,
        typeShipId: typeShipId || null,
        voucherId: voucherId || null,
        note: note || null,
        isPaymentOnline: Boolean(isPaymentOnline),
        shipperId: shipperId || null,
        image: image || null,
    });

    try {
        const orderDetails = [];

        for (const item of details) {
            const book = await Book.findById(item.bookId);

            const price =
                item.realPrice !== undefined
                    ? Number(item.realPrice)
                    : Number(
                        book.discountPrice > 0
                            ? book.discountPrice
                            : book.price
                    );

            const orderDetail = await OrderDetail.create({
                orderId: order._id,
                bookId: item.bookId,
                quantity: Number(item.quantity),
                realPrice: price,
            });

            orderDetails.push(orderDetail);

            // Trừ tồn kho
            book.stock -= Number(item.quantity);
            book.sold += Number(item.quantity);

            if (book.stock === 0) {
                book.status = "out_of_stock";
            }

            await book.save();
        }

        return {
            ...order.toObject(),
            details: orderDetails,
        };
    } catch (error) {
        // Nếu tạo detail lỗi thì xoá order vừa tạo
        await OrderBook.findByIdAndDelete(order._id);

        throw error;
    }
};


// =====================================================
// CẬP NHẬT ĐƠN HÀNG
// =====================================================

const updateOrder = async (userId, orderId, data) => {
    const order = await OrderBook.findOne({
        _id: orderId,
        userId,
    });

    if (!order) {
        throw new ServiceError(
            "Không tìm thấy đơn hàng",
            404
        );
    }

    const allowedFields = [
        "addressUserId",
        "statusId",
        "typeShipId",
        "voucherId",
        "note",
        "isPaymentOnline",
        "shipperId",
        "image",
    ];

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            order[field] = data[field];
        }
    });

    await order.save();

    return order;
};


// =====================================================
// XOÁ ĐƠN HÀNG
// =====================================================

const deleteOrder = async (userId, orderId) => {
    const order = await OrderBook.findOne({
        _id: orderId,
        userId,
    });

    if (!order) {
        throw new ServiceError(
            "Không tìm thấy đơn hàng",
            404
        );
    }

    await OrderDetail.deleteMany({
        orderId: order._id,
    });

    await OrderBook.findByIdAndDelete(order._id);

    return true;
};


// =====================================================
// LẤY CHI TIẾT SẢN PHẨM/SÁCH TRONG ĐƠN
// =====================================================

const getOrderDetails = async (userId, orderId) => {
    const order = await OrderBook.findOne({
        _id: orderId,
        userId,
    });

    if (!order) {
        throw new ServiceError(
            "Không tìm thấy đơn hàng",
            404
        );
    }

    return OrderDetail.find({
        orderId,
    }).populate(
        "bookId",
        "title slug images price discountPrice"
    );
};


// =====================================================
// LẤY 1 DETAIL
// =====================================================

const getOrderDetailById = async (userId, detailId) => {
    const detail = await OrderDetail.findById(detailId)
        .populate(
            "bookId",
            "title slug images price discountPrice"
        )
        .populate("orderId");

    if (!detail) {
        throw new ServiceError(
            "Không tìm thấy chi tiết đơn hàng",
            404
        );
    }

    if (
        !detail.orderId.userId ||
        detail.orderId.userId.toString() !== userId.toString()
    ) {
        throw new ServiceError(
            "Bạn không có quyền xem chi tiết đơn hàng này",
            403
        );
    }

    return detail;
};


// =====================================================
// THÊM SÁCH VÀO ĐƠN
// =====================================================

const createOrderDetail = async (
    userId,
    orderId,
    data
) => {
    const order = await OrderBook.findOne({
        _id: orderId,
        userId,
    });

    if (!order) {
        throw new ServiceError(
            "Không tìm thấy đơn hàng",
            404
        );
    }

    if (!data.bookId) {
        throw new ServiceError("Thiếu bookId");
    }

    const book = await Book.findById(data.bookId);

    if (!book) {
        throw new ServiceError(
            "Không tìm thấy sách",
            404
        );
    }

    const quantity = Number(data.quantity);

    if (!quantity || quantity < 1) {
        throw new ServiceError(
            "Số lượng phải lớn hơn 0"
        );
    }

    if (book.stock < quantity) {
        throw new ServiceError(
            "Sách không đủ số lượng"
        );
    }

    const realPrice =
        data.realPrice !== undefined
            ? Number(data.realPrice)
            : book.discountPrice > 0
                ? book.discountPrice
                : book.price;

    const detail = await OrderDetail.create({
        orderId,
        bookId: data.bookId,
        quantity,
        realPrice,
    });

    return detail.populate(
        "bookId",
        "title slug images price discountPrice"
    );
};


// =====================================================
// CẬP NHẬT DETAIL
// =====================================================

const updateOrderDetail = async (
    userId,
    detailId,
    data
) => {
    const detail = await OrderDetail.findById(detailId)
        .populate("orderId");

    if (!detail) {
        throw new ServiceError(
            "Không tìm thấy chi tiết đơn hàng",
            404
        );
    }

    if (
        detail.orderId.userId.toString() !== userId.toString()
    ) {
        throw new ServiceError(
            "Bạn không có quyền cập nhật",
            403
        );
    }

    if (data.quantity !== undefined) {
        const quantity = Number(data.quantity);

        if (quantity < 1) {
            throw new ServiceError(
                "Số lượng phải lớn hơn 0"
            );
        }

        detail.quantity = quantity;
    }

    if (data.realPrice !== undefined) {
        detail.realPrice = Number(data.realPrice);
    }

    await detail.save();

    return detail.populate(
        "bookId",
        "title slug images price discountPrice"
    );
};


// =====================================================
// XOÁ DETAIL
// =====================================================

const deleteOrderDetail = async (
    userId,
    detailId
) => {
    const detail = await OrderDetail.findById(detailId)
        .populate("orderId");

    if (!detail) {
        throw new ServiceError(
            "Không tìm thấy chi tiết đơn hàng",
            404
        );
    }

    if (
        detail.orderId.userId.toString() !== userId.toString()
    ) {
        throw new ServiceError(
            "Bạn không có quyền xoá",
            403
        );
    }

    await OrderDetail.findByIdAndDelete(detailId);

    return true;
};


export default {
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
};