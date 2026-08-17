import voucherService from "../services/voucher.service.js";

// GET /api/vouchers?page=&limit=&search=&status=&type=  (ADMIN - xem tất cả)
const getVouchers = async (req, res) => {
    try {
        const result = await voucherService.getVouchers(req.query);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Lỗi lấy danh sách voucher:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy danh sách voucher",
        });
    }
};

// GET /api/vouchers/active?page=&limit=  (PUBLIC - khách xem voucher đang active)
const getActiveVouchers = async (req, res) => {
    try {
        // Ép cứng status = "active", không cho query string ghi đè
        // để khách không xem được voucher inactive/expired/draft
        const result = await voucherService.getVouchers({
            ...req.query,
            status: "active",
        });
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Lỗi lấy voucher đang active:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy danh sách voucher",
        });
    }
};

// GET /api/vouchers/:id
const getVoucherById = async (req, res) => {
    try {
        const voucher = await voucherService.getVoucherById(req.params.id);
        if (!voucher) {
            return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
        }
        return res.status(200).json({ success: true, data: voucher });
    } catch (error) {
        console.error("Lỗi lấy chi tiết voucher:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy chi tiết voucher",
        });
    }
};

// POST /api/vouchers  (admin)
const createVoucher = async (req, res) => {
    try {
        const voucher = await voucherService.createVoucher(req.body);
        return res.status(201).json({ success: true, data: voucher });
    } catch (error) {
        console.error("Lỗi tạo voucher:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể tạo voucher",
        });
    }
};

// PUT /api/vouchers/:id  (admin)
const updateVoucher = async (req, res) => {
    try {
        const voucher = await voucherService.updateVoucher(req.params.id, req.body);
        if (!voucher) {
            return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
        }
        return res.status(200).json({ success: true, data: voucher });
    } catch (error) {
        console.error("Lỗi cập nhật voucher:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể cập nhật voucher",
        });
    }
};

// DELETE /api/vouchers/:id  (admin)
const deleteVoucher = async (req, res) => {
    try {
        const voucher = await voucherService.deleteVoucher(req.params.id);
        if (!voucher) {
            return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
        }
        return res.status(200).json({ success: true, message: "Xoá voucher thành công" });
    } catch (error) {
        console.error("Lỗi xoá voucher:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể xoá voucher",
        });
    }
};

// POST /api/vouchers/validate  body: { code, orderValue }  (khách hàng dùng ở bước checkout)
const validateVoucher = async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        if (!code || orderValue === undefined) {
            return res.status(400).json({
                success: false,
                message: "Thiếu mã voucher hoặc giá trị đơn hàng",
            });
        }

        const result = await voucherService.validateVoucherForOrder(code, Number(orderValue));
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Lỗi kiểm tra voucher:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể áp dụng voucher",
        });
    }
};

// POST /api/vouchers/collect  body: { voucherId }  (user đã đăng nhập)
const collectVoucher = async (req, res) => {
    try {
        const { voucherId } = req.body;
        if (!voucherId) {
            return res.status(400).json({ success: false, message: "Thiếu voucherId" });
        }
        // FIX: dùng voucherService (trước đó gọi voucherUserService chưa import -> lỗi)
        const record = await voucherService.collectVoucher(req.user.id, voucherId);
        return res.status(201).json({ success: true, data: record });
    } catch (error) {
        console.error("Lỗi lưu voucher:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lưu voucher",
        });
    }
};

// GET /api/vouchers/my?status=  (user đã đăng nhập)
const getMyVouchers = async (req, res) => {
    try {
        const data = await voucherService.getMyVouchers(req.user.id, req.query);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Lỗi lấy voucher của tôi:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy danh sách voucher",
        });
    }
};

// PUT /api/vouchers/use  body: { voucherId }  (user đã đăng nhập, gọi sau khi đặt hàng thành công)
const markVoucherUsed = async (req, res) => {
    try {
        const { voucherId } = req.body;
        if (!voucherId) {
            return res.status(400).json({ success: false, message: "Thiếu voucherId" });
        }
        const record = await voucherService.markVoucherUsed(req.user.id, voucherId);
        return res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái voucher:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể cập nhật voucher",
        });
    }
};

// GET /api/vouchers/collected?page=&limit=&voucherId=&userId=&status=  (admin)
const getVoucherUsers = async (req, res) => {
    try {
        const data = await voucherService.getVoucherUsers(req.query);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Lỗi lấy danh sách voucher đã thu thập:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy danh sách",
        });
    }
};

export default {
    getVouchers,
    getActiveVouchers,
    getVoucherById,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
    collectVoucher,
    getMyVouchers,
    markVoucherUsed,
    getVoucherUsers,
};