import publisherService from "../services/publisher.service.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
const getPublishers = async (req, res) => {
    try {
        const result =
            await publisherService.getPublishers(
                req.query
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách nhà xuất bản:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy danh sách nhà xuất bản",
        });
    }
};

const getPublisherById = async (req, res) => {
    try {
        const publisher =
            await publisherService.getPublisherById(
                req.params.id
            );

        if (!publisher) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy nhà xuất bản",
            });
        }

        return res.status(200).json({
            success: true,
            data: publisher,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết nhà xuất bản:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy chi tiết nhà xuất bản",
        });
    }
};

const getPublisherBySlug = async (req, res) => {
    try {
        const publisher =
            await publisherService.getPublisherBySlug(
                req.params.slug
            );

        if (!publisher) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy nhà xuất bản",
            });
        }

        return res.status(200).json({
            success: true,
            data: publisher,
        });
    } catch (error) {
        console.error(
            "Lỗi lấy nhà xuất bản theo slug:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể lấy nhà xuất bản",
        });
    }
};

const createPublisher = async (req, res) => {
    try {
        console.log("REQ.FILE:", req.file);
        console.log("REQ.BODY:", req.body);
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tên nhà xuất bản là bắt buộc",
            });
        }

        let logo = "";

        // Nếu frontend có gửi ảnh logo
        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer,
                "publishers"
            );

            logo = result.secure_url;
        }

        const publisher = await publisherService.createPublisher({
            ...req.body,
            logo,
        });

        return res.status(201).json({
            success: true,
            data: publisher,
        });

    } catch (error) {
        console.error("Lỗi tạo nhà xuất bản:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Slug nhà xuất bản đã tồn tại",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể tạo nhà xuất bản",
        });
    }
};

const updatePublisher = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
        };

        // Nếu có ảnh logo mới thì upload lên Cloudinary
        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer,
                "publishers"
            );

            updateData.logo = result.secure_url;
        }
        // Không có ảnh mới + người dùng bấm xóa -> xóa logo trong MongoDB
        if (req.body.removeLogo === "true" && !req.file) {
            updateData.logo = "";
        }

        const publisher = await publisherService.updatePublisher(
            req.params.id,
            updateData
        );

        if (!publisher) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nhà xuất bản",
            });
        }

        return res.status(200).json({
            success: true,
            data: publisher,
        });

    } catch (error) {
        console.error("Lỗi cập nhật nhà xuất bản:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Slug nhà xuất bản đã tồn tại",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Không thể cập nhật nhà xuất bản",
        });
    }
};

const deletePublisher = async (req, res) => {
    try {
        const publisher =
            await publisherService.deletePublisher(
                req.params.id
            );

        if (!publisher) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy nhà xuất bản",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Ẩn nhà xuất bản thành công",
            data: publisher,
        });
    } catch (error) {
        console.error(
            "Lỗi ẩn nhà xuất bản:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Không thể ẩn nhà xuất bản",
        });
    }
};

export default {
    getPublishers,
    getPublisherById,
    getPublisherBySlug,
    createPublisher,
    updatePublisher,
    deletePublisher,
};