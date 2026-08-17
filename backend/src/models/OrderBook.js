import mongoose from "mongoose";

const orderBookSchema = new mongoose.Schema(
    {
        // User tạo đơn
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Mã địa chỉ giao hàng
        addressUserId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        // Trạng thái đơn hàng
        statusId: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipping",
                "completed",
                "cancelled",
            ],
            default: "pending",
        },

        // Mã loại vận chuyển
        typeShipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShippingType",
            default: null,
        },

        // Mã voucher
        voucherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voucher",
            default: null,
        },

        // Ghi chú
        note: {
            type: String,
            default: null,
            trim: true,
        },

        // Thanh toán online
        isPaymentOnline: {
            type: Boolean,
            default: false,
        },

        // Mã shipper
        shipperId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        // Hình ảnh
        image: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const OrderBook = mongoose.model("OrderBook", orderBookSchema);

export default OrderBook;