import User from "../models/User.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";

const getAddresses = async (userId) => {
    const user = await User.findById(userId).select("addresses");

    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Lấy danh sách địa chỉ thành công",
        data: {
            addresses: user.addresses,
        },
    };
};

const addAddress = async (userId, addressData) => {
    const user = await User.findById(userId);

    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    const {
        receiverName,
        phone,
        province,
        district,
        detail,
        isDefault,
    } = addressData;

    if (!receiverName?.trim()) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập tên người nhận",
        };
    }

    if (!phone?.trim()) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập số điện thoại",
        };
    }

    if (!detail?.trim()) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập địa chỉ chi tiết",
        };
    }

    // Nếu địa chỉ mới là mặc định
    if (isDefault) {
        user.addresses.forEach((address) => {
            address.isDefault = false;
        });
    }

    // Nếu đây là địa chỉ đầu tiên
    const shouldBeDefault =
        user.addresses.length === 0 ? true : !!isDefault;

    user.addresses.push({
        receiverName: receiverName.trim(),
        phone: phone.trim(),
        province: province || "",
        district: district || "",
        detail: detail.trim(),
        isDefault: shouldBeDefault,
    });

    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.CREATED,
        message: "Thêm địa chỉ thành công",
        data: {
            addresses: user.addresses,
        },
    };
};

const updateAddress = async (
    userId,
    addressId,
    addressData
) => {
    const user = await User.findById(userId);

    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    const address = user.addresses.id(addressId);

    if (!address) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Không tìm thấy địa chỉ",
        };
    }

    if (addressData.isDefault) {
        user.addresses.forEach((item) => {
            item.isDefault = false;
        });
    }

    if (addressData.receiverName !== undefined) {
        address.receiverName =
            addressData.receiverName;
    }

    if (addressData.phone !== undefined) {
        address.phone = addressData.phone;
    }

    if (addressData.province !== undefined) {
        address.province = addressData.province;
    }

    if (addressData.district !== undefined) {
        address.district = addressData.district;
    }

    if (addressData.detail !== undefined) {
        address.detail = addressData.detail;
    }

    if (addressData.isDefault !== undefined) {
        address.isDefault = addressData.isDefault;
    }

    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Cập nhật địa chỉ thành công",
        data: {
            addresses: user.addresses,
        },
    };
};

const deleteAddress = async (
    userId,
    addressId
) => {
    const user = await User.findById(userId);

    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    const address = user.addresses.id(addressId);

    if (!address) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Không tìm thấy địa chỉ",
        };
    }

    const wasDefault = address.isDefault;

    address.deleteOne();

    // Nếu xóa địa chỉ mặc định thì chọn địa chỉ đầu tiên
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Xóa địa chỉ thành công",
        data: {
            addresses: user.addresses,
        },
    };
};

export default {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
};