import categoryService from "../services/category.service.js";

// GET /api/categories?page=1&limit=10&search=&parentId=&status=
const getCategories = async (req, res) => {
    try {
        const result = await categoryService.getCategories(
            req.query
        );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách danh mục:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách danh mục",
        });
    }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
    try {
        const category =
            await categoryService.getCategoryById(
                req.params.id
            );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết danh mục:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Không thể lấy chi tiết danh mục",
        });
    }
};

// GET /api/categories/slug/:slug
const getCategoryBySlug = async (req, res) => {
    try {
        const category =
            await categoryService.getCategoryBySlug(
                req.params.slug
            );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh mục theo slug:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh mục",
        });
    }
};

// POST /api/categories
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Kiểm tra tên danh mục
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tên danh mục là bắt buộc",
            });
        }

        const category =
            await categoryService.createCategory(
                req.body
            );

        return res.status(201).json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error(
            "Lỗi tạo danh mục:",
            error
        );

        // Lỗi validate của Mongoose
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        // Lỗi duplicate slug
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Slug danh mục đã tồn tại",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể tạo danh mục",
        });
    }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
    try {
        const category =
            await categoryService.updateCategory(
                req.params.id,
                req.body
            );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error(
            "Lỗi cập nhật danh mục:",
            error
        );

        // Lỗi validate của Mongoose
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        // Lỗi duplicate slug
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Slug danh mục đã tồn tại",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể cập nhật danh mục",
        });
    }
};

// DELETE /api/categories/:id
// Thực tế là chuyển status -> inactive
const deleteCategory = async (req, res) => {
    try {
        const category =
            await categoryService.deleteCategory(
                req.params.id
            );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ẩn danh mục thành công",
            data: category,
        });
    } catch (error) {
        console.error(
            "Lỗi ẩn danh mục:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Không thể ẩn danh mục",
        });
    }
};

export default {
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
};