// Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: [true, "Sách là bắt buộc"],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Người dùng là bắt buộc"],
        },
        rating: {
            type: Number,
            required: [true, "Số sao đánh giá là bắt buộc"],
            min: 1,
            max: 5,
        },
        comment: { type: String, default: "", trim: true },
        images: [{ type: String }],
        status: {
            type: String,
            enum: ["pending", "approved", "hidden"],
            default: "approved",
        },
    },
    { timestamps: true }
);

// Mỗi user chỉ review 1 lần cho 1 cuốn sách
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;