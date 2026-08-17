<template>
    <!-- ===== TRANG QUẢN LÝ NGƯỜI DÙNG ===== -->
    <div class="page">

        <!-- Tiêu đề trang -->
        <h1 class="page-title">Quản lý người dùng</h1>

        <!-- Khung chứa bảng dữ liệu -->
        <div class="card">

            <!-- Nhãn tab phía trên bảng -->
            <div class="card-header">
                <span class="tab-label">Danh sách người dùng</span>
            </div>

            <!-- Thanh công cụ: tìm kiếm + xuất excel -->
            <div class="toolbar">
                <!-- Ô tìm kiếm theo số điện thoại -->
                <input v-model="searchPhone" type="text" class="search-input" placeholder="Tìm kiếm theo số điện thoại"
                    @input="handleSearch" />

                <!-- Nút xuất dữ liệu ra file Excel -->
                <div class="toolbar-actions">
                    <button class="btn btn-primary" @click="handleOpenCreate">
                        + Thêm người dùng
                    </button>
                    <button class="btn btn-success" @click="handleExportExcel">
                        Xuất excel
                    </button>
                </div>
            </div>

            <!-- Bảng danh sách người dùng -->
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Email</th>
                            <th>Họ và tên</th>
                            <th>Số điện thoại</th>
                            <th>Ngày sinh</th>
                            <th>Giới tính</th>
                            <th>Quyền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!--
              Lặp qua danh sách người dùng hiện tại trên trang
              index + 1 để đánh số thứ tự bắt đầu từ 1
            -->
                        <tr v-for="(user, index) in paginatedUsers" :key="user._id">
                            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.fullName }}</td>
                            <td>{{ user.phone || "—" }}</td>
                            <!-- Định dạng ngày sinh về dd/mm/yyyy -->
                            <td>{{ formatDate(user.dob) }}</td>
                            <td>{{ user.gender || "Nam" }}</td>
                            <!-- Badge màu khác nhau tuỳ theo role -->
                            <td>
                                <span :class="['badge', roleBadgeClass(user.role)]">
                                    {{ user.role }}
                                </span>
                            </td>
                            <!-- Nút thao tác: Edit và Delete -->
                            <td class="actions">
                                <button class="btn-link btn-edit" @click="handleOpenEdit(user)">
                                    Edit
                                </button>
                                <button class="btn-link btn-delete" @click="handleDelete(user._id)">
                                    Delete
                                </button>
                            </td>
                        </tr>

                        <!-- Hiển thị khi không có dữ liệu -->
                        <tr v-if="paginatedUsers.length === 0">
                            <td colspan="8" class="empty">Không tìm thấy người dùng nào</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Phân trang -->
            <div class="pagination">
                <!-- Nút Quay lại -->
                <button class="page-btn" :disabled="currentPage === 1" @click="handleChangePage(currentPage - 1)">
                    Quay lại
                </button>

                <!--
          Render các số trang
          page-btn--active đánh dấu trang đang xem
        -->
                <button v-for="page in totalPages" :key="page"
                    :class="['page-btn', { 'page-btn--active': page === currentPage }]" @click="handleChangePage(page)">
                    {{ page }}
                </button>

                <!-- Nút Tiếp -->
                <button class="page-btn" :disabled="currentPage === totalPages"
                    @click="handleChangePage(currentPage + 1)">
                    Tiếp
                </button>
            </div>
        </div>

        <!-- ===== MODAL SỬA NGƯỜI DÙNG ===== -->
        <!--
      Hiện modal khi showEditModal = true
      @click.self để đóng khi click ra ngoài modal
    -->
        <div v-if="showEditModal" class="modal-overlay">
            <div class="modal">
                <h2 class="modal-title">Chỉnh sửa người dùng</h2>

                <div class="form-group">
                    <label>Họ và tên</label>
                    <input v-model="editForm.fullName" type="text" class="form-input" />
                </div>

                <div class="form-group">
                    <label>Số điện thoại</label>
                    <input v-model="editForm.phone" type="text" class="form-input" />
                </div>

                <div class="form-group">
                    <label>Ngày sinh</label>
                    <input v-model="editForm.dob" type="date" class="form-input" />
                </div>

                <div class="form-group">
                    <label>Quyền</label>
                    <!-- Dropdown chọn role: customer / admin -->
                    <select v-model="editForm.role" class="form-input">
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Trạng thái</label>
                    <select v-model="editForm.status" class="form-input">
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                    </select>
                </div>

                <!-- Nút hành động trong modal -->
                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="handleCloseEdit">Huỷ</button>
                    <button class="btn btn-primary" @click="handleSaveEdit">Lưu</button>
                </div>
            </div>
        </div>

        <!-- ===== MODAL THÊM NGƯỜI DÙNG ===== -->
        <div v-if="showCreateModal" class="modal-overlay">
            <div class="modal">
                <h2 class="modal-title">Thêm người dùng</h2>

                <p v-if="createError" class="form-error">{{ createError }}</p>

                <div class="form-group">
                    <label>Email</label>
                    <input v-model="createForm.email" type="email" class="form-input" placeholder="email@example.com" />
                </div>

                <div class="form-group">
                    <label>Mật khẩu</label>
                    <input v-model="createForm.password" type="password" class="form-input"
                        placeholder="Ít nhất 6 ký tự" />
                </div>

                <div class="form-group">
                    <label>Họ và tên</label>
                    <input v-model="createForm.fullName" type="text" class="form-input" />
                </div>

                <div class="form-group">
                    <label>Số điện thoại</label>
                    <input v-model="createForm.phone" type="text" class="form-input" />
                </div>

                <div class="form-group">
                    <label>Ngày sinh</label>
                    <input v-model="createForm.dob" type="date" class="form-input" />
                </div>

                <div class="form-group">
                    <label>Quyền</label>
                    <select v-model="createForm.role" class="form-input">
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Trạng thái</label>
                    <select v-model="createForm.status" class="form-input">
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="handleCloseCreate">Huỷ</button>
                    <button class="btn btn-primary" :disabled="creating" @click="handleCreateUser">
                        {{ creating ? "Đang tạo..." : "Tạo mới" }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
// ===== IMPORTS =====
import { ref, computed, onMounted } from "vue";
import axios from "axios";

// ===== CẤU HÌNH =====
// Base URL của backend, đổi lại khi deploy
const API_BASE = "http://localhost:5000/api";

// Số bản ghi hiển thị trên mỗi trang
const pageSize = 6;

// ===== STATE =====
// Danh sách toàn bộ người dùng lấy từ API
const users = ref([]);

// Từ khoá tìm kiếm theo số điện thoại
const searchPhone = ref("");

// Trang đang xem (bắt đầu từ 1)
const currentPage = ref(1);

// Trạng thái hiển thị modal chỉnh sửa
const showEditModal = ref(false);

// Trạng thái hiển thị modal thêm người dùng
const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref("");

// Lưu _id của user đang được chỉnh sửa (để gọi API PUT)
const editingUserId = ref(null);

// Dữ liệu trong form chỉnh sửa
const editForm = ref({
    fullName: "",
    phone: "",
    dob: "",
    role: "customer",
    status: "active",
});

// Dữ liệu trong form thêm mới
const createForm = ref({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    dob: "",
    role: "customer",
    status: "active",
});

// ===== COMPUTED =====

// Lọc danh sách user theo số điện thoại đã nhập
const filteredUsers = computed(() => {
    if (!searchPhone.value) return users.value;
    return users.value.filter((u) =>
        (u.phone || "").includes(searchPhone.value.trim())
    );
});

// Tổng số trang dựa trên danh sách đã lọc
const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredUsers.value.length / pageSize))
);

// Lấy đúng phần tử của trang hiện tại
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredUsers.value.slice(start, start + pageSize);
});

// ===== HELPERS =====

// Lấy token từ localStorage để gắn vào header Authorization
const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

// Định dạng ngày từ ISO string → dd/mm/yyyy
const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// Trả về class CSS tương ứng với role để hiển thị màu badge
const roleBadgeClass = (role) => {
    const map = {
        admin: "badge--admin",
        customer: "badge--customer",
        shipper: "badge--shipper",
    };
    return map[role] || "badge--default";
};

// ===== API CALLS =====

// Gọi API lấy toàn bộ danh sách người dùng (admin only)
const handleFetchUsers = async () => {
    try {
        const res = await axios.get(`${API_BASE}/users`, getAuthHeaders());
        if (res.data.success) {
            users.value = res.data.data.users;
        }
    } catch (err) {
        console.error("Lỗi lấy danh sách người dùng:", err);
    }
};

// Gọi API xoá người dùng theo id
const handleDelete = async (userId) => {
    // Xác nhận trước khi xoá
    if (!confirm("Bạn có chắc muốn xoá người dùng này?")) return;
    try {
        const res = await axios.delete(
            `${API_BASE}/users/${userId}`,
            getAuthHeaders()
        );
        if (res.data.success) {
            // Xoá khỏi danh sách local ngay, không cần gọi lại API
            users.value = users.value.filter((u) => u._id !== userId);
        }
    } catch (err) {
        console.error("Lỗi xoá người dùng:", err);
    }
};

// Gọi API cập nhật thông tin người dùng
const handleSaveEdit = async () => {
    try {
        const res = await axios.put(
            `${API_BASE}/users/${editingUserId.value}`,
            editForm.value,
            getAuthHeaders()
        );
        if (res.data.success) {
            // Cập nhật lại user trong danh sách local mà không cần gọi lại toàn bộ
            const idx = users.value.findIndex((u) => u._id === editingUserId.value);
            if (idx !== -1) {
                users.value[idx] = { ...users.value[idx], ...editForm.value };
            }
            handleCloseEdit();
        }
    } catch (err) {
        console.error("Lỗi cập nhật người dùng:", err);
    }
};

// Xuất danh sách người dùng ra file Excel
const handleExportExcel = async () => {
    try {
        // Tạm thời dùng cách đơn giản: chuyển data thành CSV và tải về
        const headers = ["STT", "Email", "Họ và tên", "Số điện thoại", "Ngày sinh", "Role"];
        const rows = users.value.map((u, i) => [
            i + 1,
            u.email,
            u.fullName,
            u.phone || "",
            formatDate(u.dob),
            u.role,
        ]);
        const csvContent = [headers, ...rows]
            .map((r) => r.join(","))
            .join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "danh-sach-nguoi-dung.csv";
        link.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Lỗi xuất Excel:", err);
    }
};

// ===== UI HANDLERS =====

// Reset về trang 1 mỗi khi người dùng gõ tìm kiếm
const handleSearch = () => {
    currentPage.value = 1;
};

// Chuyển sang trang mới khi bấm số trang hoặc nút Quay lại / Tiếp
const handleChangePage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
};

// Mở modal chỉnh sửa và điền sẵn dữ liệu của user được chọn
const handleOpenEdit = (user) => {
    editingUserId.value = user._id;
    // Định dạng dob về yyyy-mm-dd để hiển thị đúng trong input type="date"
    editForm.value = {
        fullName: user.fullName || "",
        phone: user.phone || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        role: user.role || "customer",
        status: user.status || "active",
    };
    showEditModal.value = true;
};

// Đóng modal và reset trạng thái
const handleCloseEdit = () => {
    showEditModal.value = false;
    editingUserId.value = null;
};

// Mở modal thêm người dùng, reset form về mặc định
const handleOpenCreate = () => {
    createForm.value = {
        email: "",
        password: "",
        fullName: "",
        phone: "",
        dob: "",
        role: "customer",
        status: "active",
    };
    createError.value = "";
    showCreateModal.value = true;
};

const handleCloseCreate = () => {
    showCreateModal.value = false;
    createError.value = "";
};

// Gọi API tạo mới người dùng
const handleCreateUser = async () => {
    createError.value = "";

    if (!createForm.value.email || !createForm.value.password || !createForm.value.fullName) {
        createError.value = "Vui lòng nhập đầy đủ email, mật khẩu và họ tên";
        return;
    }

    creating.value = true;
    try {
        const res = await axios.post(
            `${API_BASE}/users`,
            createForm.value,
            getAuthHeaders()
        );
        if (res.data.success) {
            handleCloseCreate();
            // Tải lại danh sách để thấy user mới ngay
            await handleFetchUsers();
            currentPage.value = 1;
        } else {
            createError.value = res.data.message || "Tạo người dùng thất bại";
        }
    } catch (err) {
        createError.value =
            err.response?.data?.message || "Tạo người dùng thất bại, vui lòng thử lại";
    } finally {
        creating.value = false;
    }
};

// ===== LIFECYCLE =====
// Gọi API lấy danh sách người dùng ngay khi component được mount
onMounted(() => {
    handleFetchUsers();
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
    padding: 0;
    background: transparent;
    border-radius: 0;
}

/* ===== TOOLBAR ===== */
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    gap: 12px;
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

.search-input {
    width: 260px;
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

.search-input:focus {
    border-color: #2563eb;
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

.btn-success {
    background: #16a34a;
    color: #ffffff;
}

.btn-success:hover {
    background: #15803d;
}

.btn-primary {
    background: #2b6cb0;
    color: #ffffff;
}

.btn-primary:hover {
    background: #3182ce;
}

.btn-secondary {
    background: #4a5568;
    color: #e0e0e0;
}

.btn-secondary:hover {
    background: #718096;
}

/* Nút Edit / Delete dạng text link trong bảng */
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

/* Màu xen kẽ giữa các hàng */
.table tbody tr:nth-child(even) {
    background: #ffffff;
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

/* ===== BADGE ROLE ===== */
.badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: lowercase;
}

.badge--admin {
    background: #2b6cb0;
    color: #bee3f8;
}

.badge--customer {
    background: #276749;
    color: #c6f6d5;
}

.badge--shipper {
    background: #744210;
    color: #fefcbf;
}

.badge--default {
    background: #4a5568;
    color: #e2e8f0;
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

/* Trang đang active */
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
/* Lớp nền tối phía sau modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.modal {
    background: #ffffff;
    border-radius: 10px;
    padding: 24px;
    width: 420px;
    border: 1px solid #eef0f2;
}

.modal-title {
    font-size: 17px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20px;
}

/* ===== FORM TRONG MODAL ===== */
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
}

.form-input:focus {
    border-color: #2563eb;
}

/* Các nút hành động dưới modal */
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}
</style>