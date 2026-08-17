// Voucher.js
import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Mã voucher là bắt buộc"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: { type: String, default: "" },
        type: {
            type: String,
            enum: ["percent", "fixed"],
            required: [true, "Loại giảm giá là bắt buộc"],
        },
        value: {
            type: Number,
            required: [true, "Giá trị giảm là bắt buộc"],
            min: 0,
        },
        // Chỉ áp dụng khi type = percent, giới hạn số tiền giảm tối đa
        maxDiscount: { type: Number, default: null },
        minOrderValue: { type: Number, default: 0 },

        quantity: { type: Number, required: true, min: 0 },
        usedCount: { type: Number, default: 0, min: 0 },

        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },

        status: {
            type: String,
            enum: ["active", "inactive", "expired"],
            default: "active",
        },
    },
    { timestamps: true }
);

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;