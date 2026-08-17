import Author from "../models/Author.js";

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await Author.findOne(query);

        if (!existing) {
            return slug;
        }

        counter++;
        slug = `${baseSlug}-${counter}`;
    }
};

const getAuthors = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        search = "",
        status,
    } = options;

    const filter = {};

    if (search) {
        filter.name = {
            $regex: search,
            $options: "i",
        };
    }

    if (status) {
        filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [authors, total] = await Promise.all([
        Author.find(filter)
            .sort("-createdAt")
            .skip(skip)
            .limit(Number(limit)),

        Author.countDocuments(filter),
    ]);

    return {
        authors,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(
            1,
            Math.ceil(total / Number(limit))
        ),
    };
};

const getAuthorById = async (id) => {
    return Author.findById(id);
};

const getAuthorBySlug = async (slug) => {
    return Author.findOne({ slug });
};

const createAuthor = async (payload) => {
    const baseSlug = generateSlug(payload.name);
    const slug = await ensureUniqueSlug(baseSlug);

    const author = new Author({
        ...payload,
        slug,
    });

    return author.save();
};

const updateAuthor = async (id, payload) => {
    const existing = await Author.findById(id);

    if (!existing) {
        return null;
    }

    const updateData = { ...payload };

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

    return Author.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
};

const deleteAuthor = async (id) => {
    return Author.findByIdAndUpdate(
        id,
        { status: "inactive" },
        { new: true }
    );
};

export default {
    getAuthors,
    getAuthorById,
    getAuthorBySlug,
    createAuthor,
    updateAuthor,
    deleteAuthor,
};