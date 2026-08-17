import shippingTypeService from "../services/shippingType.service.js";

// GET /api/shipping-types
// Lấy danh sách tất cả loại vận chuyển
const getAllShippingTypes = async (req, res) => {
    try {
        const data = await shippingTypeService.getAllShippingTypes();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách loại vận chuyển:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy danh sách loại vận chuyển",
        });
    }
};

// GET /api/shipping-types/:id
// Lấy thông tin một loại vận chuyển
const getShippingTypeById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await shippingTypeService.getShippingTypeById(id);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Lỗi lấy loại vận chuyển:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy loại vận chuyển",
        });
    }
};

// POST /api/shipping-types
// Thêm loại vận chuyển
const createShippingType = async (req, res) => {
    try {
        const { type, price } = req.body;

        const data = await shippingTypeService.createShippingType({
            type,
            price,
        });

        return res.status(201).json({
            success: true,
            message: "Thêm loại vận chuyển thành công",
            data,
        });
    } catch (error) {
        console.error("Lỗi thêm loại vận chuyển:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể thêm loại vận chuyển",
        });
    }
};

// PUT /api/shipping-types/:id
// Cập nhật loại vận chuyển
const updateShippingType = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, price } = req.body;

        const data = await shippingTypeService.updateShippingType(id, {
            type,
            price,
        });

        return res.status(200).json({
            success: true,
            message: "Cập nhật loại vận chuyển thành công",
            data,
        });
    } catch (error) {
        console.error("Lỗi cập nhật loại vận chuyển:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể cập nhật loại vận chuyển",
        });
    }
};

// DELETE /api/shipping-types/:id
// Xóa loại vận chuyển
const deleteShippingType = async (req, res) => {
    try {
        const { id } = req.params;

        await shippingTypeService.deleteShippingType(id);

        return res.status(200).json({
            success: true,
            message: "Xóa loại vận chuyển thành công",
        });
    } catch (error) {
        console.error("Lỗi xóa loại vận chuyển:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể xóa loại vận chuyển",
        });
    }
};

export default {
    getAllShippingTypes,
    getShippingTypeById,
    createShippingType,
    updateShippingType,
    deleteShippingType,
};