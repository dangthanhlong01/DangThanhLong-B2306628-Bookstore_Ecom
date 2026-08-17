import mongoose from "mongoose";

const shopCartSchema = new mongoose.Schema(
    {
        // Người sở hữu giỏ hàng
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Sách được thêm vào giỏ hàng
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

        // active = đang nằm trong giỏ
        statusId: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

const ShopCart = mongoose.model("ShopCart", shopCartSchema);

export default ShopCart;