<script setup>
import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import userService from "@/services/user.service";

// ===============================
// DANH SÁCH ĐỊA CHỈ
// ===============================
const addresses = ref([]);

// ===============================
// MODAL
// ===============================
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

// ===============================
// FORM
// ===============================
const form = ref({
    receiverName: "",
    phone: "",
    province: "",
    district: "",
    detail: "",
    isDefault: false,
});


// =====================================================
// LẤY DANH SÁCH ĐỊA CHỈ
// =====================================================
const fetchAddresses = async () => {
    try {
        const response = await userService.getAddresses();

        console.log("ADDRESS RESPONSE:", response);

        if (response?.success) {
            addresses.value =
                response?.data?.addresses ||
                response?.data ||
                [];

            if (!Array.isArray(addresses.value)) {
                addresses.value = [];
            }

            console.log(
                "DANH SÁCH ĐỊA CHỈ:",
                addresses.value
            );
        } else {
            addresses.value = [];

            toast.error(
                response?.message ||
                "Không lấy được danh sách địa chỉ"
            );
        }

    } catch (error) {
        console.error(
            "LỖI LẤY ĐỊA CHỈ:",
            error
        );

        addresses.value = [];

        toast.error(
            error?.response?.data?.message ||
            error?.message ||
            "Không thể lấy danh sách địa chỉ"
        );
    }
};


// =====================================================
// RESET FORM
// =====================================================
const resetForm = () => {
    form.value = {
        receiverName: "",
        phone: "",
        province: "",
        district: "",
        detail: "",
        isDefault: false,
    };
};


// =====================================================
// MỞ MODAL THÊM
// =====================================================
const openAddModal = () => {
    isEditing.value = false;
    editingId.value = null;

    resetForm();

    showModal.value = true;
};


// =====================================================
// MỞ MODAL SỬA
// =====================================================
const openEditModal = (item) => {
    if (!item?._id) {
        toast.error("Không xác định được địa chỉ cần sửa");
        return;
    }

    isEditing.value = true;
    editingId.value = item._id;

    form.value = {
        receiverName: item.receiverName || "",
        phone: item.phone || "",
        province: item.province || "",
        district: item.district || "",
        detail: item.detail || "",
        isDefault: Boolean(item.isDefault),
    };

    showModal.value = true;
};


// =====================================================
// ĐÓNG MODAL
// =====================================================
const closeModal = () => {
    showModal.value = false;

    isEditing.value = false;
    editingId.value = null;

    resetForm();
};


// =====================================================
// VALIDATE
// =====================================================
const validateForm = () => {

    if (!form.value.receiverName.trim()) {
        toast.error("Vui lòng nhập họ và tên");
        return false;
    }

    if (!form.value.phone.trim()) {
        toast.error("Vui lòng nhập số điện thoại");
        return false;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(form.value.phone.trim())) {
        toast.error("Số điện thoại phải có 10 số");
        return false;
    }

    if (!form.value.province.trim()) {
        toast.error("Vui lòng nhập tỉnh/thành phố");
        return false;
    }

    if (!form.value.district.trim()) {
        toast.error("Vui lòng nhập quận/huyện");
        return false;
    }

    if (!form.value.detail.trim()) {
        toast.error("Vui lòng nhập địa chỉ chi tiết");
        return false;
    }

    return true;
};


// =====================================================
// DỮ LIỆU GỬI BACKEND
// =====================================================
const getFormData = () => {
    return {
        receiverName: form.value.receiverName.trim(),
        phone: form.value.phone.trim(),
        province: form.value.province.trim(),
        district: form.value.district.trim(),
        detail: form.value.detail.trim(),
        isDefault: Boolean(form.value.isDefault),
    };
};


// =====================================================
// THÊM / SỬA ĐỊA CHỈ
// =====================================================
const saveAddress = async () => {

    if (!validateForm()) {
        return;
    }

    try {

        const data = getFormData();

        console.log(
            "DATA ĐỊA CHỈ:",
            data
        );


        // =================================================
        // THÊM
        // =================================================
        if (!isEditing.value) {

            const response =
                await userService.addAddress(data);

            console.log(
                "ADD ADDRESS RESPONSE:",
                response
            );

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Thêm địa chỉ thất bại"
                );
                return;
            }

            toast.success(
                "Thêm địa chỉ thành công"
            );

            closeModal();

            await fetchAddresses();

            return;
        }


        // =================================================
        // SỬA
        // =================================================
        if (!editingId.value) {
            toast.error(
                "Không xác định được địa chỉ cần sửa"
            );
            return;
        }

        const response =
            await userService.updateAddress(
                editingId.value,
                data
            );

        console.log(
            "UPDATE ADDRESS RESPONSE:",
            response
        );

        if (!response?.success) {
            toast.error(
                response?.message ||
                "Cập nhật địa chỉ thất bại"
            );
            return;
        }

        toast.success(
            "Cập nhật địa chỉ thành công"
        );

        closeModal();

        await fetchAddresses();

    } catch (error) {

        console.error(
            "===== ADDRESS ERROR ====="
        );

        console.error(error);

        toast.error(
            error?.response?.data?.message ||
            error?.message ||
            "Có lỗi xảy ra khi lưu địa chỉ"
        );
    }
};


// =====================================================
// XÓA ĐỊA CHỈ
// =====================================================
const deleteAddress = async (id) => {

    if (!id) {
        toast.error(
            "Không xác định được địa chỉ cần xóa"
        );
        return;
    }

    const confirmDelete =
        window.confirm(
            "Bạn có chắc muốn xóa địa chỉ này không?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response =
            await userService.deleteAddress(id);

        console.log(
            "DELETE ADDRESS RESPONSE:",
            response
        );

        if (!response?.success) {
            toast.error(
                response?.message ||
                "Xóa địa chỉ thất bại"
            );
            return;
        }

        toast.success(
            "Xóa địa chỉ thành công"
        );

        await fetchAddresses();

    } catch (error) {

        console.error(
            "LỖI XÓA ĐỊA CHỈ:",
            error
        );

        toast.error(
            error?.response?.data?.message ||
            error?.message ||
            "Không thể xóa địa chỉ"
        );
    }
};


// =====================================================
// ĐẶT ĐỊA CHỈ MẶC ĐỊNH
// =====================================================
const setDefaultAddress = async (item) => {

    if (!item?._id) {
        toast.error(
            "Không xác định được địa chỉ"
        );
        return;
    }

    if (item.isDefault) {
        return;
    }

    try {

        const data = {
            receiverName:
                item.receiverName || "",

            phone:
                item.phone || "",

            province:
                item.province || "",

            district:
                item.district || "",

            detail:
                item.detail || "",

            isDefault: true,
        };

        const response =
            await userService.updateAddress(
                item._id,
                data
            );

        console.log(
            "SET DEFAULT RESPONSE:",
            response
        );

        if (!response?.success) {
            toast.error(
                response?.message ||
                "Không thể đặt địa chỉ mặc định"
            );
            return;
        }

        toast.success(
            "Đã đặt làm địa chỉ mặc định"
        );

        await fetchAddresses();

    } catch (error) {

        console.error(
            "LỖI ĐẶT MẶC ĐỊNH:",
            error
        );

        toast.error(
            error?.response?.data?.message ||
            error?.message ||
            "Không thể đặt địa chỉ mặc định"
        );
    }
};


// =====================================================
// FORMAT ĐỊA CHỈ
// =====================================================
const formatAddress = (item) => {

    if (!item) {
        return "Chưa có địa chỉ";
    }

    const parts = [
        item.detail,
        item.district,
        item.province,
    ].filter(Boolean);

    return parts.join(", ");
};


// =====================================================
// LOAD
// =====================================================
onMounted(() => {
    fetchAddresses();
});
</script>

<template>
    <div class="address-page">

        <!-- =========================
             TITLE + BUTTON
        ========================== -->
        <div class="address-header">

            <h2>Địa Chỉ Của Tôi</h2>

            <button class="add-address-btn" @click="openAddModal">
                <span>+</span>
                Thêm Địa Chỉ Mới
            </button>

        </div>


        <!-- =========================
             DANH SÁCH ĐỊA CHỈ
        ========================== -->
        <div class="address-list">

            <div v-for="item in addresses" :key="item._id" class="address-item">

                <div class="address-info">

                    <div class="info-row">
                        <span class="label">
                            Họ và tên:
                        </span>

                        <span class="value">
                            {{ item.receiverName }}
                        </span>
                    </div>


                    <div class="info-row">
                        <span class="label">
                            Số điện thoại:
                        </span>

                        <span class="value">
                            {{ item.phone }}
                        </span>
                    </div>


                    <div class="info-row">
                        <span class="label">
                            Địa chỉ:
                        </span>

                        <span class="value">
                            {{ formatAddress(item) }}
                        </span>
                    </div>


                    <span v-if="item.isDefault" class="default-badge">
                        Mặc định
                    </span>

                </div>


                <div class="address-actions">

                    <!-- SỬA -->
                    <button class="edit-btn" type="button" @click="openEditModal(item)">
                        Sửa
                    </button>


                    <!-- XÓA -->
                    <button class="delete-btn" type="button" @click="deleteAddress(item._id)">
                        Xóa
                    </button>


                    <!-- ĐẶT MẶC ĐỊNH -->
                    <button v-if="!item.isDefault" type="button" @click="setDefaultAddress(item)">
                        Đặt mặc định
                    </button>

                </div>

            </div>


            <!-- KHÔNG CÓ ĐỊA CHỈ -->
            <div v-if="addresses.length === 0" class="empty-address">

                <div class="empty-icon">
                    📍
                </div>

                <p>
                    Bạn chưa có địa chỉ giao hàng nào
                </p>

                <button class="add-address-btn empty-btn" type="button" @click="openAddModal">
                    + Thêm Địa Chỉ Mới
                </button>

            </div>

        </div>


        <!-- =========================
             MODAL
        ========================== -->
        <div v-if="showModal" class="modal-overlay">
            <div class="address-modal">

                <div class="modal-header">

                    <h3>
                        {{
                            isEditing
                                ? "Sửa địa chỉ"
                                : "Thêm địa chỉ mới"
                        }}
                    </h3>

                    <button type="button" class="close-btn" @click="closeModal">
                        ×
                    </button>

                </div>


                <div class="modal-body">

                    <div class="form-group">
                        <label>Họ và tên</label>

                        <input v-model="form.receiverName" type="text" placeholder="Nhập họ và tên" />
                    </div>


                    <div class="form-group">
                        <label>Số điện thoại</label>

                        <input v-model="form.phone" type="text" placeholder="Nhập số điện thoại" />
                    </div>


                    <div class="form-group">
                        <label>Tỉnh / Thành phố</label>

                        <input v-model="form.province" type="text" placeholder="Nhập tỉnh / thành phố" />
                    </div>


                    <div class="form-group">
                        <label>Quận / Huyện</label>

                        <input v-model="form.district" type="text" placeholder="Nhập quận / huyện" />
                    </div>


                    <div class="form-group">
                        <label>Địa chỉ chi tiết</label>

                        <input v-model="form.detail" type="text" placeholder="Số nhà, tên đường..." />
                    </div>


                    <div class="default-checkbox">

                        <label>
                            <input v-model="form.isDefault" type="checkbox" />

                            Đặt làm địa chỉ mặc định
                        </label>

                    </div>

                </div>


                <div class="modal-footer">

                    <button type="button" class="cancel-btn" @click="closeModal">
                        Hủy
                    </button>

                    <button type="button" class="save-btn" @click="saveAddress">
                        {{
                            isEditing
                                ? "Cập nhật"
                                : "Thêm địa chỉ"
                        }}
                    </button>

                </div>

            </div>
        </div>

    </div>
</template>


<style scoped>
/* ========================================
   CONTENT
======================================== */

.address-page {
    width: 100%;
    min-height: 0;
    background: #ffffff;
    box-sizing: border-box;
}
/* ========================================
   HEADER
======================================== */

.address-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 8px 14px;

    border-bottom: 1px solid #eeeeee;
}

.address-header h2 {
    margin: 0;

    font-size: 18px;
    font-weight: 600;

    color: #222222;
}


/* ========================================
   ADD BUTTON
======================================== */

.add-address-btn {
    border: none;

    background: #f4512c;
    color: #ffffff;

    padding: 10px 16px;

    border-radius: 2px;

    font-size: 13px;

    cursor: pointer;

    display: flex;
    align-items: center;
    gap: 6px;

    transition: 0.2s;
}

.add-address-btn:hover {
    background: #df3f1d;
}

.add-address-btn span {
    font-size: 18px;
    line-height: 12px;
}


/* ========================================
   ADDRESS LIST
======================================== */

.address-list {
    width: 100%;
    overflow: visible;
}


/* ========================================
   ADDRESS ITEM
======================================== */

.address-item {
    position: relative;

    min-height: 84px;

    padding: 18px 14px;

    border-bottom: 1px solid #eeeeee;

    display: flex;
    justify-content: space-between;

    box-sizing: border-box;
}


/* ========================================
   ADDRESS INFO
======================================== */

.address-info {
    flex: 1;
}

.info-row {
    display: flex;

    margin-bottom: 7px;

    font-size: 13px;
}

.info-row:last-child {
    margin-bottom: 0;
}

.label {
    width: 80px;

    color: #999999;

    flex-shrink: 0;
}

.value {
    color: #555555;

    word-break: break-word;
}


/* ========================================
   DEFAULT
======================================== */

.default-badge {
    display: inline-block;

    margin-top: 8px;

    padding: 3px 7px;

    border: 1px solid #15f700;

    color: #2afd00;

    font-size: 11px;
}


/* ========================================
   ACTION
======================================== */

.address-actions {
    width: 180px;
    min-width: 180px;

    display: flex;
    align-items: flex-start;
    justify-content: flex-end;

    gap: 18px;

    padding-top: 2px;
    margin-left: 20px;
}

.address-actions button {
    border: none;
    background: transparent;
    padding: 0;

    font-size: 12px;
    cursor: pointer;

    white-space: nowrap;
    color: #666;
}

.address-actions button:hover {
    color: #f4512c;
}

.edit-btn {
    color: #666666;
}

.edit-btn:hover {
    color: #f4512c;
}

.delete-btn {
    color: #666666;
}

.delete-btn:hover {
    color: #f4512c;
}


/* ========================================
   EMPTY
======================================== */

.empty-address {
    text-align: center;

    padding: 60px 20px;

    color: #999999;
}

.empty-icon {
    font-size: 42px;

    margin-bottom: 12px;
}

.empty-address p {
    margin: 0 0 20px;

    font-size: 14px;
}

.empty-btn {
    display: inline-flex;
}


/* ========================================
   MODAL OVERLAY
======================================== */

.modal-overlay {
    position: fixed;

    inset: 0;

    background: rgba(0, 0, 0, 0.45);

    display: flex;

    align-items: center;
    justify-content: center;

    z-index: 9999;
}


/* ========================================
   MODAL
======================================== */

.address-modal {
    width: 450px;

    max-width: calc(100% - 30px);

    background: #ffffff;

    border-radius: 6px;

    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);

    overflow: hidden;
}


/* ========================================
   MODAL HEADER
======================================== */

.modal-header {
    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 18px 20px;

    border-bottom: 1px solid #eeeeee;
}

.modal-header h3 {
    margin: 0;

    font-size: 17px;

    font-weight: 600;

    color: #222222;
}

.close-btn {
    border: none;

    background: transparent;

    font-size: 26px;

    color: #777777;

    cursor: pointer;

    line-height: 1;
}

.close-btn:hover {
    color: #000000;
}


/* ========================================
   FORM
======================================== */

.modal-body {
    padding: 20px;
}

.form-group {
    margin-bottom: 17px;
}

.form-group label {
    display: block;

    margin-bottom: 7px;

    font-size: 13px;

    color: #444444;
}

.form-group input,
.form-group textarea {
    width: 100%;

    box-sizing: border-box;

    padding: 10px 12px;

    border: 1px solid #dddddd;

    border-radius: 4px;

    outline: none;

    font-size: 13px;

    background: #ffffff;

    color: #222222;
}

.form-group textarea {
    resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: #f4512c;
}


/* ========================================
   DEFAULT CHECKBOX
======================================== */

.default-checkbox {
    display: flex;

    align-items: center;

    gap: 8px;

    font-size: 13px;

    color: #555555;

    cursor: pointer;
}

.default-checkbox input {
    width: 15px;
    height: 15px;

    cursor: pointer;
}


/* ========================================
   MODAL FOOTER
======================================== */

.modal-footer {
    display: flex;

    justify-content: flex-end;

    gap: 10px;

    padding: 15px 20px;

    border-top: 1px solid #eeeeee;
}

.modal-footer button {
    padding: 9px 20px;

    border-radius: 3px;

    font-size: 13px;

    cursor: pointer;
}

.cancel-btn {
    border: 1px solid #dddddd;

    background: #ffffff;

    color: #555555;
}

.cancel-btn:hover {
    background: #f5f5f5;
}

.save-btn {
    border: none;

    background: #f4512c;

    color: #ffffff;
}

.save-btn:hover {
    background: #df3f1d;
}


/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 600px) {

    .address-header {
        align-items: flex-start;

        gap: 15px;

        flex-direction: column;
    }

    .address-item {
        flex-direction: column;

        gap: 15px;
    }

    .address-actions {
        margin-left: 0;
    }
    

}
</style>