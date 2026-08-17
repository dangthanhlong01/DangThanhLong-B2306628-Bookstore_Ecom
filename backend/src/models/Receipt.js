// Receipt.js
import mongoose from "mongoose";

const receiptItemSchema = new mongoose.Schema(
    {
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        importPrice: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const receiptSchema = new mongoose.Schema(
    {
        publisherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Publisher",
            required: [true, "Nhà xuất bản là bắt buộc"],
        },
        code: {
            type: String,
            required: [true, "Mã phiếu nhập là bắt buộc"],
            unique: true,
        },
        items: [receiptItemSchema],
        totalAmount: { type: Number, required: true, min: 0 },
        note: { type: String, default: "" },
        status: {
            type: String,
            enum: ["draft", "confirmed", "cancelled"],
            default: "draft",
        },
    },
    { timestamps: true }
);

const Receipt = mongoose.model("Receipt", receiptSchema);

export default Receipt;