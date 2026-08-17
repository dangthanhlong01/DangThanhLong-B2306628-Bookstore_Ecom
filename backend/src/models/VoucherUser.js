import mongoose from "mongoose";

const voucherUserSchema = new mongoose.Schema(
    {
        voucherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voucher",
            required: [true, "Mã voucher là bắt buộc"],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Mã người dùng là bắt buộc"],
        },
        // 0: đã lưu, chưa dùng | 1: đã sử dụng | 2: hết hạn khi đang giữ
        status: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true } // tự sinh createdAt, updatedAt giống bảng bạn mô tả
);

// Chặn user lưu trùng 1 voucher nhiều lần (tương đương ràng buộc unique(voucherId, userId) bên SQL)
voucherUserSchema.index({ voucherId: 1, userId: 1 }, { unique: true });

const VoucherUser = mongoose.model("VoucherUser", voucherUserSchema);

export default VoucherUser;