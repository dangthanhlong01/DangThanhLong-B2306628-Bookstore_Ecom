<template>
    <!-- ===== TRANG QUẢN LÝ SÁCH ===== -->
    <div class="page">

        <h1 class="page-title">Quản lý sách</h1>

        <div class="card">
            <div class="card-header">
                <span class="tab-label">Danh sách sách</span>
            </div>

            <!-- Thanh công cụ: tìm kiếm + bộ lọc + thêm sách -->
            <div class="toolbar">
                <div class="toolbar-filters">
                    <input v-model="searchTitle" type="text" class="search-input"
                        placeholder="Tìm theo tên sách hoặc ISBN" @input="handleSearch" />

                    <select v-model="filterCategoryId" class="filter-select" @change="handleFilterChange">
                        <option value="">Tất cả thể loại</option>
                        <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
                    </select>

                    <select v-model="filterPublisherId" class="filter-select" @change="handleFilterChange">
                        <option value="">Tất cả NXB</option>
                        <option v-for="p in publishers" :key="p._id" :value="p._id">{{ p.name }}</option>
                    </select>

                    <select v-model="filterStatus" class="filter-select" @change="handleFilterChange">
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang bán</option>
                        <option value="inactive">Ngừng bán</option>
                        <option value="out_of_stock">Hết hàng</option>
                    </select>
                </div>

                <div class="toolbar-actions">
                    <button class="btn btn-primary" @click="handleOpenCreate">+ Thêm sách</button>
                </div>
            </div>

            <!-- Bảng danh sách sách -->
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ảnh</th>
                            <th>Tên sách</th>
                            <th>Tác giả</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="8" class="empty">Đang tải...</td>
                        </tr>

                        <tr v-else v-for="(book, index) in books" :key="book._id">
                            <td>{{ (page - 1) * limit + index + 1 }}</td>
                            <td>
                                <img v-if="book.images && book.images[0]" :src="book.images[0]" :alt="book.title"
                                    class="row-thumb" />
                                <span v-else>—</span>
                            </td>
                            <td class="title-cell">{{ book.title }}</td>
                            <td class="desc-cell">{{ formatAuthors(book.authorIds) }}</td>
                            <td>{{ formatPrice(book.price) }}</td>
                            <td>{{ book.stock }}</td>
                            <td>
                                <span :class="['badge', statusBadgeClass(book.status)]">
                                    {{ statusLabel(book.status) }}
                                </span>
                            </td>
                            <td class="actions">
                                <button class="btn-link btn-edit" @click="handleOpenEdit(book)">Edit</button>
                                <button class="btn-link btn-delete" @click="handleDelete(book._id)">Delete</button>
                            </td>
                        </tr>

                        <tr v-if="!loading && books.length === 0">
                            <td colspan="8" class="empty">Không tìm thấy sách nào</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Phân trang (server-side, dựa theo totalPages backend trả về) -->
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

        <!-- ===== MODAL SỬA / THÊM SÁCH (dùng chung, chỉ khác tiêu đề + hành vi submit) ===== -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal modal--wide">
                <h2 class="modal-title">{{ isEditing ? "Chỉnh sửa sách" : "Thêm sách" }}</h2>

                <p v-if="formError" class="form-error">{{ formError }}</p>

                <div class="form-grid">
                    <!-- Cột trái: thông tin chính -->
                    <div class="form-col">
                        <div class="form-group">
                            <label>Tên sách *</label>
                            <input v-model="form.title" type="text" class="form-input" placeholder="Nhập tên sách" />
                        </div>

                        <div class="form-group">
                            <label>ISBN</label>
                            <input v-model="form.isbn" type="text" class="form-input"
                                placeholder="VD: 978-604-1-xxxxx" />
                        </div>

                        <div class="form-group">
                            <label>Mô tả</label>
                            <textarea v-model="form.description" class="form-input" rows="3"></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Giá bán *</label>
                                <input v-model.number="form.price" type="number" min="0" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Giá khuyến mãi</label>
                                <input v-model.number="form.discountPrice" type="number" min="0" class="form-input" />
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Tồn kho</label>
                                <input v-model.number="form.stock" type="number" min="0" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Trạng thái</label>
                                <select v-model="form.status" class="form-input">
                                    <option value="active">Đang bán</option>
                                    <option value="inactive">Ngừng bán</option>
                                    <option value="out_of_stock">Hết hàng</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Số trang</label>
                                <input v-model.number="form.pageCount" type="number" min="0" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Năm xuất bản</label>
                                <input v-model.number="form.publishYear" type="number" class="form-input" />
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Ngôn ngữ</label>
                                <input v-model="form.language" type="text" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Hình thức bìa</label>
                                <select v-model="form.format" class="form-input">
                                    <option value="bìa mềm">Bìa mềm</option>
                                    <option value="bìa cứng">Bìa cứng</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Khối lượng (gram)</label>
                                <input v-model.number="form.weight" type="number" min="0" class="form-input" />
                            </div>
                            <div class="form-group form-group--checkbox">
                                <label class="checkbox-label">
                                    <input v-model="form.isFeatured" type="checkbox" />
                                    Sản phẩm nổi bật
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Cột phải: quan hệ + ảnh -->
                    <div class="form-col">
                        <div class="form-group">
                            <label>Tác giả (giữ Ctrl/Cmd để chọn nhiều)</label>
                            <select v-model="form.authorIds" multiple class="form-input select-multi">
                                <option v-for="a in authors" :key="a._id" :value="a._id">{{ a.name }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Nhà xuất bản</label>
                            <select v-model="form.publisherId" class="form-input">
                                <option value="">— Chọn NXB —</option>
                                <option v-for="p in publishers" :key="p._id" :value="p._id">{{ p.name }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Thể loại (giữ Ctrl/Cmd để chọn nhiều)</label>
                            <select v-model="form.categoryIds" multiple class="form-input select-multi">
                                <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Ảnh sách (có thể chọn nhiều)</label>
                            <input type="file" accept="image/*" multiple class="form-input"
                                @change="handleImageChange" />

                            <div v-if="existingImageUrls.length || newImagePreviews.length" class="image-preview-grid">
                                <!-- Ảnh đã có sẵn (chỉ khi edit) -->
                                <div v-for="(url, i) in existingImageUrls" :key="'existing-' + i"
                                    class="image-preview-item">
                                    <img :src="url" alt="ảnh sách" />
                                    <button type="button" class="image-remove-btn"
                                        @click="removeExistingImage(i)">×</button>
                                </div>
                                <!-- Ảnh mới vừa chọn -->
                                <div v-for="(url, i) in newImagePreviews" :key="'new-' + i" class="image-preview-item">
                                    <img :src="url" alt="ảnh mới" />
                                    <button type="button" class="image-remove-btn" @click="removeNewImage(i)">×</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
import axios from "axios";  

// ===== CẤU HÌNH =====
// Base URL của backend, đổi lại khi deploy
const API_BASE = "http://localhost:5000/api";

// ===== STATE: DANH SÁCH SÁCH (phân trang phía server) =====
const books = ref([]);
const loading = ref(false);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(1);

// Tìm kiếm + bộ lọc
const searchTitle = ref("");
const filterCategoryId = ref("");
const filterPublisherId = ref("");
const filterStatus = ref("");
let searchDebounceTimer = null;

// ===== STATE: DỮ LIỆU DÙNG CHO DROPDOWN =====
// NOTE: giả định các API này đã tồn tại theo chuẩn REST:
//   GET /api/authors    -> { success, data: [{ _id, name }, ...] }
//   GET /api/publishers -> { success, data: [{ _id, name }, ...] }
//   GET /api/categories -> { success, data: [{ _id, name }, ...] }
// Nếu response thực tế khác (vd bọc thêm trong data.items), chỉnh lại phần fallback bên dưới.
const authors = ref([]);
const publishers = ref([]);
const categories = ref([]);

// ===== STATE: MODAL THÊM/SỬA =====
const showModal = ref(false);
const isEditing = ref(false);
const editingBookId = ref(null);
const saving = ref(false);
const formError = ref("");

const emptyForm = () => ({
    title: "",
    isbn: "",
    description: "",
    authorIds: [],
    publisherId: "",
    categoryIds: [],
    price: 0,
    discountPrice: 0,
    stock: 0,
    pageCount: 0,
    publishYear: new Date().getFullYear(),
    language: "Tiếng Việt",
    format: "bìa mềm",
    weight: 0,
    isFeatured: false,
    status: "active",
});

const form = ref(emptyForm());

// Ảnh: tách riêng ảnh cũ (đã có URL, chỉ khi edit) và ảnh mới (file vừa chọn)
const existingImageUrls = ref([]); // URL string[]
const newImageFiles = ref([]); // File[]
const newImagePreviews = ref([]); // object URL string[]

// ===== HELPERS =====

const getAuthHeaders = (extraHeaders = {}) => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...extraHeaders,
    },
});

const formatPrice = (value) => {
    if (value == null) return "—";
    return Number(value).toLocaleString("vi-VN") + "đ";
};

const formatAuthors = (authorIds) => {
    if (!authorIds || authorIds.length === 0) return "—";
    return authorIds.map((a) => (typeof a === "object" ? a.name : a)).join(", ");
};

const statusLabel = (status) => {
    if (status === "active") return "Đang bán";
    if (status === "out_of_stock") return "Hết hàng";
    return "Ngừng bán";
};

const statusBadgeClass = (status) => {
    if (status === "active") return "badge--active";
    if (status === "out_of_stock") return "badge--warning";
    return "badge--inactive";
};

// ===== API CALLS: DANH SÁCH SÁCH =====

const handleFetchBooks = async () => {
    loading.value = true;
    try {
        const res = await axios.get(`${API_BASE}/books`, {
            ...getAuthHeaders(),
            params: {
                page: page.value,
                limit: limit.value,
                search: searchTitle.value || undefined,
                categoryId: filterCategoryId.value || undefined,
                publisherId: filterPublisherId.value || undefined,
                status: filterStatus.value || undefined,
            },
        });

        // Fallback nhiều khả năng cấu trúc response, tránh crash nếu backend đặt tên khác
        const payload = res.data?.data ?? res.data ?? {};
        books.value = payload.books ?? [];
        total.value = payload.total ?? 0;
        totalPages.value = Math.max(1, payload.totalPages ?? 1);
        page.value = payload.page ?? page.value;
    } catch (err) {
        console.error("Lỗi lấy danh sách sách:", err);
        books.value = [];
    } finally {
        loading.value = false;
    }
};

// Lấy dữ liệu tác giả / NXB / thể loại để đổ vào dropdown (gọi 1 lần khi mount)
const handleFetchLookups = async () => {
    try {
        const [categoryRes, publisherRes, authorRes] = await Promise.all([
            axios.get(`${API_BASE}/categories`, getAuthHeaders()),
            axios.get(`${API_BASE}/publishers`, getAuthHeaders()),
            axios.get(`${API_BASE}/authors`, getAuthHeaders())
        ]);

        categories.value =
            categoryRes.data?.data?.categories
            ?? categoryRes.data?.data
            ?? [];

        publishers.value =
            publisherRes.data?.data?.publishers
            ?? publisherRes.data?.data
            ?? [];

        authors.value =
            authorRes.data?.data?.authors
            ?? authorRes.data?.data
            ?? [];

    } catch (err) {
        console.error("Lỗi lấy danh mục/nhà xuất bản:", err);
    }
};

// ===== UI HANDLERS: TÌM KIẾM / LỌC / PHÂN TRANG =====

const handleSearch = () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        page.value = 1;
        handleFetchBooks();
    }, 400);
};

const handleFilterChange = () => {
    page.value = 1;
    handleFetchBooks();
};

const handleChangePage = (p) => {
    if (p < 1 || p > totalPages.value) return;
    page.value = p;
    handleFetchBooks();
};

// ===== UI HANDLERS: MODAL =====

const resetImageState = () => {
    newImagePreviews.value.forEach((url) => URL.revokeObjectURL(url));
    existingImageUrls.value = [];
    newImageFiles.value = [];
    newImagePreviews.value = [];
};

const handleOpenCreate = () => {
    isEditing.value = false;
    editingBookId.value = null;
    form.value = emptyForm();
    resetImageState();
    formError.value = "";
    showModal.value = true;
};

const handleOpenEdit = (book) => {
    isEditing.value = true;
    editingBookId.value = book._id;
    form.value = {
        title: book.title || "",
        isbn: book.isbn || "",
        description: book.description || "",
        authorIds: (book.authorIds || []).map((a) => (typeof a === "object" ? a._id : a)),
        publisherId: book.publisherId ? (typeof book.publisherId === "object" ? book.publisherId._id : book.publisherId) : "",
        categoryIds: (book.categoryIds || []).map((c) => (typeof c === "object" ? c._id : c)),
        price: book.price || 0,
        discountPrice: book.discountPrice || 0,
        stock: book.stock || 0,
        pageCount: book.pageCount || 0,
        publishYear: book.publishYear || new Date().getFullYear(),
        language: book.language || "Tiếng Việt",
        format: book.format || "bìa mềm",
        weight: book.weight || 0,
        isFeatured: !!book.isFeatured,
        status: book.status || "active",
    };
    resetImageState();
    existingImageUrls.value = [...(book.images || [])];
    formError.value = "";
    showModal.value = true;
};

const handleCloseModal = () => {
    showModal.value = false;
    resetImageState();
    formError.value = "";
};

const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
        newImageFiles.value.push(file);
        newImagePreviews.value.push(URL.createObjectURL(file));
    });
    // reset input để có thể chọn lại cùng 1 file nếu cần
    e.target.value = "";
};

const removeExistingImage = (index) => {
    existingImageUrls.value.splice(index, 1);
};

const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews.value[index]);
    newImagePreviews.value.splice(index, 1);
    newImageFiles.value.splice(index, 1);
};

// ===== API CALLS: TẠO / SỬA / XOÁ =====

const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", form.value.title);
    fd.append("isbn", form.value.isbn || "");
    fd.append("description", form.value.description || "");
    fd.append("publisherId", form.value.publisherId || "");
    fd.append("price", form.value.price);
    fd.append("discountPrice", form.value.discountPrice || 0);
    fd.append("stock", form.value.stock || 0);
    fd.append("pageCount", form.value.pageCount || 0);
    fd.append("publishYear", form.value.publishYear || "");
    fd.append("language", form.value.language || "");
    fd.append("format", form.value.format);
    fd.append("weight", form.value.weight || 0);
    fd.append("isFeatured", form.value.isFeatured);
    fd.append("status", form.value.status);

    // Mảng: append nhiều lần cùng key, backend đọc thành req.body.authorIds (array)
    form.value.authorIds.forEach((id) => fd.append("authorIds", id));
    form.value.categoryIds.forEach((id) => fd.append("categoryIds", id));

    // Ảnh mới
    newImageFiles.value.forEach((file) => fd.append("images", file));

    // Khi edit: gửi kèm danh sách ảnh cũ còn giữ lại, để backend biết ảnh nào bị xoá
    if (isEditing.value) {
        fd.append("existingImages", JSON.stringify(existingImageUrls.value));
    }

    return fd;
};

const handleSubmit = async () => {
    formError.value = "";

    console.log("FORM:", form.value);
    console.log("TITLE:", form.value.title);
    console.log("TITLE TYPE:", typeof form.value.title);

    if (!form.value.title || !form.value.title.trim()) {
        formError.value = "Vui lòng nhập tên sách";
        return;
    }
    if (!form.value.price || form.value.price < 0) {
        formError.value = "Vui lòng nhập giá sách hợp lệ";
        return;
    }

    saving.value = true;
    try {
        const formData = buildFormData();
        const res = isEditing.value
            ? await axios.put(
                `${API_BASE}/books/${editingBookId.value}`,
                formData,
                getAuthHeaders({ "Content-Type": "multipart/form-data" })
            )
            : await axios.post(
                `${API_BASE}/books`,
                formData,
                getAuthHeaders({ "Content-Type": "multipart/form-data" })
            );

        if (res.data.success === false) {
            formError.value = res.data.message || "Lưu sách thất bại";
            return;
        }

        handleCloseModal();
        await handleFetchBooks();
        if (!isEditing.value) page.value = 1;
    } catch (err) {
        console.error("Lỗi lưu sách:", err);
        formError.value = err.response?.data?.message || "Lưu sách thất bại, vui lòng thử lại";
    } finally {
        saving.value = false;
    }
};

const handleDelete = async (bookId) => {
    if (!confirm("Bạn có chắc muốn xoá sách này?")) return;
    try {
        const res = await axios.delete(`${API_BASE}/books/${bookId}`, getAuthHeaders());
        if (res.data.success !== false) {
            // Nếu xoá phần tử cuối cùng của trang cuối, lùi về trang trước
            if (books.value.length === 1 && page.value > 1) {
                page.value -= 1;
            }
            await handleFetchBooks();
        }
    } catch (err) {
        console.error("Lỗi xoá sách:", err);
    }
};

// ===== LIFECYCLE =====
onMounted(() => {
    handleFetchBooks();
    handleFetchLookups();
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

.row-thumb {
    width: 48px;
    height: 64px;
    object-fit: cover;
    border-radius: 4px;
    display: block;
}

.title-cell {
    max-width: 260px;
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
    width: 440px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid #eef0f2;
}

.modal--wide {
    width: 720px;
    max-width: 100%;
}

.modal-title {
    font-size: 17px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20px;
}

/* ===== FORM ===== */
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;
}

.form-col {
    display: flex;
    flex-direction: column;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 12px;
}

.form-group {
    margin-bottom: 14px;
}

.form-group--checkbox {
    display: flex;
    align-items: flex-end;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    color: #374151;
    font-weight: 500;
    cursor: pointer;
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

.select-multi {
    min-height: 110px;
}

.image-preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.image-preview-item {
    position: relative;
    width: 72px;
    height: 96px;
}

.image-preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

    .form-grid,
    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>