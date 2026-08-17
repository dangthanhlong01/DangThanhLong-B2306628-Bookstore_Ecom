import bookService from "../services/book.service.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
// GET /api/books?page=1&limit=10&search=&categoryId=&publisherId=&authorId=&status=
const getBooks = async (req, res) => {
    try {
        const result = await bookService.getBooks(req.query);
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách sách:", error);
        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sách",
        });
    }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
    try {
        const book = await bookService.getBookById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
        }
        return res.status(200).json({ success: true, data: book });
    } catch (error) {
        console.error("Lỗi lấy chi tiết sách:", error);
        return res.status(500).json({ success: false, message: "Không thể lấy chi tiết sách" });
    }
};

// GET /api/books/slug/:slug  (dùng cho trang chi tiết sản phẩm ngoài client)
const getBookBySlug = async (req, res) => {
    try {
        const book = await bookService.getBookBySlug(req.params.slug);
        if (!book) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
        }
        return res.status(200).json({ success: true, data: book });
    } catch (error) {
        console.error("Lỗi lấy sách theo slug:", error);
        return res.status(500).json({ success: false, message: "Không thể lấy sách" });
    }
};

// POST /api/books  (admin)
const createBook = async (req, res) => {
    try {
        const { title, price } = req.body;

        // Kiểm tra tên sách
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tên sách là bắt buộc"
            });
        }

        // Kiểm tra giá
        if (
            price === undefined ||
            price === null ||
            Number(price) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Giá sách là bắt buộc và không âm"
            });
        }

        // =========================
        // UPLOAD ẢNH LÊN CLOUDINARY
        // =========================

        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            imageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadToCloudinary(
                        file.buffer,
                        "books"
                    );

                    return result.secure_url;
                })
            );
        }

        // =========================
        // TẠO DỮ LIỆU SÁCH
        // =========================

        const bookData = {
            ...req.body,
            images: imageUrls,
        };

        const book =
            await bookService.createBook(bookData);

        return res.status(201).json({
            success: true,
            data: book
        });

    } catch (error) {
        console.error("Lỗi tạo sách:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể tạo sách"
        });
    }
};

// PUT /api/books/:id  (admin)
const updateBook = async (req, res) => {
    try {
        // Lấy danh sách ảnh cũ mà user vẫn giữ lại
        let existingImages = [];

        if (req.body.existingImages) {
            try {
                existingImages = JSON.parse(req.body.existingImages);
            } catch (error) {
                existingImages = [];
            }
        }

        // Upload ảnh mới lên Cloudinary
        let newImageUrls = [];

        if (req.files && req.files.length > 0) {
            newImageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadToCloudinary(
                        file.buffer,
                        "books"
                    );

                    return result.secure_url;
                })
            );
        }

        // Gộp ảnh cũ còn giữ + ảnh mới
        const images = [
            ...existingImages,
            ...newImageUrls,
        ];

        // Dữ liệu cập nhật
        const updateData = {
            ...req.body,
            images,
        };

        // Không lưu field này vào Book
        delete updateData.existingImages;

        const book = await bookService.updateBook(
            req.params.id,
            updateData
        );

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sách",
            });
        }

        return res.status(200).json({
            success: true,
            data: book,
        });

    } catch (error) {
        console.error("Lỗi cập nhật sách:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể cập nhật sách",
        });
    }
};

// DELETE /api/books/:id  (admin)
const deleteBook = async (req, res) => {
    try {
        const book = await bookService.deleteBook(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
        }
        return res.status(200).json({ success: true, message: "Xoá sách thành công" });
    } catch (error) {
        console.error("Lỗi xoá sách:", error);
        return res.status(500).json({ success: false, message: "Không thể xoá sách" });
    }
};

export default {
    getBooks,
    getBookById,
    getBookBySlug,
    createBook,
    updateBook,
    deleteBook,
};