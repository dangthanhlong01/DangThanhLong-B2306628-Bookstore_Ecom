// Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Tiêu đề là bắt buộc"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        thumbnail: { type: String, default: "" },
        content: {
            type: String,
            required: [true, "Nội dung là bắt buộc"],
        },
        description: { type: String, default: "" }, // Mô tả ngắn hiển thị ở HomeBlog

        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Người viết là bắt buộc"],
        },

        // Liên kết tới các sách liên quan trong bài viết
        relatedBookIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Book",
            },
        ],

        viewCount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["draft", "published", "hidden"],
            default: "published",
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;