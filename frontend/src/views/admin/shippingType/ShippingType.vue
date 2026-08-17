<template>
    <!-- ===== TRANG QUẢN LÝ LOẠI SHIP ===== -->
    <div class="page">

        <h1 class="page-title">Quản lý loại ship</h1>

        <div class="card">

            <!-- Header -->
            <div class="card-header">
                <span class="tab-label">Danh sách loại ship</span>
            </div>

            <!-- Thanh công cụ -->
            <div class="toolbar">
                <div></div>

                <div class="toolbar-actions">
                    <button class="btn btn-primary" @click="handleOpenCreate">
                        + Thêm loại ship
                    </button>
                </div>
            </div>

            <!-- Bảng danh sách -->
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên loại ship</th>
                            <th>Giá tiền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>

                        <!-- Loading -->
                        <tr v-if="loading">
                            <td colspan="4" class="empty">
                                Đang tải...
                            </td>
                        </tr>

                        <!-- Danh sách loại ship -->
                        <tr v-else v-for="(shippingType, index) in shippingTypes" :key="shippingType._id">
                            <td>{{ index + 1 }}</td>

                            <td>
                                {{ shippingType.type }}
                            </td>

                            <td>
                                {{ formatPrice(shippingType.price) }}
                            </td>

                            <td class="actions">
                                <button class="btn-link btn-edit" @click="handleOpenEdit(shippingType)">
                                    Edit
                                </button>

                                <button class="btn-link btn-delete" @click="handleDelete(shippingType._id)">
                                    Delete
                                </button>
                            </td>
                        </tr>

                        <!-- Không có dữ liệu -->
                        <tr v-if="!loading && shippingTypes.length === 0">
                            <td colspan="4" class="empty">
                                Không tìm thấy loại ship nào
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>

        </div>

        <!-- ===== MODAL THÊM / SỬA LOẠI SHIP ===== -->
        <div v-if="showModal" class="modal-overlay" @click.self="handleCloseModal">
            <div class="modal">

                <h2 class="modal-title">
                    {{ isEditing ? "Chỉnh sửa loại ship" : "Thêm loại ship" }}
                </h2>

                <!-- Thông báo lỗi -->
                <p v-if="formError" class="form-error">
                    {{ formError }}
                </p>

                <!-- Tên loại ship -->
                <div class="form-group">
                    <label>Tên loại ship *</label>

                    <input v-model="form.type" type="text" class="form-input" placeholder="VD: Giao hàng tiêu chuẩn" />
                </div>

                <!-- Giá tiền -->
                <div class="form-group">
                    <label>Giá tiền *</label>

                    <input v-model.number="form.price" type="number" min="0" class="form-input"
                        placeholder="VD: 30000" />
                </div>

                <!-- Nút -->
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
import { ref, onMounted } from "vue";
import userService from "@/services/user.service";

// ===== STATE DANH SÁCH =====

const shippingTypes = ref([]);
const loading = ref(false);


// ===== STATE MODAL =====

const showModal = ref(false);
const isEditing = ref(false);
const editingShippingTypeId = ref(null);
const saving = ref(false);
const formError = ref("");


// ===== FORM =====

// Tạo form rỗng khi thêm mới
const emptyForm = () => ({
    type: "",
    price: null,
});

const form = ref(emptyForm());


// ===== FORMAT =====

// Format giá tiền theo định dạng Việt Nam
const formatPrice = (value) => {
    if (value == null) return "—";

    return Number(value).toLocaleString("vi-VN") + "đ";
};


// ===== LẤY DANH SÁCH =====

const handleFetchShippingTypes = async () => {
    loading.value = true;

    try {
        const res = await userService.getShippingTypes();

        const payload = res.data?.data ?? res.data ?? [];

        /*
         * Xử lý trường hợp backend trả:
         *
         * { success: true, data: [...] }
         *
         * hoặc:
         *
         * { success: true, data: { items: [...] } }
         */
        if (Array.isArray(payload)) {
            shippingTypes.value = payload;
        } else {
            shippingTypes.value = payload.items ?? [];
        }

    } catch (err) {
        console.error("Lỗi lấy danh sách loại ship:", err);

        shippingTypes.value = [];
    } finally {
        loading.value = false;
    }
};


// ===== MỞ MODAL THÊM =====

const handleOpenCreate = () => {
    isEditing.value = false;

    editingShippingTypeId.value = null;

    form.value = emptyForm();

    formError.value = "";

    showModal.value = true;
};


// ===== MỞ MODAL SỬA =====

const handleOpenEdit = (shippingType) => {
    isEditing.value = true;

    editingShippingTypeId.value = shippingType._id;

    form.value = {
        type: shippingType.type || "",
        price: shippingType.price ?? null,
    };

    formError.value = "";

    showModal.value = true;
};


// ===== ĐÓNG MODAL =====

const handleCloseModal = () => {
    showModal.value = false;

    formError.value = "";
};


// ===== TẠO DATA GỬI BACKEND =====

const buildPayload = () => {
    return {
        type: form.value.type.trim(),
        price: form.value.price,
    };
};


// ===== THÊM / SỬA =====

const handleSubmit = async () => {
    formError.value = "";

    // Kiểm tra tên loại ship
    if (!form.value.type.trim()) {
        formError.value = "Vui lòng nhập tên loại ship";
        return;
    }

    // Kiểm tra giá tiền
    if (
        form.value.price === null ||
        form.value.price === "" ||
        form.value.price === undefined
    ) {
        formError.value = "Vui lòng nhập giá tiền";
        return;
    }

    // Không cho phép giá âm
    if (Number(form.value.price) < 0) {
        formError.value = "Giá tiền không được nhỏ hơn 0";
        return;
    }

    saving.value = true;

    try {
        const payload = buildPayload();

        let res;

        // Nếu đang sửa
        if (isEditing.value) {
            res = await userService.updateShippingType(
                editingShippingTypeId.value,
                payload
            );
        }

        // Nếu đang thêm
        else {
            res = await userService.createShippingType(payload);
        }

        // Backend báo lỗi
        if (res.data.success === false) {
            formError.value =
                res.data.message || "Lưu loại ship thất bại";

            return;
        }

        // Đóng modal
        handleCloseModal();

        // Load lại danh sách
        await handleFetchShippingTypes();

    } catch (err) {
        console.error("Lỗi lưu loại ship:", err);

        formError.value =
            err.response?.data?.message ||
            "Lưu loại ship thất bại, vui lòng thử lại";

    } finally {
        saving.value = false;
    }
};


// ===== XÓA =====

const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa loại vận chuyển này?")) {
        return;
    }

    try {
        await userService.deleteShippingType(id);

        // Gọi lại API để lấy danh sách mới nhất
        await handleFetchShippingTypes();

    } catch (err) {
        console.error(
            "Lỗi xoá loại ship:",
            err.response?.data || err
        );

        alert(
            err.response?.data?.message ||
            "Xóa loại vận chuyển thất bại"
        );
    }
};


// ===== LIFECYCLE =====

// Khi mở trang thì lấy danh sách loại ship
onMounted(() => {
    handleFetchShippingTypes();
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

.toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}


/* ===== FORM ERROR ===== */

.form-error {
    background: #fee2e2;
    color: #b91c1c;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    margin: 0 0 14px;
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
</style>