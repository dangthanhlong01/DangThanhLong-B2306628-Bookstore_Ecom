import Book from "../models/Book.js";

// Tạo slug từ title: "Đắc Nhân Tâm" -> "dac-nhan-tam"
// Loại bỏ dấu tiếng Việt + ký tự đặc biệt, nối bằng dấu gạch ngang
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

// Đảm bảo slug không trùng: nếu đã tồn tại thì nối thêm số phía sau (vd: dac-nhan-tam-2)
// excludeId: khi update, bỏ qua chính bản ghi đang sửa khi kiểm tra trùng
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
    let slug = baseSlug;
    let counter = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const query = { slug };
        if (excludeId) query._id = { $ne: excludeId };
        const existing = await Book.findOne(query);
        if (!existing) return slug;
        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
};

/**
 * Lấy danh sách sách có phân trang, tìm kiếm, lọc.
 * options: { page, limit, search, categoryId, publisherId, authorId, status, sort }
 */
const getBooks = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        search = "",
        categoryId,
        publisherId,
        authorId,
        status,
        sort = "-createdAt",
    } = options;

    const filter = {};

    if (search) {
        // Tìm theo tên sách hoặc ISBN, không phân biệt hoa thường
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { isbn: { $regex: search, $options: "i" } },
        ];
    }
    if (categoryId) filter.categoryIds = categoryId;
    if (publisherId) filter.publisherId = publisherId;
    if (authorId) filter.authorIds = authorId;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [books, total] = await Promise.all([
        Book.find(filter)
            .populate("authorIds", "name")
            .populate("publisherId", "name")
            .populate("categoryIds", "name")
            .sort(sort)
            .skip(skip)
            .limit(Number(limit)),
        Book.countDocuments(filter),
    ]);

    return {
        books,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(1, Math.ceil(total / Number(limit))),
    };
};

const getBookById = async (id) => {
    return Book.findById(id)
        .populate("authorIds", "name")
        .populate("publisherId", "name")
        .populate("categoryIds", "name");
};

const getBookBySlug = async (slug) => {
    return Book.findOne({ slug })
        .populate("authorIds", "name")
        .populate("publisherId", "name")
        .populate("categoryIds", "name");
};

const createBook = async (payload) => {
    const baseSlug = generateSlug(payload.title);
    const slug = await ensureUniqueSlug(baseSlug);

    const book = new Book({
        ...payload,
        slug,
    });
    return book.save();
};

const updateBook = async (id, payload) => {
    const existing = await Book.findById(id);
    if (!existing) return null;

    const updateData = { ...payload };

    // Nếu title đổi, tạo lại slug mới (unique, loại trừ chính nó)
    if (payload.title && payload.title !== existing.title) {
        const baseSlug = generateSlug(payload.title);
        updateData.slug = await ensureUniqueSlug(baseSlug, id);
    }

    return Book.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    })
        .populate("authorIds", "name")
        .populate("publisherId", "name")
        .populate("categoryIds", "name");
};

const deleteBook = async (id) => {
    return Book.findByIdAndDelete(id);
};

export default {
    getBooks,
    getBookById,
    getBookBySlug,
    createBook,
    updateBook,
    deleteBook,
};