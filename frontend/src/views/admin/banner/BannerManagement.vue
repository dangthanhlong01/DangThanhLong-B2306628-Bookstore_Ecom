<template>
  <!-- ===== TRANG QUẢN LÝ BANNER ===== -->
  <div class="page">

    <!-- Tiêu đề trang -->
    <h1 class="page-title">Quản lý banner</h1>

    <!-- Khung chứa bảng dữ liệu -->
    <div class="card">

      <!-- Nhãn tab phía trên bảng -->
      <div class="card-header">
        <span class="tab-label">Danh sách banner</span>
      </div>

      <!-- Thanh công cụ: tìm kiếm + thêm banner -->
      <div class="toolbar">
        <!-- Ô tìm kiếm theo tên banner -->
        <input v-model="searchName" type="text" class="search-input" placeholder="Tìm kiếm theo tên banner"
          @input="handleSearch" />

        <div class="toolbar-actions">
          <button class="btn btn-primary" @click="handleOpenCreate">
            + Thêm banner
          </button>
        </div>
      </div>

      <!-- Bảng danh sách banner -->
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <!-- Trạng thái đang tải -->
            <tr v-if="loading">
              <td colspan="6" class="empty">Đang tải...</td>
            </tr>

            <!--
              Lặp qua danh sách banner hiện tại trên trang
              index + 1 để đánh số thứ tự bắt đầu từ 1
            -->
            <tr v-else v-for="(banner, index) in paginatedBanners" :key="banner._id">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>
                <img v-if="banner.image" :src="banner.image" :alt="banner.name" class="row-thumb" />
                <span v-else>—</span>
              </td>
              <td>{{ banner.name }}</td>
              <td class="desc-cell">{{ banner.description || "—" }}</td>
              <!-- Badge màu khác nhau tuỳ theo trạng thái -->
              <td>
                <span :class="['badge', banner.statusId === 'active' ? 'badge--active' : 'badge--inactive']">
                  {{ banner.statusId === "active" ? "Hoạt động" : "Ngừng hoạt động" }}
                </span>
              </td>
              <!-- Nút thao tác: Edit và Delete -->
              <td class="actions">
                <button class="btn-link btn-edit" @click="handleOpenEdit(banner)">
                  Edit
                </button>
                <button class="btn-link btn-delete" @click="handleDelete(banner._id)">
                  Delete
                </button>
              </td>
            </tr>

            <!-- Hiển thị khi không có dữ liệu -->
            <tr v-if="!loading && paginatedBanners.length === 0">
              <td colspan="6" class="empty">Không tìm thấy banner nào</td>
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
        <button class="page-btn" :disabled="currentPage === totalPages" @click="handleChangePage(currentPage + 1)">
          Tiếp
        </button>
      </div>
    </div>

    <!-- ===== MODAL SỬA BANNER ===== -->
    <!--
      Hiện modal khi showEditModal = true
      @click.self để đóng khi click ra ngoài modal
    -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <h2 class="modal-title">Chỉnh sửa banner</h2>

        <p v-if="editError" class="form-error">{{ editError }}</p>

        <div class="form-group">
          <label>Tên banner</label>
          <input v-model="editForm.name" type="text" class="form-input" />
        </div>

        <div class="form-group">
          <label>Mô tả</label>
          <textarea v-model="editForm.description" class="form-input" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Ảnh banner</label>
          <input type="file" accept="image/*" class="form-input" @change="handleEditImageChange" />
          <img v-if="editPreviewUrl" :src="editPreviewUrl" alt="preview" class="image-preview" />
        </div>

        <div class="form-group">
          <label>Trạng thái</label>
          <!-- Dropdown chọn trạng thái: active / inactive -->
          <select v-model="editForm.statusId" class="form-input">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>

        <!-- Nút hành động trong modal -->
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="handleCloseEdit">Huỷ</button>
          <button class="btn btn-primary" :disabled="editSaving" @click="handleSaveEdit">
            {{ editSaving ? "Đang lưu..." : "Lưu" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL THÊM BANNER ===== -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <h2 class="modal-title">Thêm banner</h2>

        <p v-if="createError" class="form-error">{{ createError }}</p>

        <div class="form-group">
          <label>Tên banner</label>
          <input v-model="createForm.name" type="text" class="form-input" placeholder="Nhập tên banner" />
        </div>

        <div class="form-group">
          <label>Mô tả</label>
          <textarea v-model="createForm.description" class="form-input" rows="3" placeholder="Mô tả ngắn"></textarea>
        </div>

        <div class="form-group">
          <label>Ảnh banner</label>
          <input type="file" accept="image/*" class="form-input" @change="handleCreateImageChange" />
          <img v-if="createPreviewUrl" :src="createPreviewUrl" alt="preview" class="image-preview" />
        </div>

        <div class="form-group">
          <label>Trạng thái</label>
          <select v-model="createForm.statusId" class="form-input">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="handleCloseCreate">Huỷ</button>
          <button class="btn btn-primary" :disabled="creating" @click="handleCreateBanner">
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
// Danh sách toàn bộ banner lấy từ API
const banners = ref([]);
const loading = ref(false);

// Từ khoá tìm kiếm theo tên banner
const searchName = ref("");

// Trang đang xem (bắt đầu từ 1)
const currentPage = ref(1);

// Trạng thái hiển thị modal chỉnh sửa
const showEditModal = ref(false);
const editSaving = ref(false);
const editError = ref("");

// Trạng thái hiển thị modal thêm banner
const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref("");

// Lưu _id của banner đang được chỉnh sửa (để gọi API PUT)
const editingBannerId = ref(null);

// Dữ liệu trong form chỉnh sửa
const editForm = ref({
  name: "",
  description: "",
  statusId: "active",
  imageFile: null,
});
const editPreviewUrl = ref("");

// Dữ liệu trong form thêm mới
const createForm = ref({
  name: "",
  description: "",
  statusId: "active",
  imageFile: null,
});
const createPreviewUrl = ref("");

// ===== COMPUTED =====

// Lọc danh sách banner theo tên đã nhập
// banners.value luôn được đảm bảo là mảng (xem handleFetchBanners), nhưng vẫn fallback [] cho chắc
const filteredBanners = computed(() => {
  const list = banners.value || [];
  if (!searchName.value) return list;
  const keyword = searchName.value.trim().toLowerCase();
  return list.filter((b) => (b.name || "").toLowerCase().includes(keyword));
});

// Tổng số trang dựa trên danh sách đã lọc
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBanners.value.length / pageSize))
);

// Lấy đúng phần tử của trang hiện tại
const paginatedBanners = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredBanners.value.slice(start, start + pageSize);
});

// ===== HELPERS =====

// Lấy token từ localStorage để gắn vào header Authorization
const getAuthHeaders = (extraHeaders = {}) => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    ...extraHeaders,
  },
});

// Chuyển form (name, description, statusId, imageFile) thành FormData để gửi kèm ảnh
const buildFormData = (form) => {
  const formData = new FormData();
  formData.append("name", form.name);
  formData.append("description", form.description || "");
  formData.append("statusId", form.statusId);
  if (form.imageFile) {
    formData.append("image", form.imageFile);
  }
  return formData;
};

// ===== API CALLS =====

// Gọi API lấy toàn bộ danh sách banner (admin only)
const handleFetchBanners = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_BASE}/banners`, getAuthHeaders());
    console.log("Response /banners:", res.data); // TẠM: xem cấu trúc thật để chỉnh lại đúng field
    if (res.data.success) {
      // Fallback nhiều khả năng cấu trúc, tránh banners.value bị undefined
      banners.value =
        res.data.data?.banners ??
        res.data.data ??
        res.data.banners ??
        [];
    }
  } catch (err) {
    console.error("Lỗi lấy danh sách banner:", err);
    banners.value = [];
  } finally {
    loading.value = false;
  }
};

// Gọi API xoá banner theo id
const handleDelete = async (bannerId) => {
  // Xác nhận trước khi xoá
  if (!confirm("Bạn có chắc muốn xoá banner này?")) return;
  try {
    const res = await axios.delete(
      `${API_BASE}/banners/${bannerId}`,
      getAuthHeaders()
    );
    if (res.data.success) {
      // Xoá khỏi danh sách local ngay, không cần gọi lại API
      banners.value = banners.value.filter((b) => b._id !== bannerId);
    }
  } catch (err) {
    console.error("Lỗi xoá banner:", err);
  }
};

// Gọi API cập nhật thông tin banner
const handleSaveEdit = async () => {
  editError.value = "";

  if (!editForm.value.name.trim()) {
    editError.value = "Vui lòng nhập tên banner";
    return;
  }

  editSaving.value = true;
  try {
    const res = await axios.put(
      `${API_BASE}/banners/${editingBannerId.value}`,
      buildFormData(editForm.value),
      getAuthHeaders({ "Content-Type": "multipart/form-data" })
    );
    if (res.data.success) {
      // Cập nhật lại banner trong danh sách local mà không cần gọi lại toàn bộ
      const idx = banners.value.findIndex((b) => b._id === editingBannerId.value);
      if (idx !== -1) {
        banners.value[idx] = { ...banners.value[idx], ...res.data.data };
      }
      handleCloseEdit();
    } else {
      editError.value = res.data.message || "Cập nhật banner thất bại";
    }
  } catch (err) {
    console.error("Lỗi cập nhật banner:", err);
    editError.value = err.response?.data?.message || "Cập nhật banner thất bại, vui lòng thử lại";
  } finally {
    editSaving.value = false;
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

// Mở modal chỉnh sửa và điền sẵn dữ liệu của banner được chọn
const handleOpenEdit = (banner) => {
  editingBannerId.value = banner._id;
  editForm.value = {
    name: banner.name || "",
    description: banner.description || "",
    statusId: banner.statusId || "active",
    imageFile: null,
  };
  editPreviewUrl.value = banner.image || "";
  editError.value = "";
  showEditModal.value = true;
};

// Đóng modal và reset trạng thái
const handleCloseEdit = () => {
  showEditModal.value = false;
  editingBannerId.value = null;
  editPreviewUrl.value = "";
};

// Khi người dùng chọn ảnh mới trong modal edit
const handleEditImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  editForm.value.imageFile = file;
  editPreviewUrl.value = URL.createObjectURL(file);
};

// Mở modal thêm banner, reset form về mặc định
const handleOpenCreate = () => {
  createForm.value = {
    name: "",
    description: "",
    statusId: "active",
    imageFile: null,
  };
  createPreviewUrl.value = "";
  createError.value = "";
  showCreateModal.value = true;
};

const handleCloseCreate = () => {
  showCreateModal.value = false;
  createError.value = "";
  createPreviewUrl.value = "";
};

// Khi người dùng chọn ảnh trong modal thêm mới
const handleCreateImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  createForm.value.imageFile = file;
  createPreviewUrl.value = URL.createObjectURL(file);
};

// Gọi API tạo mới banner
const handleCreateBanner = async () => {
  createError.value = "";

  if (!createForm.value.name.trim()) {
    createError.value = "Vui lòng nhập tên banner";
    return;
  }

  creating.value = true;
  try {
    const res = await axios.post(
      `${API_BASE}/banners`,
      buildFormData(createForm.value),
      getAuthHeaders({ "Content-Type": "multipart/form-data" })
    );
    if (res.data.success) {
      handleCloseCreate();
      // Tải lại danh sách để thấy banner mới ngay
      await handleFetchBanners();
      currentPage.value = 1;
    } else {
      createError.value = res.data.message || "Tạo banner thất bại";
    }
  } catch (err) {
    createError.value =
      err.response?.data?.message || "Tạo banner thất bại, vui lòng thử lại";
  } finally {
    creating.value = false;
  }
};

// ===== LIFECYCLE =====
// Gọi API lấy danh sách banner ngay khi component được mount
onMounted(() => {
  handleFetchBanners();
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

.row-thumb {
  width: 64px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.desc-cell {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  width: 440px;
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
  font-family: inherit;
}

.form-input:focus {
  border-color: #2563eb;
}

.image-preview {
  margin-top: 10px;
  width: 100%;
  max-height: 140px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eef0f2;
}

/* Các nút hành động dưới modal */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>