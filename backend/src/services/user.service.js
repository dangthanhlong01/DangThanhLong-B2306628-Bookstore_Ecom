// user.service.js - Chứa logic nghiệp vụ liên quan tới thông tin tài khoản người dùng
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";

// Lấy thông tin profile hiện tại của user đang đăng nhập
const getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password -tokenUser");
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
        message: "Lấy thông tin thành công",
        data: { user },
    };
};

// Cập nhật thông tin cá nhân (không bao gồm email, password)
const updateProfile = async (
    userId,
    { fullName, phone, avatar, dob, address, gender }
) => {
    const user = await User.findById(userId).select("+password");

    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    // Chỉ cập nhật những field được gửi lên
    if (fullName !== undefined) {
        user.fullName = fullName;
    }

    if (phone !== undefined) {
        user.phone = phone;
    }

    if (avatar !== undefined) {
        user.avatar = avatar;
    }

    if (dob !== undefined) {
        user.dob = dob;
    }

    if (address !== undefined) {
        user.address = address;
    }

    if (gender !== undefined) {
        user.gender = gender;
    }
    console.log("USER ID:", userId);
    console.log("USER:", user);
    console.log("PASSWORD:", user?.password);
    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Cập nhật thông tin thành công",
        data: {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                dob: user.dob,
                address: user.address,
                gender: user.gender,
                role: user.role,
            },
        },
    };
};

// Đổi mật khẩu - cần nhập đúng mật khẩu cũ mới cho đổi
const changePassword = async (userId, { oldPassword, newPassword }) => {
    if (!oldPassword || !newPassword) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới",
        };
    }

    if (newPassword.length < 6) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        };
    }

    const user = await User.findById(userId);
    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return {
            success: false,
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: "Mật khẩu cũ không đúng",
        };
    }

    // Không cho đổi mật khẩu mới trùng mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Mật khẩu mới không được trùng với mật khẩu cũ",
        };
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Đổi mật khẩu xong thì huỷ luôn phiên đăng nhập hiện tại (bắt đăng nhập lại)
    // để đảm bảo nếu tài khoản bị người khác chiếm, đổi mật khẩu sẽ đá họ ra ngay
    user.tokenUser = null;
    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Đổi mật khẩu thành công, vui lòng đăng nhập lại",
    };
};

// Thêm địa chỉ mới vào danh sách addresses
const addAddress = async (userId, addressData) => {
    const user = await User.findById(userId);
    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    // Nếu địa chỉ mới được đặt làm mặc định, bỏ mặc định ở các địa chỉ cũ
    if (addressData.isDefault) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push(addressData);
    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.CREATED,
        message: "Thêm địa chỉ thành công",
        data: { addresses: user.addresses },
    };
};

// Cập nhật 1 địa chỉ theo addressId (subdocument _id)
const updateAddress = async (userId, addressId, addressData) => {
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
        user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, addressData);
    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Cập nhật địa chỉ thành công",
        data: { addresses: user.addresses },
    };
};

// Xoá 1 địa chỉ theo addressId
const deleteAddress = async (userId, addressId) => {
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

    address.deleteOne(); // xoá subdocument khỏi mảng
    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Xoá địa chỉ thành công",
        data: { addresses: user.addresses },
    };
};

// ===== ADMIN: QUẢN LÝ TOÀN BỘ NGƯỜI DÙNG =====

// Lấy danh sách người dùng có phân trang + tìm theo số điện thoại (dành cho admin)
const getAllUsers = async ({ page = 1, limit = 6, phone }) => {
    const filter = {};
    if (phone) {
        filter.phone = { $regex: phone, $options: "i" };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 6;

    const totalItems = await User.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

    const users = await User.find(filter)
        .select("-password -tokenUser")
        .sort({ createdAt: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Lấy danh sách người dùng thành công",
        data: { users, totalItems, totalPages, page: pageNum, limit: limitNum },
    };
};

// Admin cập nhật thông tin của 1 người dùng bất kỳ (khác với updateProfile - tự sửa chính mình)
const adminUpdateUser = async (userId, { fullName, phone, dob, role, status }) => {
    const user = await User.findById(userId);
    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Cập nhật người dùng thành công",
        data: {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                dob: user.dob,
                role: user.role,
                status: user.status,
            },
        },
    };
};

// Admin xoá 1 người dùng
const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
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
        message: "Xoá người dùng thành công",
    };
};

// Admin tạo mới 1 người dùng
const createUser = async ({ fullName, email, password, phone, dob, role, status }) => {
    if (!fullName || !email || !password) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu",
        };
    }

    if (password.length < 6) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Mật khẩu phải có ít nhất 6 ký tự",
        };
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
        return {
            success: false,
            statusCode: HTTP_STATUS.CONFLICT,
            message: "Email đã được sử dụng",
        };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        authProvider: "local",
        phone: phone || "",
        dob: dob || undefined,
        role: role || "customer",
        status: status || "active",
        isactiveEmail: true,
    });

    return {
        success: true,
        statusCode: HTTP_STATUS.CREATED,
        message: "Tạo người dùng thành công",
        data: {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                dob: user.dob,
                role: user.role,
                status: user.status,
            },
        },
    };
};

// Lấy danh sách địa chỉ giao hàng của user đang đăng nhập
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

export default {
    getProfile,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    getAllUsers,
    adminUpdateUser,
    deleteUser,
    createUser,
    getAddresses,
};