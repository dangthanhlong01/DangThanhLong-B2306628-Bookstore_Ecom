// Publisher.js
import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tên nhà xuất bản là bắt buộc"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        logo: { type: String, default: "" },
        address: { type: String, default: "" },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        description: { type: String, default: "" },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
);

const Publisher = mongoose.model("Publisher", publisherSchema);

export default Publisher;