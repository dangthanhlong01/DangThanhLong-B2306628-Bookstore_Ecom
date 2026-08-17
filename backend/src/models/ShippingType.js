import mongoose from "mongoose";

const shippingTypeSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: null,
            trim: true,
        },

        price: {
            type: Number,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const ShippingType = mongoose.model("ShippingType", shippingTypeSchema);
export default ShippingType;