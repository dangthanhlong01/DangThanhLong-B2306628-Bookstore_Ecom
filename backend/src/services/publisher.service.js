import Publisher from "../models/Publisher.js";

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

        const existing = await Publisher.findOne(query);

        if (!existing) {
            return slug;
        }

        counter++;
        slug = `${baseSlug}-${counter}`;
    }
};

const getPublishers = async (options = {}) => {
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

    const [publishers, total] = await Promise.all([
        Publisher.find(filter)
            .sort("-createdAt")
            .skip(skip)
            .limit(Number(limit)),

        Publisher.countDocuments(filter),
    ]);

    return {
        publishers,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(
            1,
            Math.ceil(total / Number(limit))
        ),
    };
};

const getPublisherById = async (id) => {
    return Publisher.findById(id);
};

const getPublisherBySlug = async (slug) => {
    return Publisher.findOne({ slug });
};

const createPublisher = async (payload) => {
    const baseSlug = generateSlug(payload.name);
    const slug = await ensureUniqueSlug(baseSlug);

    const publisher = new Publisher({
        ...payload,
        slug,
    });

    return publisher.save();
};

const updatePublisher = async (id, payload) => {
    const existing = await Publisher.findById(id);

    if (!existing) {
        return null;
    }

    const updateData = {
        ...payload,
    };

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

    return Publisher.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
};

const deletePublisher = async (id) => {
    return Publisher.findByIdAndUpdate(
        id,
        { status: "inactive" },
        {
            new: true,
            runValidators: true,
        }
    );
};

export default {
    getPublishers,
    getPublisherById,
    getPublisherBySlug,
    createPublisher,
    updatePublisher,
    deletePublisher,
};