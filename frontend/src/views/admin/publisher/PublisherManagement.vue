
<template>
    <div class="page">
        <h1 class="page-title">Quản lý nhà xuất bản</h1>

        <div class="card">
            <div class="card-header">
                <span class="tab-label">Danh sách nhà xuất bản</span>
            </div>

            <div class="toolbar">
                <div class="toolbar-filters">
                    <input
                        v-model="search"
                        type="text"
                        class="search-input"
                        placeholder="Tìm theo tên nhà xuất bản"
                        @input="handleSearch"
                    />

                    <select
                        v-model="status"
                        class="filter-select"
                        @change="handleFilterChange"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Ngừng hoạt động</option>
                    </select>
                </div>

                <div class="toolbar-actions">
                    <button class="btn btn-primary" @click="handleOpenCreate">
                        + Thêm nhà xuất bản
                    </button>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Logo</th>
                            <th>Tên nhà xuất bản</th>
                            <th>Địa chỉ</th>
                            <th>Số điện thoại</th>
                            <th>Email</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-if="loading">
                            <td colspan="8" class="empty">
                                Đang tải...
                            </td>
                        </tr>

                        <tr
                            v-else
                            v-for="(publisher, index) in publishers"
                            :key="publisher._id"
                        >
                            <td>
                                {{ (page - 1) * limit + index + 1 }}
                            </td>

                            <td>
                                <img
                                    v-if="publisher.logo"
                                    :src="publisher.logo"
                                    :alt="publisher.name"
                                    class="row-logo"
                                />
                                <span v-else>—</span>
                            </td>

                            <td class="name-cell">
                                {{ publisher.name }}
                            </td>

                            <td class="desc-cell">
                                {{ publisher.address || "—" }}
                            </td>

                            <td>
                                {{ publisher.phone || "—" }}
                            </td>

                            <td>
                                {{ publisher.email || "—" }}
                            </td>

                            <td>
                                <span
                                    :class="[
                                        'badge',
                                        statusBadgeClass(publisher.status)
                                    ]"
                                >
                                    {{ statusLabel(publisher.status) }}
                                </span>
                            </td>

                            <td class="actions">
                                <button
                                    class="btn-link btn-edit"
                                    @click="handleOpenEdit(publisher)"
                                >
                                    Edit
                                </button>

                                <button
                                    class="btn-link btn-delete"
                                    @click="handleDelete(publisher._id)"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>

                        <tr v-if="!loading && publishers.length === 0">
                            <td colspan="8" class="empty">
                                Không tìm thấy nhà xuất bản nào
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                <button
                    class="page-btn"
                    :disabled="page === 1"
                    @click="handleChangePage(page - 1)"
                >
                    Quay lại
                </button>

                <button
                    v-for="p in totalPages"
                    :key="p"
                    :class="[
                        'page-btn',
                        { 'page-btn--active': p === page }
                    ]"
                    @click="handleChangePage(p)"
                >
                    {{ p }}
                </button>

                <button
                    class="page-btn"
                    :disabled="page === totalPages"
                    @click="handleChangePage(page + 1)"
                >
                    Tiếp
                </button>
            </div>
        </div>

        <!-- MODAL -->
        <div
            v-if="showModal"
            class="modal-overlay"
            @click.self="handleCloseModal"
        >
            <div class="modal">
                <h2 class="modal-title">
                    {{ isEditing ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản" }}
                </h2>

                <p v-if="formError" class="form-error">
                    {{ formError }}
                </p>

                <div class="form-group">
                    <label>Tên nhà xuất bản *</label>
                    <input
                        v-model="form.name"
                        type="text"
                        class="form-input"
                        placeholder="Nhập tên nhà xuất bản"
                    />
                </div>

                <div class="form-group">
                    <label>Logo</label>

                    <input
                        type="file"
                        accept="image/*"
                        class="form-input"
                        @change="handleLogoChange"
                    />

                    <div v-if="logoPreview" class="logo-preview">
                        <img :src="logoPreview" alt="Logo nhà xuất bản" />

                        <button
                            type="button"
                            class="image-remove-btn"
                            @click="removeLogo"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Địa chỉ</label>
                    <input
                        v-model="form.address"
                        type="text"
                        class="form-input"
                        placeholder="Nhập địa chỉ"
                    />
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Số điện thoại</label>
                        <input
                            v-model="form.phone"
                            type="text"
                            class="form-input"
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <input
                            v-model="form.email"
                            type="email"
                            class="form-input"
                            placeholder="Nhập email"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea
                        v-model="form.description"
                        class="form-input"
                        rows="4"
                        placeholder="Nhập mô tả"
                    ></textarea>
                </div>

                <div class="form-group">
                    <label>Trạng thái</label>

                    <select
                        v-model="form.status"
                        class="form-input"
                    >
                        <option value="active">
                            Đang hoạt động
                        </option>

                        <option value="inactive">
                            Ngừng hoạt động
                        </option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button
                        class="btn btn-secondary"
                        @click="handleCloseModal"
                    >
                        Huỷ
                    </button>

                    <button
                        class="btn btn-primary"
                        :disabled="saving"
                        @click="handleSubmit"
                    >
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
import { ref, onMounted } from "vue";
import userService from "@/services/user.service";

// ===== STATE =====

const publishers = ref([]);
const loading = ref(false);

const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(1);

const search = ref("");
const status = ref("");

let searchDebounceTimer = null;

// ===== MODAL =====

const showModal = ref(false);
const isEditing = ref(false);
const editingPublisherId = ref(null);

const saving = ref(false);
const formError = ref("");

const emptyForm = () => ({
    name: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    status: "active",
    removeLogo: false,  
});

const form = ref(emptyForm());

const logoFile = ref(null);
const logoPreview = ref("");

// ===== FORMAT =====

const statusLabel = (value) => {
    if (value === "active") {
        return "Đang hoạt động";
    }

    return "Ngừng hoạt động";
};

const statusBadgeClass = (value) => {
    if (value === "active") {
        return "badge--active";
    }

    return "badge--inactive";
};

// ===== GET PUBLISHERS =====

const handleFetchPublishers = async () => {
    loading.value = true;

    try {
        const res = await userService.getPublishers({
            page: page.value,
            limit: limit.value,
            search: search.value || undefined,
            status: status.value || undefined,
        });

        const payload = res.data?.data ?? res.data ?? {};

        publishers.value = payload.publishers ?? [];
        total.value = payload.total ?? 0;
        totalPages.value = Math.max(
            1,
            payload.totalPages ?? 1
        );

        page.value = payload.page ?? page.value;
    } catch (error) {
        console.error(
            "Lỗi lấy danh sách nhà xuất bản:",
            error
        );

        publishers.value = [];
    } finally {
        loading.value = false;
    }
};

// ===== SEARCH =====

const handleSearch = () => {
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(() => {
        page.value = 1;
        handleFetchPublishers();
    }, 400);
};

// ===== FILTER =====

const handleFilterChange = () => {
    page.value = 1;
    handleFetchPublishers();
};

// ===== PAGINATION =====

const handleChangePage = (newPage) => {
    if (
        newPage < 1 ||
        newPage > totalPages.value
    ) {
        return;
    }

    page.value = newPage;

    handleFetchPublishers();
};

// ===== OPEN CREATE =====

const handleOpenCreate = () => {
    isEditing.value = false;
    editingPublisherId.value = null;

    form.value = emptyForm();

    logoFile.value = null;
    logoPreview.value = "";

    formError.value = "";

    showModal.value = true;
};

// ===== OPEN EDIT =====

const handleOpenEdit = (publisher) => {
    isEditing.value = true;
    editingPublisherId.value = publisher._id;

    form.value = {
        name: publisher.name || "",
        logo: publisher.logo || "",
        address: publisher.address || "",
        phone: publisher.phone || "",
        email: publisher.email || "",
        description: publisher.description || "",
        status: publisher.status || "active",
    };

    logoFile.value = null;
    logoPreview.value = publisher.logo || "";

    formError.value = "";

    showModal.value = true;
};

// ===== CLOSE MODAL =====

const handleCloseModal = () => {
    showModal.value = false;

    logoFile.value = null;
    logoPreview.value = "";

    formError.value = "";
};

// ===== IMAGE =====

const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    logoFile.value = file;

    if (logoPreview.value) {
        URL.revokeObjectURL(logoPreview.value);
    }

    logoPreview.value = URL.createObjectURL(file);
};

const removeLogo = () => {
    logoFile.value = null;
    logoPreview.value = "";
    form.value.logo = "";
    form.value.removeLogo = true;
};

// ===== CREATE / UPDATE =====

const handleSubmit = async () => {
    formError.value = "";

    if (!form.value.name.trim()) {
        formError.value = "Vui lòng nhập tên nhà xuất bản";
        return;
    }

    saving.value = true;

    try {
        // Tạo FormData để gửi cả text + file ảnh
        const formData = new FormData();

        formData.append("name", form.value.name);
        formData.append("address", form.value.address || "");
        formData.append("phone", form.value.phone || "");
        formData.append("email", form.value.email || "");
        formData.append("description", form.value.description || "");
        formData.append("status", form.value.status);
        formData.append("removeLogo", form.value.removeLogo);

        // logoFile là File người dùng chọn
        // "image" phải trùng với upload.single("image") ở backend
        if (logoFile.value) {
            formData.append("image", logoFile.value);
        }
        let res;

        if (isEditing.value) {
            res = await userService.updatePublisher(
                editingPublisherId.value,
                formData
            );
        } else {
            res = await userService.createPublisher(formData);
        }

        if (res.data?.success === false) {
            formError.value =
                res.data.message || "Lưu nhà xuất bản thất bại";
            return;
        }

        handleCloseModal();

        await handleFetchPublishers();

    } catch (error) {
        console.error("Lỗi lưu nhà xuất bản:", error);

        formError.value =
            error.response?.data?.message ||
            "Lưu nhà xuất bản thất bại, vui lòng thử lại";
    } finally {
        saving.value = false;
    }
};

// ===== DELETE / HIDE =====

const handleDelete = async (id) => {
    if (
        !confirm(
            "Bạn có chắc muốn ẩn nhà xuất bản này?"
        )
    ) {
        return;
    }

    try {
        const res =
            await userService.deletePublisher(id);

        if (res.data?.success !== false) {
            if (
                publishers.value.length === 1 &&
                page.value > 1
            ) {
                page.value -= 1;
            }

            await handleFetchPublishers();
        }
    } catch (error) {
        console.error(
            "Lỗi ẩn nhà xuất bản:",
            error
        );
    }
};

// ===== LIFECYCLE =====

onMounted(() => {
    handleFetchPublishers();
});
</script>

<style scoped>
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

.search-input {
    width: 280px;
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
.filter-select:focus,
.form-input:focus {
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

.row-logo {
    width: 52px;
    height: 52px;
    object-fit: contain;
    border-radius: 6px;
    border: 1px solid #eef0f2;
    display: block;
}

.name-cell {
    min-width: 180px;
    font-weight: 500;
}

.desc-cell {
    max-width: 220px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    width: 560px;
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

.form-error {
    background: #fee2e2;
    color: #b91c1c;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    margin: 0 0 14px;
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

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 12px;
}

.logo-preview {
    position: relative;
    width: 100px;
    height: 100px;
    margin-top: 10px;
}

.logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 6px;
    border: 1px solid #eef0f2;
}

.image-remove-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: #dc2626;
    color: #fff;
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
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

    .search-input {
        width: 100%;
    }

    .toolbar-filters {
        width: 100%;
    }
}
</style>
