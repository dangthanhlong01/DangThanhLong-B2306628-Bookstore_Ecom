import mongoose from "mongoose";

const orderDetailSchema = new mongoose.Schema(
    {
        // Mã đơn hàng
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderBook",
            required: true,
        },

        // Mã sách
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },

        // Số lượng sách
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        // Giá thực tế của sách tại thời điểm mua
        realPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);

export default OrderDetail;