import Banner from '../models/banner.js';
import { HTTP_STATUS } from '../constants/errorCodes.js';

const getAllBanners = async ({ page = 1, limit = 10, name }) => {
    try {
        const query = {};
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const [banners, total] = await Promise.all([
            Banner.find(query)
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 }),
            Banner.countDocuments(query),
        ]);

        return {
            statusCode: HTTP_STATUS.OK,
            success: true,
            message: 'Lấy danh sách banner thành công',
            data: banners,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: HTTP_STATUS.INTERNAL_ERROR,
            success: false,
            message: 'Lỗi khi lấy danh sách banner',
        };
    }
};

const getBannerById = async (id) => {
    try {
        const banner = await Banner.findById(id);

        if (!banner) {
            return {
                statusCode: HTTP_STATUS.NOT_FOUND,
                success: false,
                message: 'Không tìm thấy banner',
            };
        }

        return {
            statusCode: HTTP_STATUS.OK,
            success: true,
            message: 'Lấy banner thành công',
            data: banner,
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: HTTP_STATUS.INTERNAL_ERROR,
            success: false,
            message: 'Lỗi khi lấy banner',
        };
    }
};

const createBanner = async ({ name, description, statusId, image }) => {
    try {
        if (!name) {
            return {
                statusCode: HTTP_STATUS.BAD_REQUEST,
                success: false,
                message: 'Tên banner là bắt buộc',
            };
        }

        const newBanner = await Banner.create({
            name,
            description,
            statusId: statusId || 'active',
            image,
        });

        return {
            statusCode: HTTP_STATUS.CREATED,
            success: true,
            message: 'Tạo banner thành công',
            data: newBanner,
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: HTTP_STATUS.INTERNAL_ERROR,
            success: false,
            message: 'Lỗi khi tạo banner',
        };
    }
};

const updateBanner = async (id, { name, description, statusId, image }) => {
    try {
        const banner = await Banner.findById(id);

        if (!banner) {
            return {
                statusCode: HTTP_STATUS.NOT_FOUND,
                success: false,
                message: 'Không tìm thấy banner',
            };
        }

        if (name !== undefined) banner.name = name;
        if (description !== undefined) banner.description = description;
        if (statusId !== undefined) banner.statusId = statusId;
        if (image !== undefined) banner.image = image;

        await banner.save();

        return {
            statusCode: HTTP_STATUS.OK,
            success: true,
            message: 'Cập nhật banner thành công',
            data: banner,
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: HTTP_STATUS.INTERNAL_ERROR,
            success: false,
            message: 'Lỗi khi cập nhật banner',
        };
    }
};

const deleteBanner = async (id) => {
    try {
        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            return {
                statusCode: HTTP_STATUS.NOT_FOUND,
                success: false,
                message: 'Không tìm thấy banner',
            };
        }

        return {
            statusCode: HTTP_STATUS.OK,
            success: true,
            message: 'Xoá banner thành công',
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: HTTP_STATUS.INTERNAL_ERROR,
            success: false,
            message: 'Lỗi khi xoá banner',
        };
    }
};

// Dùng cho trang chủ - không cần quyền admin
const getActiveBanners = async () => {
    try {
        const banners = await Banner.find({ statusId: 'active' }).sort({ createdAt: -1 });

        return {
            statusCode: HTTP_STATUS.OK,
            success: true,
            message: 'Lấy danh sách banner thành công',
            data: banners,
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: HTTP_STATUS.INTERNAL_ERROR,
            success: false,
            message: 'Lỗi khi lấy danh sách banner',
        };
    }
};

export default {
    getAllBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    getActiveBanners,
};