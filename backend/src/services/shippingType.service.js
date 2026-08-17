import ShippingType from "../models/ShippingType.js";

// Lấy tất cả loại vận chuyển
const getAllShippingTypes = async () => {
    return await ShippingType.find().sort({ createdAt: -1 });
};

// Lấy 1 loại vận chuyển theo ID
const getShippingTypeById = async (id) => {
    const shippingType = await ShippingType.findById(id);

    if (!shippingType) {
        const error = new Error("Không tìm thấy loại vận chuyển");
        error.statusCode = 404;
        throw error;
    }

    return shippingType;
};

// Thêm loại vận chuyển
const createShippingType = async ({ type, price }) => {
    if (!type || type.trim() === "") {
        const error = new Error("Tên loại vận chuyển không được để trống");
        error.statusCode = 400;
        throw error;
    }

    if (price === undefined || price === null || price === "") {
        const error = new Error("Giá tiền không được để trống");
        error.statusCode = 400;
        throw error;
    }

    if (Number(price) < 0) {
        const error = new Error("Giá tiền không được nhỏ hơn 0");
        error.statusCode = 400;
        throw error;
    }

    const shippingType = await ShippingType.create({
        type: type.trim(),
        price: Number(price),
    });

    return shippingType;
};

// Cập nhật loại vận chuyển
const updateShippingType = async (id, { type, price }) => {
    console.log("ID cần update:", id);

    const shippingType = await ShippingType.findById(id);

    console.log("Document tìm được:", shippingType);

    if (!shippingType) {
        const error = new Error("Không tìm thấy loại vận chuyển");
        error.statusCode = 404;
        throw error;
    }

    if (type !== undefined) {
        if (!type || type.trim() === "") {
            const error = new Error("Tên loại vận chuyển không được để trống");
            error.statusCode = 400;
            throw error;
        }

        shippingType.type = type.trim();
    }

    if (price !== undefined) {
        if (price === null || price === "" || Number(price) < 0) {
            const error = new Error("Giá tiền không hợp lệ");
            error.statusCode = 400;
            throw error;
        }

        shippingType.price = Number(price);
    }

    return await shippingType.save();
};

// Xóa loại vận chuyển
const deleteShippingType = async (id) => {
    const shippingType = await ShippingType.findById(id);

    if (!shippingType) {
        const error = new Error("Không tìm thấy loại vận chuyển");
        error.statusCode = 404;
        throw error;
    }

    await ShippingType.findByIdAndDelete(id);

    return shippingType;
};

export default {
    getAllShippingTypes,
    getShippingTypeById,
    createShippingType,
    updateShippingType,
    deleteShippingType,
};