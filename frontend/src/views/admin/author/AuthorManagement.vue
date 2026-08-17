<template>
    <div class="page">
        <h1 class="page-title">Quản lý tác giả</h1>

        <div class="card">
            <div class="card-header">
                <span class="tab-label">Danh sách tác giả</span>
            </div>

            <!-- TOOLBAR -->
            <div class="toolbar">
                <div class="toolbar-filters">
                    <input v-model="search" type="text" class="search-input" placeholder="Tìm theo tên tác giả"
                        @input="handleSearch" />

                    <select v-model="status" class="filter-select" @change="handleFilterChange">
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">
                            Đang hoạt động
                        </option>
                        <option value="inactive">
                            Ngừng hoạt động
                        </option>
                    </select>
                </div>

                <div class="toolbar-actions">
                    <button class="btn btn-primary" @click="handleOpenCreate">
                        + Thêm tác giả
                    </button>
                </div>
            </div>

            <!-- TABLE -->
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên tác giả</th>
                            <th>Quốc tịch</th>
                            <th>Tiểu sử</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-if="loading">
                            <td colspan="6" class="empty">
                                Đang tải...
                            </td>
                        </tr>

                        <tr v-else v-for="(author, index) in authors" :key="author._id">
                            <td>
                                {{ (page - 1) * limit + index + 1 }}
                            </td>

                            <td class="name-cell">
                                {{ author.name }}
                            </td>

                            <td>
                                {{ author.nationality || "—" }}
                            </td>

                            <td class="desc-cell">
                                {{ author.bio || "—" }}
                            </td>

                            <td>
                                <span :class="[
                                    'badge',
                                    statusBadgeClass(author.status)
                                ]">
                                    {{ statusLabel(author.status) }}
                                </span>
                            </td>

                            <td class="actions">
                                <button class="btn-link btn-edit" @click="handleOpenEdit(author)">
                                    Edit
                                </button>

                                <button class="btn-link btn-delete" @click="handleDelete(author._id)">
                                    Delete
                                </button>
                            </td>
                        </tr>

                        <tr v-if="
                            !loading &&
                            authors.length === 0
                        ">
                            <td colspan="6" class="empty">
                                Không tìm thấy tác giả nào
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- PAGINATION -->
            <div class="pagination">
                <button class="page-btn" :disabled="page === 1" @click="handleChangePage(page - 1)">
                    Quay lại
                </button>

                <button v-for="p in totalPages" :key="p" :class="[
                    'page-btn',
                    {
                        'page-btn--active': p === page
                    }
                ]" @click="handleChangePage(p)">
                    {{ p }}
                </button>

                <button class="page-btn" :disabled="page === totalPages" @click="handleChangePage(page + 1)">
                    Tiếp
                </button>
            </div>
        </div>

        <!-- MODAL -->
        <div v-if="showModal" class="modal-overlay" @click.self="handleCloseModal">
            <div class="modal">
                <h2 class="modal-title">
                    {{
                        isEditing
                            ? "Chỉnh sửa tác giả"
                            : "Thêm tác giả"
                    }}
                </h2>

                <p v-if="formError" class="form-error">
                    {{ formError }}
                </p>

                <!-- TÊN -->
                <div class="form-group">
                    <label>Tên tác giả *</label>

                    <input v-model="form.name" type="text" class="form-input" placeholder="Nhập tên tác giả" />
                </div>

                <!-- AVATAR -->
                <div class="form-group">
                    <label>Avatar</label>

                    <input v-model="form.avatar" type="text" class="form-input" placeholder="Nhập URL avatar" />

                    <div v-if="form.avatar" class="avatar-preview">
                        <img :src="form.avatar" alt="Avatar tác giả" />
                    </div>
                </div>

                <!-- QUỐC TỊCH -->
                <div class="form-group">
                    <label>Quốc tịch</label>

                    <input v-model="form.nationality" type="text" class="form-input" placeholder="Nhập quốc tịch" />
                </div>

                <!-- BIO -->
                <div class="form-group">
                    <label>Tiểu sử</label>

                    <textarea v-model="form.bio" class="form-input" rows="5"
                        placeholder="Nhập tiểu sử tác giả"></textarea>
                </div>

                <!-- STATUS -->
                <div class="form-group">
                    <label>Trạng thái</label>

                    <select v-model="form.status" class="form-input">
                        <option value="active">
                            Đang hoạt động
                        </option>

                        <option value="inactive">
                            Ngừng hoạt động
                        </option>
                    </select>
                </div>

                <!-- ACTION -->
                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="handleCloseModal">
                        Huỷ
                    </button>

                    <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                        {{
                            saving
                                ? "Đang lưu..."
                                : isEditing
                                    ? "Lưu thay đổi"
                                    : "Tạo mới"
                        }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import userService from "@/services/user.service.js";

// Danh sách tác giả
const authors = ref([]);    

// Trạng thái loading
const loading = ref(false);

// Trạng thái lưu
const saving = ref(false);

// Modal
const showModal = ref(false);

// Chế độ chỉnh sửa
const isEditing = ref(false);

// ID tác giả đang sửa
const editingId = ref(null);

// Tìm kiếm
const search = ref("");

// Lọc trạng thái
const status = ref("");

// Phân trang
const page = ref(1);
const limit = ref(10);
const total = ref(0);

// Lỗi form
const formError = ref("");

// Form
const form = ref({
    name: "",
    avatar: "",
    bio: "",
    nationality: "",
    status: "active",
});

// Tổng số trang
const totalPages = computed(() => {
    return Math.max(
        1,
        Math.ceil(total.value / limit.value)
    );
});

// Lấy danh sách tác giả
const fetchAuthors = async () => {
    try {
        loading.value = true;

        const response = await userService.getAuthors({
            page: page.value,
            limit: limit.value,
            search: search.value,
            status: status.value,
        });

        console.log("API GET AUTHORS:", response.data);

        const payload = response.data?.data ?? response.data ?? {};

        authors.value = payload.authors ?? [];

        total.value = payload.total ?? 0;

        console.log("Danh sách authors:", authors.value);
        console.log("Tổng:", total.value);

    } catch (error) {
        console.error(
            "Lỗi lấy danh sách tác giả:",
            error
        );

        authors.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// Tìm kiếm
const handleSearch = () => {
    page.value = 1;
    fetchAuthors();
};

// Lọc trạng thái
const handleFilterChange = () => {
    page.value = 1;
    fetchAuthors();
};

// Chuyển trang
const handleChangePage = (newPage) => {
    if (
        newPage < 1 ||
        newPage > totalPages.value
    ) {
        return;
    }

    page.value = newPage;
    fetchAuthors();
};

// Mở modal thêm
const handleOpenCreate = () => {
    isEditing.value = false;
    editingId.value = null;
    formError.value = "";

    form.value = {
        name: "",
        avatar: "",
        bio: "",
        nationality: "",
        status: "active",
    };

    showModal.value = true;
};

// Mở modal sửa
const handleOpenEdit = (author) => {
    isEditing.value = true;
    editingId.value = author._id;
    formError.value = "";

    form.value = {
        name: author.name || "",
        avatar: author.avatar || "",
        bio: author.bio || "",
        nationality: author.nationality || "",
        status: author.status || "active",
    };

    showModal.value = true;
};

// Đóng modal
const handleCloseModal = () => {
    if (saving.value) {
        return;
    }

    showModal.value = false;
};

// Submit
const handleSubmit = async () => {
    formError.value = "";

    if (!form.value.name.trim()) {
        formError.value =
            "Tên tác giả là bắt buộc";

        return;
    }

    try {
        saving.value = true;

        const data = {
            name: form.value.name.trim(),
            avatar: form.value.avatar.trim(),
            bio: form.value.bio.trim(),
            nationality:
                form.value.nationality.trim(),
            status: form.value.status,
        };

        if (isEditing.value) {
            await userService.updateAuthor(
                editingId.value,
                data
            );
        } else {
            await userService.createAuthor(data);
        }

        showModal.value = false;

        await fetchAuthors();

    } catch (error) {
        console.error(
            "Lỗi lưu tác giả:",
            error
        );

        formError.value =
            error.response?.data?.message ||
            "Không thể lưu tác giả";
    } finally {
        saving.value = false;
    }
};

// Xóa / ẩn tác giả
const handleDelete = async (id) => {
    const confirmed = window.confirm(
        "Bạn có chắc muốn ẩn tác giả này?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await userService.deleteAuthor(id);

        await fetchAuthors();
    } catch (error) {
        console.error(
            "Lỗi xóa tác giả:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Không thể xóa tác giả"
        );
    }
};

// Hiển thị tên trạng thái
const statusLabel = (status) => {
    return status === "active"
        ? "Đang hoạt động"
        : "Ngừng hoạt động";
};

// CSS class trạng thái
const statusBadgeClass = (status) => {
    return status === "active"
        ? "badge-success"
        : "badge-danger";
};

// Khi trang được mở
onMounted(() => {
    fetchAuthors();
});
</script>

<style scoped>
/* =========================
   PAGE
========================= */

.page {
    width: 100%;
    padding: 0;
    background: transparent;
    color: #1f2937;
    box-sizing: border-box;
}

.page-title {
    margin: 0 0 20px;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}


/* =========================
   CARD
========================= */

.card {
    width: 100%;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}

.card-header {
    height: 54px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eef0f2;
    box-sizing: border-box;
}

.tab-label {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
}


/* =========================
   TOOLBAR
========================= */

.toolbar {
    min-height: 68px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    border-bottom: 1px solid #eef0f2;
    box-sizing: border-box;
}

.toolbar-filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.toolbar-actions {
    display: flex;
    align-items: center;
}


/* =========================
   SEARCH + FILTER
========================= */

.search-input {
    width: 280px;
    height: 38px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #1f2937;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
}

.search-input::placeholder {
    color: #9ca3af;
}

.search-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08);
}

.filter-select {
    width: 190px;
    height: 38px;
    padding: 0 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #374151;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
}

.filter-select:focus {
    border-color: #2563eb;
}


/* =========================
   BUTTON
========================= */

.btn {
    height: 38px;
    padding: 0 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.btn-primary {
    background: #2563eb;
    color: #ffffff;
}

.btn-primary:hover {
    background: #1d4ed8;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #6b7280;
    color: #ffffff;
}

.btn-secondary:hover {
    background: #4b5563;
}


/* =========================
   TABLE
========================= */

.table-wrapper {
    width: 100%;
    overflow-x: auto;
}

.table {
    width: 100%;
    min-width: 800px;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 13px;
}

/* STT */
.table th:nth-child(1),
.table td:nth-child(1) {
    width: 7%;
    text-align: center;
}

/* Tên tác giả */
.table th:nth-child(2),
.table td:nth-child(2) {
    width: 21%;
}

/* Quốc tịch */
.table th:nth-child(3),
.table td:nth-child(3) {
    width: 15%;
}

/* Tiểu sử */
.table th:nth-child(4),
.table td:nth-child(4) {
    width: 32%;
}

/* Trạng thái */
.table th:nth-child(5),
.table td:nth-child(5) {
    width: 13%;
    text-align: center;
}

/* Thao tác */
.table th:nth-child(6),
.table td:nth-child(6) {
    width: 12%;
    text-align: center;
}

.table th {
    height: 46px;
    padding: 0 14px;
    background: #f9fafb;
    color: #374151;
    font-weight: 600;
    text-align: left;
    border-bottom: 1px solid #eef0f2;
    white-space: nowrap;
    box-sizing: border-box;
}

.table td {
    height: 68px;
    padding: 10px 14px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
    box-sizing: border-box;

    /* Giúp nội dung không phá vỡ kích thước cột */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.table tbody tr {
    transition: background 0.15s ease;
}

.table tbody tr:hover {
    background: #f9fafb;
}


/* =========================
   AUTHOR NAME
========================= */

.name-cell {
    font-weight: 600;
    color: #1f2937 !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


/* =========================
   BIO
========================= */

.desc-cell {
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


/* =========================
   ACTIONS
========================= */

.actions {
    white-space: nowrap !important;
    text-align: center !important;
}

.btn-link {
    padding: 0;
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.btn-edit {
    color: #2563eb;
    margin-right: 12px;
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


/* =========================
   STATUS BADGE
========================= */

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 105px;
    height: 26px;
    padding: 0 10px;
    border-radius: 13px;
    font-size: 12px;
    font-weight: 500;
    box-sizing: border-box;
}

.badge-success {
    background: #dcfce7;
    color: #16a34a;
}

.badge-danger {
    background: #fee2e2;
    color: #dc2626;
}


/* =========================
   EMPTY / LOADING
========================= */

.empty {
    height: 120px !important;
    padding: 30px !important;
    text-align: center !important;
    color: #9ca3af !important;
    font-size: 13px;
}


/* =========================
   PAGINATION
========================= */

.pagination {
    min-height: 68px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-sizing: border-box;
}

.page-btn {
    min-width: 36px;
    height: 34px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #374151;
    font-size: 13px;
    cursor: pointer;
    box-sizing: border-box;
}

.page-btn:hover:not(:disabled) {
    background: #f3f4f6;
}

.page-btn--active {
    background: #2563eb;
    border-color: #2563eb;
    color: #ffffff;
}

.page-btn--active:hover {
    background: #1d4ed8;
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}


/* =========================
   MODAL OVERLAY
========================= */

.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;
    background: rgba(0, 0, 0, 0.55);

    box-sizing: border-box;
}


/* =========================
   MODAL
========================= */

.modal {
    width: 560px;
    max-width: 100%;
    max-height: 90vh;

    padding: 24px;

    background: #ffffff;
    border-radius: 10px;

    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

    overflow-y: auto;
    box-sizing: border-box;
}

.modal-title {
    margin: 0 0 20px;

    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}


/* =========================
   FORM ERROR
========================= */

.form-error {
    margin: 0 0 16px;
    padding: 9px 12px;

    background: #fee2e2;
    color: #b91c1c;

    border-radius: 6px;

    font-size: 13px;
}


/* =========================
   FORM
========================= */

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;

    margin-bottom: 6px;

    color: #374151;
    font-size: 13px;
    font-weight: 500;
}

.form-input {
    width: 100%;
    min-height: 38px;

    padding: 8px 12px;

    border: 1px solid #d1d5db;
    border-radius: 6px;

    background: #ffffff;
    color: #1f2937;

    font-family: inherit;
    font-size: 14px;

    outline: none;
    box-sizing: border-box;
}

.form-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08);
}

textarea.form-input {
    min-height: 110px;
    resize: vertical;
    line-height: 1.5;
}

select.form-input {
    cursor: pointer;
}


/* =========================
   AVATAR PREVIEW
========================= */

.avatar-preview {
    width: 90px;
    height: 90px;

    margin-top: 10px;

    border: 1px solid #e5e7eb;
    border-radius: 50%;

    overflow: hidden;
    background: #f9fafb;
}

.avatar-preview img {
    width: 100%;
    height: 100%;

    display: block;

    object-fit: cover;
}


/* =========================
   MODAL ACTIONS
========================= */

.modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    gap: 10px;

    margin-top: 22px;
    padding-top: 16px;

    border-top: 1px solid #eef0f2;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {

    .toolbar {
        align-items: stretch;
        flex-direction: column;
    }

    .toolbar-filters {
        width: 100%;
    }

    .toolbar-actions {
        width: 100%;
        justify-content: flex-end;
    }

    .search-input {
        flex: 1;
        width: auto;
    }

    .filter-select {
        width: 190px;
    }
}


@media (max-width: 600px) {

    .page-title {
        font-size: 20px;
    }

    .card-header {
        padding: 0 14px;
    }

    .toolbar {
        padding: 12px 14px;
    }

    .toolbar-filters {
        flex-direction: column;
        align-items: stretch;
    }

    .search-input,
    .filter-select {
        width: 100%;
    }

    .toolbar-actions {
        justify-content: stretch;
    }

    .toolbar-actions .btn {
        width: 100%;
    }

    .pagination {
        padding: 14px 10px;
        overflow-x: auto;
    }

    .modal-overlay {
        padding: 10px;
    }

    .modal {
        padding: 18px;
    }
}
</style>