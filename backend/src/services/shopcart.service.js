// shopcart.service.js
// Chứa toàn bộ logic nghiệp vụ của giỏ hàng.
// ShopCart liên kết trực tiếp với Book thông qua bookId.

import ShopCart from "../models/Shopcart.js";
import Book from "../models/Book.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";


// ============================================================
// LẤY TOÀN BỘ GIỎ HÀNG CỦA USER
// ============================================================

const getAllShopCartByUserId = async (userId) => {

    if (!userId) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Thiếu userId",
        };
    }


    // Lấy các sản phẩm đang active trong giỏ hàng
    // populate bookId để lấy thông tin sách từ collection Book
    const cartItems = await ShopCart.find({
        userId,
        statusId: "active",
    })
        .populate({
            path: "bookId",
            select: "title images price discountPrice stock status",
        })
        .sort({ createdAt: -1 });


    // Format lại dữ liệu để frontend sử dụng dễ dàng hơn
    const data = cartItems.map((item) => {

        const book = item.bookId;

        // Nếu có discountPrice > 0 thì dùng giá giảm
        // Nếu không thì dùng giá gốc
        const unitPrice =
            book && book.discountPrice > 0
                ? book.discountPrice
                : book?.price || 0;


        return {
            _id: item._id,

            userId: item.userId,

            bookId: book?._id,

            quantity: item.quantity,

            // Thông tin sách
            book: book
                ? {
                    _id: book._id,

                    title: book.title,

                    image:
                        book.images && book.images.length > 0
                            ? book.images[0]
                            : "",

                    images: book.images || [],

                    price: book.price,

                    discountPrice: book.discountPrice,

                    // Giá thực tế dùng để tính tiền
                    unitPrice,

                    stock: book.stock,

                    status: book.status,
                }
                : null,

            // Thành tiền của sản phẩm
            totalPrice: unitPrice * item.quantity,
        };
    });


    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Lấy giỏ hàng thành công",
        data,
    };
};


// ============================================================
// THÊM SÁCH VÀO GIỎ HÀNG
// ============================================================

const addShopCart = async ({
    userId,
    bookId,
    quantity,
}) => {

    if (!userId || !bookId || quantity === undefined || quantity === null) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Thiếu dữ liệu bắt buộc (userId, bookId, quantity)",
        };
    }


    const qty = Number(quantity);


    if (Number.isNaN(qty) || qty <= 0) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Số lượng không hợp lệ",
        };
    }


    // ========================================================
    // KIỂM TRA SÁCH
    // ========================================================

    const book = await Book.findById(bookId);


    if (!book) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Không tìm thấy sách",
        };
    }


    // Kiểm tra trạng thái sách
    if (book.status !== "active") {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Sách hiện không được bán",
        };
    }


    // Kiểm tra tồn kho
    if (book.stock < qty) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Số lượng sách trong kho không đủ",
        };
    }


    // ========================================================
    // KIỂM TRA SÁCH ĐÃ CÓ TRONG GIỎ CHƯA
    // ========================================================

    let cartItem = await ShopCart.findOne({
        userId,
        bookId,
        statusId: "active",
    });


    if (cartItem) {

        // Nếu đã có thì cộng thêm số lượng
        const newQuantity = cartItem.quantity + qty;


        if (newQuantity > book.stock) {
            return {
                success: false,
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: "Số lượng vượt quá tồn kho",
            };
        }


        cartItem.quantity = newQuantity;

        await cartItem.save();

    } else {

        // Nếu chưa có thì tạo sản phẩm mới trong giỏ
        cartItem = await ShopCart.create({
            userId,
            bookId,
            quantity: qty,
            statusId: "active",
        });
    }


    // Populate lại Book để trả dữ liệu đầy đủ cho frontend
    await cartItem.populate({
        path: "bookId",
        select: "title images price discountPrice stock status",
    });


    const unitPrice =
        cartItem.bookId.discountPrice > 0
            ? cartItem.bookId.discountPrice
            : cartItem.bookId.price;


    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Thêm sách vào giỏ hàng thành công",

        data: {
            _id: cartItem._id,

            userId: cartItem.userId,

            bookId: cartItem.bookId._id,

            quantity: cartItem.quantity,

            book: {
                _id: cartItem.bookId._id,

                title: cartItem.bookId.title,

                image:
                    cartItem.bookId.images?.length > 0
                        ? cartItem.bookId.images[0]
                        : "",

                images: cartItem.bookId.images || [],

                price: cartItem.bookId.price,

                discountPrice: cartItem.bookId.discountPrice,

                unitPrice,

                stock: cartItem.bookId.stock,

                status: cartItem.bookId.status,
            },

            totalPrice: unitPrice * cartItem.quantity,
        },
    };
};


// ============================================================
// CẬP NHẬT SỐ LƯỢNG
// ============================================================

const updateQuantity = async ({
    id,
    userId,
    quantity,
}) => {

    if (!id || !userId || quantity === undefined || quantity === null) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Thiếu dữ liệu bắt buộc",
        };
    }


    const qty = Number(quantity);


    if (Number.isNaN(qty) || qty <= 0) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Số lượng không hợp lệ",
        };
    }


    // Chỉ cho phép user cập nhật cart của chính mình
    const cartItem = await ShopCart.findOne({
        _id: id,
        userId,
        statusId: "active",
    });


    if (!cartItem) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Không tìm thấy sản phẩm trong giỏ hàng",
        };
    }


    // Lấy thông tin sách để kiểm tra tồn kho
    const book = await Book.findById(cartItem.bookId);


    if (!book) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Không tìm thấy sách",
        };
    }


    if (qty > book.stock) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Số lượng vượt quá tồn kho",
        };
    }


    // Cập nhật số lượng
    cartItem.quantity = qty;

    await cartItem.save();


    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Cập nhật số lượng thành công",
        data: cartItem,
    };
};


// ============================================================
// XOÁ SẢN PHẨM KHỎI GIỎ HÀNG
// ============================================================

const deleteItemShopCart = async ({
    id,
    userId,
}) => {

    if (!id || !userId) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Thiếu id hoặc userId",
        };
    }


    // Chỉ xóa sản phẩm thuộc giỏ hàng của user
    const cartItem = await ShopCart.findOne({
        _id: id,
        userId,
        statusId: "active",
    });


    if (!cartItem) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Không tìm thấy sản phẩm trong giỏ hàng",
        };
    }


    await ShopCart.deleteOne({
        _id: id,
        userId,
    });


    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Xoá sản phẩm khỏi giỏ hàng thành công",
    };
};


export default {
    getAllShopCartByUserId,
    addShopCart,
    updateQuantity,
    deleteItemShopCart,
};