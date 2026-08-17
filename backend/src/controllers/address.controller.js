import addressService from "../services/address.service.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";

const getAddresses = async (req, res) => {
    try {
        const result = await addressService.getAddresses(req.user._id);

        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error("GET ADDRESSES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi từ phía máy chủ",
        });
    }
};

const addAddress = async (req, res) => {
    try {
        const result = await addressService.addAddress(
            req.user._id,
            req.body
        );

        return res
            .status(result.statusCode)
            .json(result);
    } catch (error) {
        console.error("ADD ADDRESS ERROR:", error);

        return res
            .status(HTTP_STATUS.INTERNAL_ERROR)
            .json({
                success: false,
                message: "Lỗi từ phía máy chủ",
            });
    }
};

const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const result = await addressService.updateAddress(
            req.user._id,
            addressId,
            req.body
        );

        return res
            .status(result.statusCode)
            .json(result);
    } catch (error) {
        console.error("UPDATE ADDRESS ERROR:", error);

        return res
            .status(HTTP_STATUS.INTERNAL_ERROR)
            .json({
                success: false,
                message: "Lỗi từ phía máy chủ",
            });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const result = await addressService.deleteAddress(
            req.user._id,
            addressId
        );

        return res
            .status(result.statusCode)
            .json(result);
    } catch (error) {
        console.error("DELETE ADDRESS ERROR:", error);

        return res
            .status(HTTP_STATUS.INTERNAL_ERROR)
            .json({
                success: false,
                message: "Lỗi từ phía máy chủ",
            });
    }
};

export default {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
};