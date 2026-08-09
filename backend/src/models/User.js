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
        password: {
            type: String,
            required: [true, "Mật khẩu là bắt buộc"],
            minlength: 6,
        },
        phone: { type: String, default: "" },
        avatar: { type: String, default: "" },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        dob: { type: Date },
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
        // - Middleware xác thực sẽ so khớp token trong header với token lưu ở đây,
        //   nếu không khớp thì coi như token đã bị vô hiệu hoá (VD: đã đăng nhập ở thiết bị khác)
        tokenUser: {
            type: String,
            default: null,
        },
        addresses: [
            {
                receiverName: String,
                phone: String,
                province: String,
                district: String,
                detail: String,
                isDefault: { type: Boolean, default: false },
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;