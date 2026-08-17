// Author.js
import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tên tác giả là bắt buộc"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        avatar: { type: String, default: "" },
        bio: { type: String, default: "" },
        nationality: { type: String, default: "" },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
);

const Author = mongoose.model("Author", authorSchema);

export default Author;