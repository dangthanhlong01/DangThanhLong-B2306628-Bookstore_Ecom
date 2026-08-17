import Category from "../models/Category.js";

// Tạo slug từ tên danh mục
// Ví dụ: "Văn học Việt Nam" -> "van-hoc-viet-nam"
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "") // Bỏ ký tự đặc biệt
        .trim()
        .replace(/\s+/g, "-") // Khoảng trắng -> dấu -
        .replace(/-+/g, "-"); // Nhiều dấu - liên tiếp -> 1 dấu -
};

// Đảm bảo slug không bị trùng
// Nếu slug đã tồn tại thì thêm -2, -3,...
// excludeId dùng khi update để bỏ qua chính category đang sửa
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await Category.findOne(query);

        if (!existing) {
            return slug;
        }

        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
};

/**
 * Lấy danh sách danh mục
 *
 * options:
 * {
 *   page,
 *   limit,
 *   search,
 *   parentId,
 *   status,
 *   sort
 * }
 */
const getCategories = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        search = "",
        parentId,
        status,
        sort = "-createdAt",
    } = options;

    const filter = {};

    // Tìm kiếm theo tên danh mục
    if (search) {
        filter.name = {
            $regex: search,
            $options: "i",
        };
    }

    // Lọc theo danh mục cha
    if (parentId) {
        filter.parentId = parentId;
    }

    // Lọc theo trạng thái active / inactive
    if (status) {
        filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [categories, total] = await Promise.all([
        Category.find(filter)
            .populate("parentId", "name slug")
            .sort(sort)
            .skip(skip)
            .limit(Number(limit)),

        Category.countDocuments(filter),
    ]);

    return {
        categories,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(
            1,
            Math.ceil(total / Number(limit))
        ),
    };
};

// Lấy một category theo ID
const getCategoryById = async (id) => {
    return Category.findById(id)
        .populate("parentId", "name slug");
};

// Lấy category theo slug
const getCategoryBySlug = async (slug) => {
    return Category.findOne({ slug })
        .populate("parentId", "name slug");
};

// Tạo category
const createCategory = async (payload) => {
    const baseSlug = generateSlug(payload.name);

    // Đảm bảo slug không trùng
    const slug = await ensureUniqueSlug(baseSlug);

    const category = new Category({
        ...payload,
        slug,
    });

    return category.save();
};

// Cập nhật category
const updateCategory = async (id, payload) => {
    const existing = await Category.findById(id);

    if (!existing) {
        return null;
    }

    const updateData = {
        ...payload,
    };

    // Nếu tên category thay đổi
    // thì tạo lại slug mới
    if (
        payload.name &&
        payload.name !== existing.name
    ) {
        const baseSlug = generateSlug(payload.name);

        updateData.slug = await ensureUniqueSlug(
            baseSlug,
            id
        );
    }

    return Category.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    ).populate("parentId", "name slug");
};

// Ẩn category thay vì xóa khỏi database
const deleteCategory = async (id) => {
    return Category.findByIdAndUpdate(
        id,
        {
            status: "inactive",
        },
        {
            new: true,
            runValidators: true,
        }
    );
};

export default {
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
};