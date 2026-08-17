// user.controller.js - Chỉ nhận request, gọi service, trả response
import userService from "../services/user.service.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";

const handleGetProfile = async (req, res) => {
    try {
        // req.user được gắn từ authMiddleware
        const result = await userService.getProfile(req.user._id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleUpdateProfile = async (req, res) => {
    try {
        const result = await userService.updateProfile(req.user._id, req.body);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleChangePassword = async (req, res) => {
    try {
        const result = await userService.changePassword(req.user._id, req.body);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleAddAddress = async (req, res) => {
    try {
        const result = await userService.addAddress(req.user._id, req.body);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleUpdateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const result = await userService.updateAddress(req.user._id, addressId, req.body);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleDeleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const result = await userService.deleteAddress(req.user._id, addressId);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

// ===== ADMIN: QUẢN LÝ TOÀN BỘ NGƯỜI DÙNG =====

const handleGetAllUsers = async (req, res) => {
    try {
        const { page, limit, phone } = req.query;
        const result = await userService.getAllUsers({ page, limit, phone });
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleAdminUpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.adminUpdateUser(id, req.body);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleCreateUser = async (req, res) => {
    try {
        const result = await userService.createUser(req.body);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const handleGetAddresses = async (req, res) => {
    try {
        const result = await userService.getAddresses(req.user._id);

        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log("GET ADDRESSES ERROR:", error);

        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};
export default {
    handleGetProfile,
    handleUpdateProfile,
    handleChangePassword,
    handleAddAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleGetAllUsers,
    handleAdminUpdateUser,
    handleDeleteUser,
    handleCreateUser,
    handleGetAddresses,
};