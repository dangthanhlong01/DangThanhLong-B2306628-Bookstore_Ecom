// Book.js
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Tên sách là bắt buộc"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        isbn: { type: String, default: "" },
        description: { type: String, default: "" },

        // Quan hệ: 1 sách có thể có nhiều tác giả, nhiều danh mục, nhưng chỉ 1 NXB
        authorIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Author",
            },
        ],
        publisherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Publisher",
        },
        categoryIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],

        images: [{ type: String }],

        price: {
            type: Number,
            required: [true, "Giá sách là bắt buộc"],
            min: 0,
        },
        discountPrice: {
            type: Number,
            default: 0,
            min: 0,
        },

        stock: { type: Number, default: 0, min: 0 },
        sold: { type: Number, default: 0, min: 0 },

        pageCount: { type: Number, default: 0 },
        publishYear: { type: Number },
        language: { type: String, default: "Tiếng Việt" },
        format: {
            type: String,
            enum: ["bìa mềm", "bìa cứng"],
            default: "bìa mềm",
        },
        weight: { type: Number, default: 0 }, // gram, phục vụ tính phí ship

        ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
        ratingCount: { type: Number, default: 0, min: 0 },

        // Đánh dấu để phục vụ query trang Home (sản phẩm đặc trưng / sản phẩm mới)
        isFeatured: { type: Boolean, default: false },

        status: {
            type: String,
            enum: ["active", "inactive", "out_of_stock"],
            default: "active",
        },
    },
    { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;