// User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Họ tên là bắt buộc"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[\w.-]+@[\w.-]+\.\w+$/, "Email không đúng định dạng"],
        },

        // Mật khẩu không bắt buộc vì user có thể đăng nhập bằng Google
        password: {
            type: String,
            required: false,
            minlength: 6,
            select: false,
        },

        phone: {
            type: String,
            default: "",
        },

        // Địa chỉ cá nhân trong thông tin profile
        address: {
            type: String,
            default: "",
            trim: true,
        },

        // Giới tính
        gender: {
            type: String,
            enum: ["male", "female", "other", ""],
            default: "",
        },

        avatar: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },

        dob: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        isactiveEmail: {
            type: Boolean,
            default: true,
        },

        // Lưu token hiện tại của user, dùng để kiểm soát phiên đăng nhập
        // - Khi login → sinh token mới, ghi đè vào đây
        // - Khi logout → set về null
        // - Middleware xác thực sẽ so khớp token trong header với token lưu ở đây
        tokenUser: {
            type: String,
            default: null,
        },

        // Danh sách địa chỉ giao hàng
        addresses: [
            {
                receiverName: {
                    type: String,
                },

                phone: {
                    type: String,
                },

                province: {
                    type: String,
                },

                district: {
                    type: String,
                },

                detail: {
                    type: String,
                },

                isDefault: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;