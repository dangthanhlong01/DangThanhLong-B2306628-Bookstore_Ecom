import authorService from "../services/author.service.js";

const getAuthors = async (req, res) => {
    try {
        const result = await authorService.getAuthors(
            req.query
        );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách tác giả:", error);

        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách tác giả",
        });
    }
};

const getAuthorById = async (req, res) => {
    try {
        const author =
            await authorService.getAuthorById(
                req.params.id
            );

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tác giả",
            });
        }

        return res.status(200).json({
            success: true,
            data: author,
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết tác giả:", error);

        return res.status(500).json({
            success: false,
            message: "Không thể lấy chi tiết tác giả",
        });
    }
};

const getAuthorBySlug = async (req, res) => {
    try {
        const author =
            await authorService.getAuthorBySlug(
                req.params.slug
            );

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tác giả",
            });
        }

        return res.status(200).json({
            success: true,
            data: author,
        });
    } catch (error) {
        console.error("Lỗi lấy tác giả theo slug:", error);

        return res.status(500).json({
            success: false,
            message: "Không thể lấy tác giả",
        });
    }
};

const createAuthor = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tên tác giả là bắt buộc",
            });
        }

        const author =
            await authorService.createAuthor(
                req.body
            );

        return res.status(201).json({
            success: true,
            data: author,
        });
    } catch (error) {
        console.error("Lỗi tạo tác giả:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Slug tác giả đã tồn tại",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể tạo tác giả",
        });
    }
};

const updateAuthor = async (req, res) => {
    try {
        const author =
            await authorService.updateAuthor(
                req.params.id,
                req.body
            );

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tác giả",
            });
        }

        return res.status(200).json({
            success: true,
            data: author,
        });
    } catch (error) {
        console.error("Lỗi cập nhật tác giả:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Slug tác giả đã tồn tại",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể cập nhật tác giả",
        });
    }
};

const deleteAuthor = async (req, res) => {
    try {
        const author =
            await authorService.deleteAuthor(
                req.params.id
            );

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tác giả",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ẩn tác giả thành công",
            data: author,
        });
    } catch (error) {
        console.error("Lỗi ẩn tác giả:", error);

        return res.status(500).json({
            success: false,
            message: "Không thể ẩn tác giả",
        });
    }
};

export default {
    getAuthors,
    getAuthorById,
    getAuthorBySlug,
    createAuthor,
    updateAuthor,
    deleteAuthor,
};