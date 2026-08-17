<template>
  <!-- ===== TRANG QUẢN LÝ CATEGORY ===== -->
  <div class="page">

    ```
    <!-- Tiêu đề trang -->
    <h1 class="page-title">Quản lý danh mục</h1>

    <!-- Khung chứa bảng dữ liệu -->
    <div class="card">

      <!-- Nhãn tab phía trên bảng -->
      <div class="card-header">
        <span class="tab-label">Danh sách danh mục</span>
      </div>

      <!-- Thanh công cụ: tìm kiếm + thêm danh mục -->
      <div class="toolbar">

        <!-- Ô tìm kiếm theo tên danh mục -->
        <input v-model="searchName" type="text" class="search-input" placeholder="Tìm kiếm theo tên danh mục"
          @input="handleSearch" />

        <div class="toolbar-actions">
          <button class="btn btn-primary" @click="handleOpenCreate">
            + Thêm danh mục
          </button>
        </div>
      </div>

      <!-- ===== BẢNG DANH SÁCH CATEGORY ===== -->
      <div class="table-wrapper">
        <table class="table">

          <thead>
            <tr>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Slug</th>
              <th>Danh mục cha</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>

            <!-- Trạng thái đang tải -->
            <tr v-if="loading">
              <td colspan="8" class="empty">
                Đang tải...
              </td>
            </tr>

            <!-- Danh sách category -->
            <tr v-else v-for="(category, index) in paginatedCategories" :key="category._id">

              <!-- STT -->
              <td>
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>

              <!-- Ảnh -->
              <td>
                <img v-if="category.image" :src="category.image" :alt="category.name" class="row-thumb" />

                <span v-else>—</span>
              </td>

              <!-- Tên -->
              <td>
                {{ category.name }}
              </td>

              <!-- Slug -->
              <td>
                <span class="slug-text">
                  {{ category.slug }}
                </span>
              </td>

              <!-- Danh mục cha -->
              <td>
                {{ category.parentId?.name || "Danh mục gốc" }}
              </td>

              <!-- Mô tả -->
              <td class="desc-cell">
                {{ category.description || "—" }}
              </td>

              <!-- Trạng thái -->
              <td>
                <span :class="[
                  'badge',
                  category.status === 'active'
                    ? 'badge--active'
                    : 'badge--inactive'
                ]">
                  {{
                    category.status === "active"
                      ? "Hoạt động"
                      : "Ngừng hoạt động"
                  }}
                </span>
              </td>

              <!-- Thao tác -->
              <td class="actions">

                <button class="btn-link btn-edit" @click="handleOpenEdit(category)">
                  Edit
                </button>

                <button class="btn-link btn-delete" @click="handleDelete(category._id)">
                  Delete
                </button>

              </td>
            </tr>

            <!-- Không có dữ liệu -->
            <tr v-if="
              !loading &&
              paginatedCategories.length === 0
            ">
              <td colspan="8" class="empty">
                Không tìm thấy danh mục nào
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- ===== PHÂN TRANG ===== -->
      <div class="pagination">

        <!-- Quay lại -->
        <button class="page-btn" :disabled="currentPage === 1" @click="handleChangePage(currentPage - 1)">
          Quay lại
        </button>

        <!-- Các số trang -->
        <button v-for="page in totalPages" :key="page" :class="[
          'page-btn',
          {
            'page-btn--active':
              page === currentPage
          }
        ]" @click="handleChangePage(page)">
          {{ page }}
        </button>

        <!-- Tiếp -->
        <button class="page-btn" :disabled="currentPage === totalPages" @click="handleChangePage(currentPage + 1)">
          Tiếp
        </button>

      </div>
    </div>

    <!-- ================================================= -->
    <!-- MODAL SỬA CATEGORY -->
    <!-- ================================================= -->

    <div v-if="showEditModal" class="modal-overlay" @click.self="handleCloseEdit">
      <div class="modal">

        <h2 class="modal-title">
          Chỉnh sửa danh mục
        </h2>

        <!-- Thông báo lỗi -->
        <p v-if="editError" class="form-error">
          {{ editError }}
        </p>

        <!-- Tên danh mục -->
        <div class="form-group">
          <label>Tên danh mục</label>

          <input v-model="editForm.name" type="text" class="form-input" placeholder="Nhập tên danh mục" />
        </div>

        <!-- Danh mục cha -->
        <div class="form-group">
          <label>Danh mục cha</label>

          <select v-model="editForm.parentId" class="form-input">
            <option :value="null">
              Danh mục gốc
            </option>

            <option v-for="category in parentCategories" :key="category._id" :value="category._id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Mô tả -->
        <div class="form-group">
          <label>Mô tả</label>

          <textarea v-model="editForm.description" class="form-input" rows="3" placeholder="Mô tả danh mục"></textarea>
        </div>

        <!-- Ảnh -->
        <div class="form-group">
          <label>Ảnh danh mục</label>

          <input type="file" accept="image/*" class="form-input" @change="handleEditImageChange" />

          <img v-if="editPreviewUrl" :src="editPreviewUrl" alt="preview" class="image-preview" />
        </div>

        <!-- Trạng thái -->
        <div class="form-group">
          <label>Trạng thái</label>

          <select v-model="editForm.status" class="form-input">
            <option value="active">
              active
            </option>

            <option value="inactive">
              inactive
            </option>
          </select>
        </div>

        <!-- Nút -->
        <div class="modal-actions">

          <button class="btn btn-secondary" @click="handleCloseEdit">
            Huỷ
          </button>

          <button class="btn btn-primary" :disabled="editSaving" @click="handleSaveEdit">
            {{
              editSaving
                ? "Đang lưu..."
                : "Lưu"
            }}
          </button>

        </div>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- MODAL THÊM CATEGORY -->
    <!-- ================================================= -->

    <div v-if="showCreateModal" class="modal-overlay" @click.self="handleCloseCreate">
      <div class="modal">

        <h2 class="modal-title">
          Thêm danh mục
        </h2>

        <!-- Thông báo lỗi -->
        <p v-if="createError" class="form-error">
          {{ createError }}
        </p>

        <!-- Tên -->
        <div class="form-group">
          <label>Tên danh mục</label>

          <input v-model="createForm.name" type="text" class="form-input" placeholder="Nhập tên danh mục" />
        </div>

        <!-- Danh mục cha -->
        <div class="form-group">
          <label>Danh mục cha</label>

          <select v-model="createForm.parentId" class="form-input">
            <option :value="null">
              Danh mục gốc
            </option>

            <option v-for="category in parentCategories" :key="category._id" :value="category._id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Mô tả -->
        <div class="form-group">
          <label>Mô tả</label>

          <textarea v-model="createForm.description" class="form-input" rows="3"
            placeholder="Mô tả danh mục"></textarea>
        </div>

        <!-- Ảnh -->
        <div class="form-group">
          <label>Ảnh danh mục</label>

          <input type="file" accept="image/*" class="form-input" @change="handleCreateImageChange" />

          <img v-if="createPreviewUrl" :src="createPreviewUrl" alt="preview" class="image-preview" />
        </div>

        <!-- Trạng thái -->
        <div class="form-group">
          <label>Trạng thái</label>

          <select v-model="createForm.status" class="form-input">
            <option value="active">
              active
            </option>

            <option value="inactive">
              inactive
            </option>
          </select>
        </div>

        <!-- Nút -->
        <div class="modal-actions">

          <button class="btn btn-secondary" @click="handleCloseCreate">
            Huỷ
          </button>

          <button class="btn btn-primary" :disabled="creating" @click="handleCreateCategory">
            {{
              creating
                ? "Đang tạo..."
                : "Tạo mới"
            }}
          </button>

        </div>
      </div>
    </div>
    ```

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";


// =====================================================
// CẤU HÌNH
// =====================================================

// Base URL của backend
const API_BASE = "http://localhost:5000/api";

// Số category hiển thị trên mỗi trang
const pageSize = 6;


// =====================================================
// STATE
// =====================================================

// Danh sách category
const categories = ref([]);

const loading = ref(false);

// Từ khoá tìm kiếm
const searchName = ref("");

// Trang hiện tại
const currentPage = ref(1);


// =====================================================
// MODAL EDIT
// =====================================================

const showEditModal = ref(false);

const editSaving = ref(false);

const editError = ref("");

// Lưu ID category đang sửa
const editingCategoryId = ref(null);


// Form sửa
const editForm = ref({
  name: "",
  description: "",
  parentId: null,
  status: "active",
  imageFile: null,
});


// Preview ảnh sửa
const editPreviewUrl = ref("");


// =====================================================
// MODAL CREATE
// =====================================================

const showCreateModal = ref(false);

const creating = ref(false);

const createError = ref("");


// Form thêm
const createForm = ref({
  name: "",
  description: "",
  parentId: null,
  status: "active",
  imageFile: null,
});


// Preview ảnh thêm
const createPreviewUrl = ref("");


// Danh sách category dùng làm danh mục cha
const parentCategories = ref([]);


// =====================================================
// COMPUTED
// =====================================================

// Lọc category theo tên
const filteredCategories = computed(() => {

  const list = categories.value || [];

  if (!searchName.value) {
    return list;
  }

  const keyword =
    searchName.value
      .trim()
      .toLowerCase();

  return list.filter((category) =>
    (category.name || "")
      .toLowerCase()
      .includes(keyword)
  );
});


// Tổng số trang
const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(
      filteredCategories.value.length /
      pageSize
    )
  )
);


// Lấy category của trang hiện tại
const paginatedCategories = computed(() => {

  const start =
    (currentPage.value - 1) *
    pageSize;

  return filteredCategories.value.slice(
    start,
    start + pageSize
  );
});


// =====================================================
// HELPER
// =====================================================

// Lấy JWT từ localStorage
const getAuthHeaders = (
  extraHeaders = {}
) => ({
  headers: {
    Authorization:
      `Bearer ${localStorage.getItem("token")}`,
    ...extraHeaders,
  },
});


// =====================================================
// API - CATEGORY
// =====================================================

// Lấy toàn bộ category
const handleFetchCategories = async () => {

  loading.value = true;

  try {

    const res = await axios.get(
      `${API_BASE}/categories`,
      getAuthHeaders()
    );

    console.log(
      "Response /categories:",
      res.data
    );

    if (res.data.success) {

      /*
       * Backend có thể trả:
       *
       * {
       *   success: true,
       *   data: {
       *      categories: [...]
       *   }
       * }
       *
       * hoặc data trực tiếp là mảng.
       */
      categories.value =
        res.data.data?.categories ??
        res.data.data ??
        res.data.categories ??
        [];

    }

  } catch (err) {

    console.error(
      "Lỗi lấy danh sách category:",
      err
    );

    categories.value = [];

  } finally {

    loading.value = false;

  }
};


// =====================================================
// LẤY CATEGORY DÙNG LÀM DANH MỤC CHA
// =====================================================

const handleFetchParentCategories = async () => {

  try {

    const res = await axios.get(
      `${API_BASE}/categories`,
      getAuthHeaders()
    );

    if (res.data.success) {

      parentCategories.value =
        res.data.data?.categories ??
        res.data.data ??
        res.data.categories ??
        [];

    }

  } catch (err) {

    console.error(
      "Lỗi lấy danh mục cha:",
      err
    );

    parentCategories.value = [];

  }
};


// =====================================================
// DELETE / ẨN CATEGORY
// =====================================================

const handleDelete = async (
  categoryId
) => {

  // Xác nhận trước khi ẩn
  if (
    !confirm(
      "Bạn có chắc muốn ẩn danh mục này?"
    )
  ) {
    return;
  }

  try {

    const res = await axios.delete(
      `${API_BASE}/categories/${categoryId}`,
      getAuthHeaders()
    );

    if (res.data.success) {

      /*
       * Backend của mình đang xử lý
       * delete theo service.
       *
       * Sau khi xoá thành công,
       * loại category khỏi danh sách local.
       */
      categories.value =
        categories.value.filter(
          (category) =>
            category._id !== categoryId
        );

    }

  } catch (err) {

    console.error(
      "Lỗi xoá category:",
      err
    );

    alert(
      err.response?.data?.message ||
      "Không thể xoá danh mục"
    );

  }
};


// =====================================================
// UPDATE CATEGORY
// =====================================================

const handleSaveEdit = async () => {

  editError.value = "";

  // Kiểm tra tên
  if (
    !editForm.value.name.trim()
  ) {

    editError.value =
      "Vui lòng nhập tên danh mục";

    return;
  }

  editSaving.value = true;

  try {

    /*
     * Backend Category hiện tại
     * nhận JSON.
     *
     * File ảnh mới chưa được gửi lên
     * vì model đang lưu image là String.
     */
    const payload = {
      name:
        editForm.value.name,

      description:
        editForm.value.description,

      parentId:
        editForm.value.parentId || null,

      status:
        editForm.value.status,

      image:
        editForm.value.image ||
        "",
    };

    const res = await axios.put(
      `${API_BASE}/categories/${editingCategoryId.value}`,
      payload,
      getAuthHeaders()
    );

    if (res.data.success) {

      // Cập nhật category ngay trong danh sách
      const index =
        categories.value.findIndex(
          (category) =>
            category._id ===
            editingCategoryId.value
        );

      if (index !== -1) {

        categories.value[index] = {
          ...categories.value[index],
          ...res.data.data,
        };

      }

      handleCloseEdit();

    } else {

      editError.value =
        res.data.message ||
        "Cập nhật danh mục thất bại";

    }

  } catch (err) {

    console.error(
      "Lỗi cập nhật category:",
      err
    );

    editError.value =
      err.response?.data?.message ||
      "Cập nhật danh mục thất bại, vui lòng thử lại";

  } finally {

    editSaving.value = false;

  }
};


// =====================================================
// SEARCH
// =====================================================

// Reset về trang 1 khi tìm kiếm
const handleSearch = () => {

  currentPage.value = 1;

};


// =====================================================
// PAGINATION
// =====================================================

// Chuyển trang
const handleChangePage = (
  page
) => {

  if (
    page < 1 ||
    page > totalPages.value
  ) {
    return;
  }

  currentPage.value = page;

};


// =====================================================
// OPEN EDIT
// =====================================================

// Mở modal sửa
const handleOpenEdit = async (
  category
) => {

  editingCategoryId.value =
    category._id;

  editForm.value = {

    name:
      category.name || "",

    description:
      category.description || "",

    parentId:
      category.parentId?._id ||
      category.parentId ||
      null,

    status:
      category.status || "active",

    imageFile: null,

    image:
      category.image || "",

  };

  editPreviewUrl.value =
    category.image || "";

  editError.value = "";

  // Lấy danh sách category cha
  await handleFetchParentCategories();

  showEditModal.value = true;

};


// Đóng modal edit
const handleCloseEdit = () => {

  showEditModal.value = false;

  editingCategoryId.value = null;

  editPreviewUrl.value = "";

  editError.value = "";

};


// Khi chọn ảnh edit
const handleEditImageChange = (
  e
) => {

  const file =
    e.target.files[0];

  if (!file) {
    return;
  }

  editForm.value.imageFile =
    file;

  editPreviewUrl.value =
    URL.createObjectURL(file);

};


// =====================================================
// CREATE
// =====================================================

// Mở modal thêm
const handleOpenCreate = async () => {

  createForm.value = {

    name: "",

    description: "",

    parentId: null,

    status: "active",

    imageFile: null,

    image: "",

  };

  createPreviewUrl.value = "";

  createError.value = "";

  // Lấy danh sách category cha
  await handleFetchParentCategories();

  showCreateModal.value = true;

};


// Đóng modal thêm
const handleCloseCreate = () => {

  showCreateModal.value = false;

  createError.value = "";

  createPreviewUrl.value = "";

};


// Khi chọn ảnh
const handleCreateImageChange = (
  e
) => {

  const file =
    e.target.files[0];

  if (!file) {
    return;
  }

  createForm.value.imageFile =
    file;

  createPreviewUrl.value =
    URL.createObjectURL(file);

};


// Tạo category
const handleCreateCategory = async () => {

  createError.value = "";

  // Kiểm tra tên
  if (
    !createForm.value.name.trim()
  ) {

    createError.value =
      "Vui lòng nhập tên danh mục";

    return;
  }

  creating.value = true;

  try {

    /*
     * Backend Category hiện tại
     * nhận JSON.
     */
    const payload = {

      name:
        createForm.value.name,

      description:
        createForm.value.description,

      parentId:
        createForm.value.parentId ||
        null,

      status:
        createForm.value.status,

      image:
        createForm.value.image ||
        "",

    };

    const res = await axios.post(
      `${API_BASE}/categories`,
      payload,
      getAuthHeaders()
    );

    if (res.data.success) {

      handleCloseCreate();

      // Load lại danh sách
      await handleFetchCategories();

      // Quay về trang đầu
      currentPage.value = 1;

    } else {

      createError.value =
        res.data.message ||
        "Tạo danh mục thất bại";

    }

  } catch (err) {

    console.error(
      "Lỗi tạo category:",
      err
    );

    createError.value =
      err.response?.data?.message ||
      "Tạo danh mục thất bại, vui lòng thử lại";

  } finally {

    creating.value = false;

  }

};


// =====================================================
// LIFECYCLE
// =====================================================

// Lấy danh sách category khi component được mở
onMounted(() => {

  handleFetchCategories();

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


/* ===== EDIT / DELETE ===== */

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
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.slug-text {
  color: #6b7280;
  font-size: 12px;
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


/* ===== BADGE ===== */

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

.image-preview {
  margin-top: 10px;
  width: 100%;
  max-height: 140px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eef0f2;
}


/* ===== MODAL ACTIONS ===== */

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
