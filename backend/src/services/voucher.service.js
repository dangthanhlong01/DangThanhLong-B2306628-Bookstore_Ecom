import Voucher from "../models/Voucher.js";
import VoucherUser from "../models/VoucherUser.js";
// Tự tạo lỗi có statusCode để controller trả đúng mã HTTP, không cần try/catch rườm rà ở service
class ServiceError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Voucher nào đã qua endDate mà status vẫn đang "active" thì tự động
 * cập nhật về "expired". Gọi hàm này trước mỗi lần lấy danh sách/áp dụng voucher
 * để đảm bảo trạng thái luôn đúng thực tế, không phụ thuộc cron job riêng.
 */
const syncExpiredStatus = async () => {
    await Voucher.updateMany(
        { status: "active", endDate: { $lt: new Date() } },
        { $set: { status: "expired" } }
    );
};

// Validate dữ liệu chung cho cả create và update
const validateVoucherData = (data, { isUpdate = false } = {}) => {
    const { type, value, startDate, endDate, maxDiscount, quantity } = data;

    if (type === "percent" && value !== undefined) {
        if (value < 0 || value > 100) {
            throw new ServiceError("Giá trị giảm theo % phải trong khoảng 0-100");
        }
    }

    if (value !== undefined && value < 0) {
        throw new ServiceError("Giá trị giảm không được âm");
    }

    if (maxDiscount !== undefined && maxDiscount !== null && maxDiscount < 0) {
        throw new ServiceError("Giảm tối đa không được âm");
    }

    if (quantity !== undefined && quantity < 0) {
        throw new ServiceError("Số lượng voucher không được âm");
    }

    if (startDate && endDate) {
        if (new Date(startDate) >= new Date(endDate)) {
            throw new ServiceError("Ngày bắt đầu phải trước ngày kết thúc");
        }
    } else if (!isUpdate) {
        // Tạo mới thì bắt buộc phải có đủ cả 2 ngày (schema cũng required rồi, chặn sớm cho rõ message)
        throw new ServiceError("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc");
    }
};

/**
 * Lấy danh sách voucher có phân trang, tìm kiếm, lọc theo status/type.
 * options: { page, limit, search, status, type, sort }
 */
const getVouchers = async (options = {}) => {
    await syncExpiredStatus();

    const {
        page = 1,
        limit = 10,
        search = "",
        status,
        type,
        sort = "-createdAt",
    } = options;

    const filter = {};

    if (search) {
        filter.$or = [
            { code: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [vouchers, total] = await Promise.all([
        Voucher.find(filter).sort(sort).skip(skip).limit(Number(limit)),
        Voucher.countDocuments(filter),
    ]);

    return {
        vouchers,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(1, Math.ceil(total / Number(limit))),
    };
};

const getVoucherById = async (id) => {
    return Voucher.findById(id);
};

const getVoucherByCode = async (code) => {
    if (!code) return null;
    return Voucher.findOne({ code: code.toUpperCase().trim() });
};

const createVoucher = async (payload) => {
    validateVoucherData(payload);

    // Kiểm tra trùng mã trước để trả message rõ ràng, thay vì để lỗi E11000 khó hiểu từ Mongo
    const existing = await getVoucherByCode(payload.code);
    if (existing) {
        throw new ServiceError("Mã voucher này đã tồn tại");
    }

    const voucher = new Voucher(payload);
    return voucher.save();
};

const updateVoucher = async (id, payload) => {
    const existing = await Voucher.findById(id);
    if (!existing) return null;

    validateVoucherData(payload, { isUpdate: true });

    // Nếu đổi code, kiểm tra trùng với voucher khác (loại trừ chính nó)
    if (payload.code && payload.code.toUpperCase().trim() !== existing.code) {
        const duplicated = await Voucher.findOne({
            code: payload.code.toUpperCase().trim(),
            _id: { $ne: id },
        });
        if (duplicated) {
            throw new ServiceError("Mã voucher này đã tồn tại");
        }
    }

    return Voucher.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const deleteVoucher = async (id) => {
    return Voucher.findByIdAndDelete(id);
};

/**
 * Kiểm tra 1 voucher có áp dụng được cho đơn hàng hiện tại không,
 * và tính số tiền được giảm. Dùng ở bước checkout phía client.
 * Không tự tăng usedCount ở đây — chỉ kiểm tra, việc tăng usedCount
 * làm ở applyVoucher() sau khi đơn hàng đặt thành công.
 */
const validateVoucherForOrder = async (code, orderValue) => {
    await syncExpiredStatus();

    const voucher = await getVoucherByCode(code);
    if (!voucher) {
        throw new ServiceError("Mã voucher không tồn tại", 404);
    }
    if (voucher.status !== "active") {
        throw new ServiceError("Voucher đã hết hạn hoặc ngừng hoạt động");
    }

    const now = new Date();
    if (now < voucher.startDate) {
        throw new ServiceError("Voucher chưa đến thời gian áp dụng");
    }
    if (now > voucher.endDate) {
        throw new ServiceError("Voucher đã hết hạn");
    }
    if (voucher.usedCount >= voucher.quantity) {
        throw new ServiceError("Voucher đã hết lượt sử dụng");
    }
    if (orderValue < voucher.minOrderValue) {
        throw new ServiceError(
            `Đơn hàng phải tối thiểu ${voucher.minOrderValue.toLocaleString("vi-VN")}đ để dùng voucher này`
        );
    }

    // Tính số tiền được giảm
    let discountAmount = 0;
    if (voucher.type === "percent") {
        discountAmount = (orderValue * voucher.value) / 100;
        if (voucher.maxDiscount) {
            discountAmount = Math.min(discountAmount, voucher.maxDiscount);
        }
    } else {
        discountAmount = voucher.value;
    }
    // Không để số tiền giảm vượt quá giá trị đơn hàng
    discountAmount = Math.min(discountAmount, orderValue);

    return { voucher, discountAmount };
};

// Gọi sau khi đơn hàng áp dụng voucher đặt thành công, để tăng usedCount
const applyVoucher = async (code) => {
    const voucher = await getVoucherByCode(code);
    if (!voucher) {
        throw new ServiceError("Mã voucher không tồn tại", 404);
    }
    voucher.usedCount += 1;
    return voucher.save();
};
// Voucher user service: các hàm liên quan đến việc user lưu voucher, xem voucher của mình, đánh dấu đã dùng, admin xem toàn bộ voucher-user
// User "thu thập" (lưu) 1 voucher về ví của mình
const collectVoucher = async (userId, voucherId) => {
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
        throw new ServiceError("Không tìm thấy voucher", 404);
    }
    if (voucher.status !== "active") {
        throw new ServiceError("Voucher hiện không thể lưu (đã ngừng hoặc hết hạn)");
    }
    if (new Date() > voucher.endDate) {
        throw new ServiceError("Voucher đã hết hạn");
    }

    try {
        return await VoucherUser.create({ voucherId, userId, status: 0 });
    } catch (error) {
        // Trùng index unique(voucherId, userId) -> user đã lưu voucher này rồi
        if (error.code === 11000) {
            throw new ServiceError("Bạn đã lưu voucher này rồi");
        }
        throw error;
    }
};

// Lấy danh sách voucher mà 1 user đã lưu ("Voucher của tôi")
const getMyVouchers = async (userId, { status } = {}) => {
    const filter = { userId };
    if (status !== undefined && status !== "") filter.status = Number(status);

    return VoucherUser.find(filter)
        .populate("voucherId")
        .sort("-createdAt");
};

// Đánh dấu 1 voucher đã lưu là "đã dùng", gọi sau khi đơn hàng áp dụng voucher thành công
const markVoucherUsed = async (userId, voucherId) => {
    const record = await VoucherUser.findOne({ userId, voucherId });
    if (!record) {
        throw new ServiceError("Bạn chưa lưu voucher này", 404);
    }
    record.status = 1;
    return record.save();
};

// Admin: xem toàn bộ voucher đã được thu thập, lọc theo voucher/user/status, có phân trang
const getVoucherUsers = async (options = {}) => {
    const { page = 1, limit = 10, voucherId, userId, status } = options;

    const filter = {};
    if (voucherId) filter.voucherId = voucherId;
    if (userId) filter.userId = userId;
    if (status !== undefined && status !== "") filter.status = Number(status);

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
        VoucherUser.find(filter)
            .populate("voucherId", "code type value")
            .populate("userId", "name email")
            .sort("-createdAt")
            .skip(skip)
            .limit(Number(limit)),
        VoucherUser.countDocuments(filter),
    ]);

    return {
        items,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(1, Math.ceil(total / Number(limit))),
    };
};

export default {
    getVouchers,
    getVoucherById,
    getVoucherByCode,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucherForOrder,
    applyVoucher,
    collectVoucher,
    getMyVouchers,
    markVoucherUsed,
    getVoucherUsers,
};