import bannerService from '../services/banner.service.js';
import { HTTP_STATUS } from '../constants/errorCodes.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

const handleGetAllBanners = async (req, res) => {
    try {
        const { page, limit, name } = req.query;
        const result = await bannerService.getAllBanners({ page, limit, name });
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: 'Lỗi từ phía máy chủ',
        });
    }
};

const handleGetBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await bannerService.getBannerById(id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: 'Lỗi từ phía máy chủ',
        });
    }
};

const handleCreateBanner = async (req, res) => {
    try {
        const { name, description, statusId } = req.body;

        let image = null;
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'banners');
            image = uploadResult.secure_url;
        }

        const result = await bannerService.createBanner({ name, description, statusId, image });
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: 'Lỗi từ phía máy chủ',
        });
    }
};

const handleUpdateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, statusId } = req.body;

        let image = undefined;
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'banners');
            image = uploadResult.secure_url;
        }

        const result = await bannerService.updateBanner(id, { name, description, statusId, image });
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: 'Lỗi từ phía máy chủ',
        });
    }
};

const handleDeleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await bannerService.deleteBanner(id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: 'Lỗi từ phía máy chủ',
        });
    }
};

const handleGetActiveBanners = async (req, res) => {
    try {
        const result = await bannerService.getActiveBanners();
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
            success: false,
            message: 'Lỗi từ phía máy chủ',
        });
    }
};

export default {
    handleGetAllBanners,
    handleGetBannerById,
    handleCreateBanner,
    handleUpdateBanner,
    handleDeleteBanner,
    handleGetActiveBanners,
};