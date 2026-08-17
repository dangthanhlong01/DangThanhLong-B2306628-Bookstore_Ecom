<template>
    <!-- ===== TRANG QUẢN LÝ VOUCHER ===== -->
    <div class="page">

        <h1 class="page-title">Quản lý voucher</h1>

        <div class="card">
            <div class="card-header">
                <span class="tab-label">Danh sách voucher</span>
            </div>

            <!-- Thanh công cụ: tìm kiếm + bộ lọc + thêm voucher -->
            <div class="toolbar">
                <div class="toolbar-filters">
                    <input v-model="searchKeyword" type="text" class="search-input" placeholder="Tìm theo mã hoặc mô tả"
                        @input="handleSearch" />

                    <select v-model="filterType" class="filter-select" @change="handleFilterChange">
                        <option value="">Tất cả loại giảm</option>
                        <option value="percent">Theo phần trăm</option>
                        <option value="fixed">Số tiền cố định</option>
                    </select>

                    <select v-model="filterStatus" class="filter-select" @change="handleFilterChange">
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang áp dụng</option>
                        <option value="inactive">Tạm ngừng</option>
                        <option value="expired">Đã hết hạn</option>
                    </select>
                </div>

                <div class="toolbar-actions">
                    <button class="btn btn-primary" @click="handleOpenCreate">+ Thêm voucher</button>
                </div>
            </div>

            <!-- Bảng danh sách voucher -->
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã</th>
                            <th>Loại</th>
                            <th>Giá trị</th>
                            <th>Đơn tối thiểu</th>
                            <th>Đã dùng</th>
                            <th>Thời gian áp dụng</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="9" class="empty">Đang tải...</td>
                        </tr>

                        <tr v-else v-for="(voucher, index) in vouchers" :key="voucher._id">
                            <td>{{ (page - 1) * limit + index + 1 }}</td>
                            <td class="code-cell">{{ voucher.code }}</td>
                            <td>{{ voucher.type === "percent" ? "Phần trăm" : "Cố định" }}</td>
                            <td>{{ formatValue(voucher) }}</td>
                            <td>{{ formatPrice(voucher.minOrderValue) }}</td>
                            <td>{{ voucher.usedCount ?? 0 }} / {{ voucher.quantity ?? 0 }}</td>
                            <td class="date-cell">{{ formatDate(voucher.startDate) }} - {{ formatDate(voucher.endDate)
                                }}</td>
                            <td>
                                <span :class="['badge', statusBadgeClass(voucher.status)]">
                                    {{ statusLabel(voucher.status) }}
                                </span>
                            </td>
                            <td class="actions">
                                <button class="btn-link btn-edit" @click="handleOpenEdit(voucher)">Edit</button>
                                <button class="btn-link btn-delete" @click="handleDelete(voucher._id)">Delete</button>
                            </td>
                        </tr>

                        <tr v-if="!loading && vouchers.length === 0">
                            <td colspan="9" class="empty">Không tìm thấy voucher nào</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Phân trang (server-side) -->
            <div class="pagination">
                <button class="page-btn" :disabled="page === 1" @click="handleChangePage(page - 1)">Quay lại</button>

                <button v-for="p in totalPages" :key="p" :class="['page-btn', { 'page-btn--active': p === page }]"
                    @click="handleChangePage(p)">
                    {{ p }}
                </button>

                <button class="page-btn" :disabled="page === totalPages"
                    @click="handleChangePage(page + 1)">Tiếp</button>
            </div>
        </div>

        <!-- ===== MODAL THÊM / SỬA VOUCHER ===== -->
        <div v-if="showModal" class="modal-overlay" @click.self="handleCloseModal">
            <div class="modal">
                <h2 class="modal-title">{{ isEditing ? "Chỉnh sửa voucher" : "Thêm voucher" }}</h2>

                <p v-if="formError" class="form-error">{{ formError }}</p>

                <div class="form-group">
                    <label>Mã voucher *</label>
                    <input v-model="form.code" type="text" class="form-input" placeholder="VD: SALE50"
                        style="text-transform: uppercase" />
                </div>

                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea v-model="form.description" class="form-input" rows="2"></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Loại giảm giá</label>
                        <select v-model="form.type" class="form-input">
                            <option value="percent">Theo phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định (đ)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Giá trị giảm *</label>
                        <input v-model.number="form.value" type="number" min="0"
                            :max="form.type === 'percent' ? 100 : undefined" class="form-input" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group" v-if="form.type === 'percent'">
                        <label>Giảm tối đa (đ)</label>
                        <input v-model.number="form.maxDiscount" type="number" min="0" class="form-input"
                            placeholder="Không giới hạn nếu để trống" />
                    </div>
                    <div class="form-group">
                        <label>Đơn tối thiểu (đ)</label>
                        <input v-model.number="form.minOrderValue" type="number" min="0" class="form-input" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Số lượng</label>
                        <input v-model.number="form.quantity" type="number" min="0" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>Trạng thái</label>
                        <select v-model="form.status" class="form-input">
                            <option value="active">Đang áp dụng</option>
                            <option value="inactive">Tạm ngừng</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Ngày bắt đầu *</label>
                        <input v-model="form.startDate" type="date" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>Ngày kết thúc *</label>
                        <input v-model="form.endDate" type="date" class="form-input" />
                    </div>
                </div>

                <p v-if="isEditing" class="hint-text">
                    Đã sử dụng: {{ form.usedCount ?? 0 }} lượt. Trạng thái "Đã hết hạn" được hệ thống tự động cập nhật
                    khi qua ngày kết thúc.
                </p>

                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="handleCloseModal">Huỷ</button>
                    <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                        {{ saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo mới" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// ===== IMPORTS =====
import { ref, onMounted } from "vue";
import userService from "@/services/user.service";

// ============================================================
// STATE: DANH SÁCH VOUCHER
// ============================================================

const vouchers = ref([]);
const loading = ref(false);

const page = ref(1);
const limit = ref(10);
const totalPages = ref(1);

// ============================================================
// STATE: TÌM KIẾM + BỘ LỌC
// ============================================================

const searchKeyword = ref("");
const filterType = ref("");
const filterStatus = ref("");

let searchDebounceTimer = null;

// ============================================================
// STATE: MODAL THÊM / SỬA
// ============================================================

const showModal = ref(false);
const isEditing = ref(false);

const editingVoucherId = ref(null);

const saving = ref(false);
const formError = ref("");

// ============================================================
// FORM VOUCHER
// ============================================================

const emptyForm = () => ({
    code: "",
    description: "",
    type: "percent",
    value: 0,
    maxDiscount: null,
    minOrderValue: 0,
    quantity: 0,
    usedCount: 0,
    status: "active",
    startDate: "",
    endDate: "",
});

const form = ref(emptyForm());

// ============================================================
// HELPER: FORMAT GIÁ TIỀN
// ============================================================

const formatPrice = (value) => {
    if (value == null) return "—";

    return Number(value).toLocaleString("vi-VN") + "đ";
};

// ============================================================
// HELPER: FORMAT GIÁ TRỊ VOUCHER
// ============================================================

const formatValue = (voucher) => {
    if (voucher.type === "percent") {
        return `${voucher.value}%`;
    }

    return formatPrice(voucher.value);
};

// ============================================================
// HELPER: FORMAT NGÀY
// ============================================================

// Chuyển ngày ISO từ MongoDB thành dạng dd/mm/yyyy
const formatDate = (value) => {
    if (!value) return "—";

    const d = new Date(value);

    return d.toLocaleDateString("vi-VN");
};

// ============================================================
// HELPER: CHUYỂN NGÀY SANG INPUT TYPE DATE
// ============================================================

// Chuyển ngày từ MongoDB về dạng yyyy-mm-dd
// để hiển thị đúng trong input type="date"
const toDateInputValue = (value) => {
    if (!value) return "";

    const d = new Date(value);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
};

// ============================================================
// HELPER: HIỂN THỊ TRẠNG THÁI
// ============================================================

const statusLabel = (status) => {
    if (status === "active") {
        return "Đang áp dụng";
    }

    if (status === "expired") {
        return "Đã hết hạn";
    }

    return "Tạm ngừng";
};

// ============================================================
// HELPER: CLASS CHO BADGE TRẠNG THÁI
// ============================================================

const statusBadgeClass = (status) => {
    if (status === "active") {
        return "badge--active";
    }

    if (status === "expired") {
        return "badge--warning";
    }

    return "badge--inactive";
};

// ============================================================
// API: LẤY DANH SÁCH VOUCHER
// ============================================================

const handleFetchVouchers = async () => {
    loading.value = true;

    try {
        // Gọi service thay vì axios trực tiếp
        const res = await userService.getVouchers({
            page: page.value,
            limit: limit.value,

            // Không gửi param nếu người dùng chưa nhập
            search: searchKeyword.value || undefined,
            status: filterStatus.value || undefined,
            type: filterType.value || undefined,
        });

        // Backend của m đang trả dữ liệu trong res.data.data
        const payload = res.data?.data ?? res.data ?? {};

        vouchers.value = payload.vouchers ?? [];

        totalPages.value = Math.max(
            1,
            payload.totalPages ?? 1
        );

        page.value = payload.page ?? page.value;

    } catch (err) {
        console.error("Lỗi lấy danh sách voucher:", err);

        vouchers.value = [];

    } finally {
        loading.value = false;
    }
};

// ============================================================
// TÌM KIẾM VOUCHER
// ============================================================

// Delay 400ms để không gọi API liên tục khi đang nhập
const handleSearch = () => {
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(() => {
        page.value = 1;

        handleFetchVouchers();
    }, 400);
};

// ============================================================
// THAY ĐỔI BỘ LỌC
// ============================================================

const handleFilterChange = () => {
    // Khi đổi filter thì quay lại trang đầu
    page.value = 1;

    handleFetchVouchers();
};

// ============================================================
// PHÂN TRANG
// ============================================================

const handleChangePage = (p) => {
    if (p < 1 || p > totalPages.value) {
        return;
    }

    page.value = p;

    handleFetchVouchers();
};

// ============================================================
// MỞ MODAL THÊM VOUCHER
// ============================================================

const handleOpenCreate = () => {
    isEditing.value = false;

    editingVoucherId.value = null;

    // Reset form
    form.value = emptyForm();

    formError.value = "";

    showModal.value = true;
};

// ============================================================
// MỞ MODAL SỬA VOUCHER
// ============================================================

const handleOpenEdit = (voucher) => {
    isEditing.value = true;

    editingVoucherId.value = voucher._id;

    form.value = {
        code: voucher.code || "",

        description: voucher.description || "",

        type: voucher.type || "percent",

        value: voucher.value || 0,

        maxDiscount: voucher.maxDiscount ?? null,

        minOrderValue: voucher.minOrderValue || 0,

        quantity: voucher.quantity || 0,

        usedCount: voucher.usedCount || 0,

        // Nếu voucher đã expired thì khi sửa
        // chuyển về inactive để không gửi expired lên backend
        status:
            voucher.status === "expired"
                ? "inactive"
                : voucher.status || "active",

        startDate: toDateInputValue(voucher.startDate),

        endDate: toDateInputValue(voucher.endDate),
    };

    formError.value = "";

    showModal.value = true;
};

// ============================================================
// ĐÓNG MODAL
// ============================================================

const handleCloseModal = () => {
    showModal.value = false;

    formError.value = "";
};

// ============================================================
// TẠO PAYLOAD GỬI BACKEND
// ============================================================

const buildPayload = () => {
    const payload = {
        code: form.value.code.trim().toUpperCase(),

        description: form.value.description || "",

        type: form.value.type,

        value: form.value.value,

        minOrderValue: form.value.minOrderValue || 0,

        quantity: form.value.quantity || 0,

        status: form.value.status,

        startDate: form.value.startDate,

        endDate: form.value.endDate,
    };

    // maxDiscount chỉ gửi khi voucher giảm theo %
    if (form.value.type === "percent") {
        payload.maxDiscount =
            form.value.maxDiscount || null;
    }

    return payload;
};

// ============================================================
// VALIDATE FORM
// ============================================================

const validateForm = () => {
    // Kiểm tra mã voucher
    if (!form.value.code.trim()) {
        formError.value = "Vui lòng nhập mã voucher";
        return false;
    }

    // Kiểm tra ngày
    if (
        !form.value.startDate ||
        !form.value.endDate
    ) {
        formError.value =
            "Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc";

        return false;
    }

    // Ngày bắt đầu phải nhỏ hơn ngày kết thúc
    if (
        new Date(form.value.startDate) >=
        new Date(form.value.endDate)
    ) {
        formError.value =
            "Ngày bắt đầu phải trước ngày kết thúc";

        return false;
    }

    // Nếu giảm theo phần trăm thì chỉ được từ 0 - 100
    if (
        form.value.type === "percent" &&
        (
            form.value.value < 0 ||
            form.value.value > 100
        )
    ) {
        formError.value =
            "Giá trị giảm theo % phải trong khoảng 0-100";

        return false;
    }

    return true;
};

// ============================================================
// API: THÊM / SỬA VOUCHER
// ============================================================

const handleSubmit = async () => {
    formError.value = "";

    // Validate trước khi gửi API
    if (!validateForm()) {
        return;
    }

    saving.value = true;

    try {
        // Tạo dữ liệu gửi backend
        const payload = buildPayload();

        let res;

        // Nếu đang sửa
        if (isEditing.value) {
            res = await userService.updateVoucher(
                editingVoucherId.value,
                payload
            );
        }

        // Nếu đang thêm
        else {
            res = await userService.createVoucher(
                payload
            );
        }

        // Backend báo lỗi
        if (res.data?.success === false) {
            formError.value =
                res.data.message ||
                "Lưu voucher thất bại";

            return;
        }

        // Đóng modal
        handleCloseModal();

        // Nếu thêm mới thì quay về trang 1
        if (!isEditing.value) {
            page.value = 1;
        }

        // Lấy lại danh sách mới
        // => giao diện cập nhật ngay, không cần F5
        await handleFetchVouchers();

    } catch (err) {
        console.error("Lỗi lưu voucher:", err);

        formError.value =
            err.response?.data?.message ||
            "Lưu voucher thất bại, vui lòng thử lại";

    } finally {
        saving.value = false;
    }
};

// ============================================================
// API: XÓA VOUCHER
// ============================================================

const handleDelete = async (voucherId) => {
    // Xác nhận trước khi xóa
    if (!confirm("Bạn có chắc muốn xoá voucher này?")) {
        return;
    }

    try {
        // Gọi service xóa
        const res =
            await userService.deleteVoucher(voucherId);

        // Nếu xóa thành công
        if (res.data?.success !== false) {

            // Nếu trang hiện tại chỉ còn 1 voucher
            // và không phải trang đầu thì lùi về trang trước
            if (
                vouchers.value.length === 1 &&
                page.value > 1
            ) {
                page.value -= 1;
            }

            // Lấy lại danh sách
            // => voucher bị xóa biến mất ngay
            await handleFetchVouchers();
        }

    } catch (err) {
        console.error("Lỗi xoá voucher:", err);
    }
};

// ============================================================
// LIFECYCLE
// ============================================================

// Khi mở trang VoucherManagement
// tự động lấy danh sách voucher
onMounted(() => {
    handleFetchVouchers();
});
</script>

<style scoped>
/* ===== LAYOUT ===== */
.page {
    padding: 0;
    background: transparent;
    min-height: auto;
    color: #1f2937;
}

.page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 20px;
}

/* ===== CARD ===== */
.card {
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #eef0f2;
}

.tab-label {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
}

/* ===== TOOLBAR ===== */
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    gap: 12px;
    flex-wrap: wrap;
}

.toolbar-filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.form-error {
    background: #fee2e2;
    color: #b91c1c;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    margin: 0 0 14px;
}

.hint-text {
    font-size: 12.5px;
    color: #6b7280;
    margin: 4px 0 0;
}

.search-input {
    width: 240px;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #1f2937;
    font-size: 14px;
    outline: none;
}

.search-input::placeholder {
    color: #9ca3af;
}

.search-input:focus,
.filter-select:focus {
    border-color: #2563eb;
}

.filter-select {
    padding: 8px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #1f2937;
    font-size: 13.5px;
    outline: none;
}

/* ===== BUTTONS ===== */
.btn {
    padding: 7px 16px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
}

.btn-primary {
    background: #2b6cb0;
    color: #ffffff;
}

.btn-primary:hover {
    background: #3182ce;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #4a5568;
    color: #e0e0e0;
}

.btn-secondary:hover {
    background: #718096;
}

.btn-link {
    background: none;
    border: none;
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    font-weight: 500;
}

.btn-edit {
    color: #2563eb;
    margin-right: 10px;
}

.btn-edit:hover {
    text-decoration: underline;
}

.btn-delete {
    color: #dc2626;
}

.btn-delete:hover {
    text-decoration: underline;
}

/* ===== TABLE ===== */
.table-wrapper {
    overflow-x: auto;
}

.table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.table th {
    background: #f9fafb;
    color: #374151;
    font-weight: 600;
    padding: 11px 16px;
    text-align: left;
    border-bottom: 1px solid #eef0f2;
    white-space: nowrap;
}

.table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    vertical-align: middle;
}

.code-cell {
    font-weight: 600;
    letter-spacing: 0.02em;
}

.date-cell {
    white-space: nowrap;
    font-size: 12.5px;
    color: #6b7280;
}

.table tbody tr:hover {
    background: #f9fafb;
}

.actions {
    white-space: nowrap;
}

.empty {
    text-align: center;
    color: #9ca3af;
    padding: 32px;
}

/* ===== BADGE TRẠNG THÁI ===== */
.badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.badge--active {
    background: #dcfce7;
    color: #16a34a;
}

.badge--inactive {
    background: #fee2e2;
    color: #dc2626;
}

.badge--warning {
    background: #fef3c7;
    color: #b45309;
}

/* ===== PHÂN TRANG ===== */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 16px;
}

.page-btn {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #374151;
    font-size: 13.5px;
    cursor: pointer;
    transition: background 0.15s;
}

.page-btn:hover:not(:disabled) {
    background: #f3f4f6;
}

.page-btn--active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
}

.page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

/* ===== MODAL ===== */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
}

.modal {
    background: #ffffff;
    border-radius: 10px;
    padding: 24px;
    width: 460px;
    max-width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid #eef0f2;
}

.modal-title {
    font-size: 17px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20px;
}

/* ===== FORM ===== */
.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 12px;
}

.form-group {
    margin-bottom: 14px;
}

.form-group label {
    display: block;
    font-size: 13px;
    color: #374151;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #1f2937;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;
}

.form-input:focus {
    border-color: #2563eb;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

@media (max-width: 700px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>