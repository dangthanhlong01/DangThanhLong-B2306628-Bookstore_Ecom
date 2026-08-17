<script setup>
import {
    ref,
    onMounted,
    onUnmounted,
    watch
} from "vue";

import { useRouter } from "vue-router";

import userService from "../../services/user.service";
import { useUserStore } from "@/stores/user";


// =====================================================
// ROUTER
// =====================================================

const router = useRouter();


// =====================================================
// USER STORE
// =====================================================

const userStore = useUserStore();


// =====================================================
// STATE
// =====================================================

// Danh sách sách
const books = ref([]);

// Danh sách danh mục
const categories = ref([]);

// Trạng thái loading danh sách sách
const loading = ref(false);

// Tìm kiếm
const search = ref("");

// Danh mục đang chọn
const selectedCategory = ref("");

// Sắp xếp
const sortBy = ref("");

// Số sản phẩm trên trang
const limit = ref(6);

// Trang hiện tại
const page = ref(1);

// Tổng số sản phẩm
const total = ref(0);

// Tổng số trang
const totalPages = ref(1);


// =====================================================
// TRẠNG THÁI THÊM GIỎ HÀNG
// =====================================================

// ID của sách đang được thêm vào giỏ
const addingBookId = ref(null);

// Danh sách ID sách vừa thêm thành công
const addedBookIds = ref([]);


// =====================================================
// TOAST
// =====================================================

// Nội dung thông báo
const toastMessage = ref("");

// Loại thông báo
const toastType = ref("success");

// Timer tự động đóng toast
let toastTimer = null;

// Timer để đưa nút "Đã thêm" về trạng thái bình thường
let addedBookTimer = null;

// Timer tìm kiếm
let searchTimer = null;


// =====================================================
// HIỂN THỊ TOAST
// =====================================================

const showToast = (message, type = "success") => {

    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    toastMessage.value = message;
    toastType.value = type;

    toastTimer = setTimeout(() => {

        toastMessage.value = "";

        toastTimer = null;

    }, 2500);
};


// =====================================================
// ĐÓNG TOAST
// =====================================================

const closeToast = () => {

    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    toastMessage.value = "";
};


// =====================================================
// FORMAT GIÁ
// =====================================================

const formatPrice = (value) => {

    return (
        Number(value || 0)
            .toLocaleString("vi-VN") + "đ"
    );
};


// =====================================================
// LẤY USER ID
// =====================================================

const getUserId = () => {

    const user = userStore.user;

    if (!user) {
        return null;
    }

    if (user._id) {
        return user._id;
    }

    if (user.id) {
        return user.id;
    }

    return null;
};


// =====================================================
// ĐI ĐẾN TRANG CHI TIẾT SÁCH
// =====================================================

const goToBookDetail = (book) => {

    console.log(
        "========== CLICK SÁCH =========="
    );

    console.log(
        "BOOK:",
        book
    );

    console.log(
        "BOOK ID:",
        book?._id
    );

    // Không có book
    if (!book) {

        console.error(
            "Không tìm thấy thông tin sách"
        );

        return;
    }


    // Không có ID
    if (!book._id) {

        console.error(
            "Sách không có _id:",
            book
        );

        showToast(
            "Không xác định được sách cần xem",
            "error"
        );

        return;
    }


    try {

        // =================================================
        // QUAN TRỌNG:
        //
        // Route BookDetail của m đang yêu cầu:
        //
        // /book/:id
        //
        // Vì vậy phải truyền id.
        //
        // KHÔNG truyền slug.
        // =================================================

        router.push({
            name: "BookDetail",

            params: {
                id: String(book._id)
            }
        });

    } catch (error) {

        console.error(
            "Lỗi chuyển sang trang chi tiết sách:",
            error
        );

    }
};


// =====================================================
// LẤY DANH SÁCH SÁCH
// =====================================================

const fetchBooks = async () => {

    loading.value = true;

    try {

        const params = {

            page: page.value,

            limit: limit.value,

            search:
                search.value || undefined,

            categoryId:
                selectedCategory.value ||
                undefined,

            sort:
                sortBy.value || undefined,

            status: "active",
        };


        console.log(
            "BOOK PARAMS:",
            params
        );


        const res =
            await userService.getBooks(params);


        console.log(
            "BOOK API:",
            res
        );


        if (res?.success) {

            books.value =
                res.data?.books || [];


            total.value =
                res.data?.total || 0;


            totalPages.value =
                res.data?.totalPages || 1;


            page.value =
                res.data?.page ||
                page.value;

        } else {

            books.value = [];

            total.value = 0;

            totalPages.value = 1;

        }

    } catch (error) {

        console.error(
            "Lỗi lấy danh sách sách:",
            error
        );

        books.value = [];

        total.value = 0;

        totalPages.value = 1;

    } finally {

        loading.value = false;

    }
};


// =====================================================
// LẤY DANH MỤC
// =====================================================

const fetchCategories = async () => {

    try {

        const res =
            await userService.getCategories();


        console.log(
            "CATEGORY API:",
            res
        );


        if (res?.success) {

            categories.value =
                res.data?.categories ||
                res.data ||
                [];

        } else {

            categories.value = [];

        }

    } catch (error) {

        console.error(
            "Lỗi lấy danh mục:",
            error
        );

        categories.value = [];

    }
};


// =====================================================
// CHỌN DANH MỤC
// =====================================================

const handleCategoryChange = (categoryId) => {

    selectedCategory.value = categoryId;

    page.value = 1;

    fetchBooks();
};


// =====================================================
// SẮP XẾP
// =====================================================

const handleSortChange = () => {

    page.value = 1;

    fetchBooks();
};


// =====================================================
// ĐỔI SỐ SẢN PHẨM HIỂN THỊ
// =====================================================

const handleLimitChange = () => {

    page.value = 1;

    fetchBooks();
};


// =====================================================
// TÌM KIẾM
// =====================================================

watch(search, () => {

    if (searchTimer) {
        clearTimeout(searchTimer);
    }


    searchTimer = setTimeout(() => {

        page.value = 1;

        fetchBooks();

    }, 400);

});


// =====================================================
// PHÂN TRANG
// =====================================================

const handlePageChange = (newPage) => {

    if (
        newPage < 1 ||
        newPage > totalPages.value
    ) {
        return;
    }


    page.value = newPage;

    fetchBooks();


    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};


// =====================================================
// THÊM SÁCH VÀO GIỎ HÀNG
// =====================================================

const handleAddToCart = async (book) => {

    const userId = getUserId();


    console.log(
        "========== THÊM GIỎ HÀNG =========="
    );

    console.log(
        "USER:",
        userStore.user
    );

    console.log(
        "USER ID:",
        userId
    );

    console.log(
        "BOOK:",
        book
    );


    // =================================================
    // CHƯA ĐĂNG NHẬP
    // =================================================

    if (!userId) {

        showToast(
            "Vui lòng đăng nhập trước khi thêm vào giỏ hàng",
            "error"
        );

        return;
    }


    // =================================================
    // KIỂM TRA BOOK
    // =================================================

    if (!book?._id) {

        showToast(
            "Không xác định được sản phẩm",
            "error"
        );

        return;
    }


    // =================================================
    // ĐANG THÊM SẢN PHẨM
    // =================================================

    if (
        addingBookId.value ===
        book._id
    ) {

        return;
    }


    try {

        addingBookId.value =
            book._id;


        // =================================================
        // DATA GỬI BACKEND
        // =================================================

        const requestData = {

            type: "ADD_NEW",

            userId: userId,

            bookId: book._id,

            quantity: 1,

        };


        console.log(
            "DATA GỬI BACKEND:",
            requestData
        );


        // =================================================
        // GỌI API
        // =================================================

        const response =
            await userService.addToCart(
                requestData
            );


        console.log(
            "========== ADD CART RESPONSE =========="
        );

        console.log(
            "RESPONSE:",
            response
        );


        // =================================================
        // THÊM THÀNH CÔNG
        // =================================================

        if (
            response?.success === true
        ) {

            // Báo Header cập nhật giỏ hàng
            window.dispatchEvent(
                new Event("cart-updated")
            );


            // Lưu ID sách đã thêm
            if (
                !addedBookIds.value.includes(
                    book._id
                )
            ) {

                addedBookIds.value.push(
                    book._id
                );

            }


            // Toast thành công
            showToast(
                `"${book.title}" đã được thêm vào giỏ hàng`,
                "success"
            );


            // =================================================
            // RESET TIMER CŨ
            // =================================================

            if (addedBookTimer) {

                clearTimeout(
                    addedBookTimer
                );

            }


            // =================================================
            // SAU 1.5 GIÂY RESET NÚT
            // =================================================

            addedBookTimer =
                setTimeout(() => {

                    addedBookIds.value =
                        addedBookIds.value.filter(
                            (id) =>
                                id !== book._id
                        );

                    addedBookTimer = null;

                }, 1500);


        } else {

            showToast(

                response?.message ||
                "Không thể thêm sách vào giỏ hàng",

                "error"

            );

        }


    } catch (error) {

        console.error(
            "========== LỖI THÊM GIỎ HÀNG =========="
        );

        console.error(
            "ERROR:",
            error
        );


        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Có lỗi xảy ra khi thêm vào giỏ hàng";


        showToast(
            message,
            "error"
        );


    } finally {

        addingBookId.value = null;

    }
};


// =====================================================
// LIFECYCLE
// =====================================================

onMounted(() => {

    fetchBooks();

    fetchCategories();

    window.scrollTo(0, 0);

});


// =====================================================
// HỦY TIMER
// =====================================================

onUnmounted(() => {

    if (searchTimer) {
        clearTimeout(searchTimer);
    }


    if (toastTimer) {
        clearTimeout(toastTimer);
    }


    if (addedBookTimer) {
        clearTimeout(addedBookTimer);
    }

});
</script>


<template>

    <div class="shop-page">

        <div class="shop-container">

            <!-- =================================================
                 SIDEBAR
            ================================================== -->

            <aside class="shop-sidebar">

                <div class="sidebar-box">

                    <h3 class="sidebar-title">
                        Các danh mục
                    </h3>

                    <div class="sidebar-line"></div>


                    <!-- TẤT CẢ -->

                    <label class="category-item" :class="{
                        active:
                            selectedCategory === ''
                    }">

                        <input type="radio" name="category" :checked="selectedCategory === ''
                            " @change="
                                handleCategoryChange('')
                                " />

                        <span>
                            Tất cả
                        </span>

                    </label>


                    <!-- DANH MỤC -->

                    <label v-for="category in categories" :key="category._id" class="category-item" :class="{
                        active:
                            selectedCategory ===
                            category._id
                    }">

                        <input type="radio" name="category" :value="category._id" :checked="selectedCategory ===
                            category._id
                            " @change="
                                handleCategoryChange(
                                    category._id
                                )
                                " />

                        <span>
                            {{ category.name }}
                        </span>

                    </label>

                </div>

            </aside>


            <!-- =================================================
                 KHU VỰC SẢN PHẨM
            ================================================== -->

            <main class="shop-content">


                <!-- =================================================
                     TOOLBAR
                ================================================== -->

                <div class="shop-toolbar">

                    <!-- SẮP XẾP -->

                    <select v-model="sortBy" class="toolbar-select" @change="handleSortChange">

                        <option value="">
                            Sắp xếp
                        </option>

                        <option value="price_asc">
                            Giá tăng dần
                        </option>

                        <option value="price_desc">
                            Giá giảm dần
                        </option>

                        <option value="-createdAt">
                            Mới nhất
                        </option>

                        <option value="-sold">
                            Bán chạy
                        </option>

                    </select>


                    <!-- SỐ SẢN PHẨM -->

                    <select v-model.number="limit" class="toolbar-select toolbar-limit" @change="handleLimitChange">

                        <option :value="6">
                            Hiển thị 6
                        </option>

                        <option :value="8">
                            Hiển thị 8
                        </option>

                        <option :value="12">
                            Hiển thị 12
                        </option>

                        <option :value="16">
                            Hiển thị 16
                        </option>

                    </select>


                    <!-- TÌM KIẾM -->

                    <div class="search-box">

                        <input v-model="search" type="text" placeholder="Tìm kiếm theo tên sách" />

                        <span class="search-icon">
                            🔍
                        </span>

                    </div>

                </div>


                <!-- =================================================
                     LOADING
                ================================================== -->

                <div v-if="loading" class="shop-loading">
                    Đang tải sản phẩm...
                </div>


                <!-- =================================================
                     DANH SÁCH SẢN PHẨM
                ================================================== -->

                <div v-else-if="books.length > 0" class="product-grid">

                    <div v-for="book in books" :key="book._id" class="product-card">

                        <!-- =================================================
                             ẢNH SÁCH
                        ================================================= -->

                        <div class="product-image" @click="goToBookDetail(book)">

                            <img v-if="
                                book.images &&
                                book.images.length > 0
                            " :src="book.images[0]" :alt="book.title" />

                            <div v-else class="no-image">
                                Không có ảnh
                            </div>

                        </div>


                        <!-- =================================================
                             THÔNG TIN
                        ================================================= -->

                        <div class="product-info">

                            <!-- TÊN SÁCH -->

                            <h3 class="product-title" @click="goToBookDetail(book)">
                                {{ book.title }}
                            </h3>


                            <!-- GIÁ -->

                            <div class="product-price">

                                <span v-if="
                                    book.discountPrice > 0
                                " class="discount-price">
                                    {{
                                        formatPrice(
                                            book.discountPrice
                                        )
                                    }}
                                </span>


                                <span :class="{
                                    'old-price':
                                        book.discountPrice >
                                        0
                                }">
                                    {{
                                        formatPrice(
                                            book.price
                                        )
                                    }}
                                </span>

                            </div>


                            <!-- ĐÃ BÁN -->

                            <div class="product-sold">

                                Đã bán:
                                {{ book.sold || 0 }}

                            </div>


                            <!-- =================================================
                                 THÊM GIỎ HÀNG
                            ================================================== -->

                            <button class="add-cart-btn" :class="{
                                'is-adding':
                                    addingBookId ===
                                    book._id,

                                'is-added':
                                    addedBookIds.includes(
                                        book._id
                                    )
                            }" type="button" :disabled="addingBookId ===
                                    book._id
                                    " @click.stop="
                                    handleAddToCart(
                                        book
                                    )
                                    ">

                                <!-- ĐANG THÊM -->

                                <template v-if="
                                    addingBookId ===
                                    book._id
                                ">

                                    <span class="loading-spinner"></span>

                                    Đang thêm...

                                </template>


                                <!-- ĐÃ THÊM -->

                                <template v-else-if="
                                    addedBookIds.includes(
                                        book._id
                                    )
                                ">

                                    ✓ Đã thêm

                                </template>


                                <!-- BÌNH THƯỜNG -->

                                <template v-else>

                                    🛒 Thêm vào giỏ hàng

                                </template>

                            </button>

                        </div>

                    </div>

                </div>


                <!-- =================================================
                     KHÔNG CÓ SẢN PHẨM
                ================================================== -->

                <div v-else class="empty-product">
                    Không tìm thấy sản phẩm
                </div>


                <!-- =================================================
                     PHÂN TRANG
                ================================================== -->

                <div v-if="
                    !loading &&
                    totalPages > 1
                " class="pagination">

                    <button class="pagination-btn" :disabled="page === 1" @click="
                        handlePageChange(
                            page - 1
                        )
                        ">
                        ‹
                    </button>


                    <button v-for="p in totalPages" :key="p" class="pagination-btn" :class="{
                        active:
                            p === page
                    }" @click="
                            handlePageChange(p)
                            ">
                        {{ p }}
                    </button>


                    <button class="pagination-btn" :disabled="page === totalPages
                        " @click="
                            handlePageChange(
                                page + 1
                            )
                            ">
                        ›
                    </button>

                </div>

            </main>

        </div>


        <!-- =================================================
             TOAST
        ================================================== -->

        <Transition name="toast">

            <div v-if="toastMessage" class="cart-toast" :class="{
                'toast-success':
                    toastType === 'success',

                'toast-error':
                    toastType === 'error'
            }">

                <!-- ICON -->

                <div class="toast-icon">

                    <span v-if="
                        toastType === 'success'
                    ">
                        ✓
                    </span>

                    <span v-else>
                        !
                    </span>

                </div>


                <!-- NỘI DUNG -->

                <div class="toast-content">

                    {{ toastMessage }}

                </div>


                <!-- NÚT ĐÓNG -->

                <button type="button" class="toast-close" @click="closeToast">
                    ×
                </button>


                <!-- THANH THỜI GIAN -->

                <div class="toast-progress" :class="{
                    'progress-success':
                        toastType === 'success',

                    'progress-error':
                        toastType === 'error'
                }"></div>

            </div>

        </Transition>

    </div>

</template>


<style scoped>
/* =====================================================
   SHOP PAGE
===================================================== */

.shop-page {
    width: 100%;
    min-height: 100vh;
    background: #ffffff;
    padding: 30px 0 60px;
}

.product-title {
    cursor: pointer;
}

.product-image {
    cursor: pointer;
}

.shop-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    box-sizing: border-box;

    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 30px;
}


/* =====================================================
   SIDEBAR
===================================================== */

.shop-sidebar {
    width: 100%;
}

.sidebar-box {
    border: 1px solid #eeeeee;
    padding: 20px 18px;
    background: #ffffff;
}

.sidebar-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #333333;
}

.sidebar-line {
    width: 100%;
    height: 1px;
    background: #78c800;
    margin: 8px 0 12px;
}


/* =====================================================
   CATEGORY
===================================================== */

.category-item {
    display: flex;
    align-items: center;
    gap: 10px;

    padding: 7px 0;

    cursor: pointer;

    color: #777777;

    font-size: 13px;

    transition: color 0.2s ease;
}

.category-item:hover {
    color: #78c800;
}

.category-item.active {
    color: #78c800;
}

.category-item input {
    width: 12px;
    height: 12px;
    margin: 0;

    accent-color: #78c800;

    cursor: pointer;
}


/* =====================================================
   CONTENT
===================================================== */

.shop-content {
    min-width: 0;
}


/* =====================================================
   TOOLBAR
===================================================== */

.shop-toolbar {
    width: 100%;

    min-height: 44px;

    padding: 8px 12px;

    margin-bottom: 18px;

    background: #f5f5f5;

    display: flex;

    align-items: center;

    gap: 8px;

    box-sizing: border-box;
}

.toolbar-select {
    height: 32px;

    min-width: 125px;

    padding: 0 8px;

    border: 1px solid #dddddd;

    background: #ffffff;

    color: #555555;

    font-size: 12px;

    outline: none;
}

.toolbar-limit {
    min-width: 85px;
}


/* =====================================================
   SEARCH
===================================================== */

.search-box {
    flex: 1;

    max-width: 230px;

    height: 32px;

    display: flex;

    align-items: center;

    background: #ffffff;

    border: 1px solid #dddddd;
}

.search-box input {
    flex: 1;

    width: 100%;

    height: 32px;

    padding: 0 12px;

    border: none;

    outline: none;

    background: #fff;

    color: #333;

    font-size: 14px;

    box-sizing: border-box;
}

.search-box input::placeholder {
    color: #aaaaaa;
}

.search-icon {
    width: 34px;

    text-align: center;

    font-size: 13px;

    color: #777777;
}


/* =====================================================
   PRODUCT GRID
===================================================== */

.product-grid {
    display: grid;

    grid-template-columns:
        repeat(3, 1fr);

    gap: 28px 30px;
}


/* =====================================================
   PRODUCT CARD
===================================================== */

.product-card {
    background: #ffffff;

    overflow: hidden;

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.product-card:hover {
    transform: translateY(-3px);

    box-shadow:
        0 5px 18px rgba(0, 0, 0, 0.08);
}


/* =====================================================
   PRODUCT IMAGE
===================================================== */

.product-image {
    width: 100%;

    height: 180px;

    background: #f1f1f1;

    display: flex;

    align-items: center;

    justify-content: center;

    overflow: hidden;
}

.product-image img {
    width: 100%;

    height: 100%;

    object-fit: contain;

    display: block;

    transition:
        transform 0.3s ease;
}

.product-card:hover .product-image img {
    transform: scale(1.03);
}

.no-image {
    color: #999999;

    font-size: 13px;
}


/* =====================================================
   PRODUCT INFO
===================================================== */

.product-info {
    padding: 12px 10px 14px;

    border: 1px solid #eeeeee;

    border-top: none;
}

.product-title {
    height: 38px;

    margin: 0 0 8px;

    font-size: 13px;

    font-weight: 500;

    color: #444444;

    line-height: 1.45;

    display: -webkit-box;

    -webkit-line-clamp: 2;

    -webkit-box-orient: vertical;

    overflow: hidden;
}


/* =====================================================
   PRICE
===================================================== */

.product-price {
    display: flex;

    align-items: center;

    gap: 8px;

    margin-bottom: 6px;
}

.discount-price {
    color: #333333;

    font-size: 15px;

    font-weight: 600;
}

.old-price {
    color: #aaaaaa;

    font-size: 11px;

    text-decoration: line-through;
}


/* =====================================================
   SOLD
===================================================== */

.product-sold {
    color: #999999;

    font-size: 11px;

    margin-bottom: 10px;
}


/* =====================================================
   ADD CART
===================================================== */

.add-cart-btn {
    width: 100%;

    height: 34px;

    border: none;

    border-radius: 3px;

    background: #78c800;

    color: #ffffff;

    font-size: 12px;

    cursor: pointer;

    transition:
        background 0.2s ease,
        opacity 0.2s ease;
}

.add-cart-btn:hover:not(:disabled) {
    background: #65ad00;
}

.add-cart-btn:disabled {
    cursor: wait;

    opacity: 0.8;
}

.add-cart-btn.is-adding {
    background: #999999;
}

.add-cart-btn.is-added {
    background: #2e7d32;

    cursor: default;
}


/* =====================================================
   LOADING SPINNER
===================================================== */

.loading-spinner {
    display: inline-block;

    width: 12px;

    height: 12px;

    margin-right: 6px;

    border: 2px solid rgba(255, 255, 255, 0.4);

    border-top-color: #ffffff;

    border-radius: 50%;

    vertical-align: middle;

    animation:
        spin 0.7s linear infinite;
}

@keyframes spin {

    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }

}


/* =====================================================
   LOADING / EMPTY
===================================================== */

.shop-loading,
.empty-product {
    width: 100%;

    padding: 60px 20px;

    text-align: center;

    color: #999999;

    font-size: 14px;
}


/* =====================================================
   PAGINATION
===================================================== */

.pagination {
    display: flex;

    justify-content: center;

    align-items: center;

    gap: 5px;

    margin-top: 35px;
}

.pagination-btn {
    min-width: 32px;

    height: 32px;

    padding: 0 8px;

    border: 1px solid #dddddd;

    background: #ffffff;

    color: #555555;

    cursor: pointer;

    font-size: 12px;
}

.pagination-btn:hover:not(:disabled) {
    border-color: #78c800;

    color: #78c800;
}

.pagination-btn.active {
    background: #78c800;

    border-color: #78c800;

    color: #ffffff;
}

.pagination-btn:disabled {
    opacity: 0.4;

    cursor: not-allowed;
}


/* =====================================================
   TOAST
===================================================== */

.cart-toast {
    position: fixed;

    top: 16px;

    right: 12px;

    width: 390px;

    min-height: 100px;

    z-index: 99999;

    display: flex;

    align-items: center;

    gap: 14px;

    padding: 18px 42px 18px 18px;

    background: #ffffff;

    border-radius: 6px;

    box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.15);

    overflow: hidden;

    box-sizing: border-box;
}


/* =====================================================
   TOAST ICON
===================================================== */

.toast-icon {
    flex-shrink: 0;

    width: 26px;

    height: 26px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 50%;

    color: #ffffff;

    font-size: 16px;

    font-weight: 700;
}

.toast-success .toast-icon {
    background: #4caf50;
}

.toast-error .toast-icon {
    background: #f04444;
}


/* =====================================================
   TOAST CONTENT
===================================================== */

.toast-content {
    flex: 1;

    color: #777777;

    font-size: 18px;

    line-height: 1.45;

    word-break: break-word;
}


/* =====================================================
   TOAST CLOSE
===================================================== */

.toast-close {
    position: absolute;

    top: 8px;

    right: 10px;

    width: 25px;

    height: 25px;

    display: flex;

    align-items: center;

    justify-content: center;

    border: none;

    background: transparent;

    color: #aaaaaa;

    font-size: 25px;

    line-height: 1;

    cursor: pointer;

    padding: 0;
}

.toast-close:hover {
    color: #555555;
}


/* =====================================================
   TOAST PROGRESS
===================================================== */

.toast-progress {
    position: absolute;

    left: 0;

    bottom: 0;

    height: 5px;

    width: 100%;

    transform-origin: left;

    animation:
        toastProgress 2.5s linear forwards;
}

.progress-success {
    background: #4caf50;
}

.progress-error {
    background: #e53935;
}

@keyframes toastProgress {

    from {
        width: 100%;
    }

    to {
        width: 0%;
    }

}


/* =====================================================
   TOAST ANIMATION
===================================================== */

.toast-enter-active,
.toast-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;

    transform:
        translateX(100%);
}


/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 992px) {

    .shop-container {
        grid-template-columns:
            170px 1fr;

        gap: 20px;
    }

    .product-grid {
        grid-template-columns:
            repeat(2, 1fr);
    }

}


@media (max-width: 700px) {

    .shop-container {
        grid-template-columns: 1fr;
    }

    .shop-sidebar {
        display: block;
    }

    .shop-toolbar {
        flex-wrap: wrap;
    }

    .search-box {
        max-width: none;

        width: 100%;
    }

    .product-grid {
        grid-template-columns:
            repeat(2, 1fr);

        gap: 15px;
    }

    .cart-toast {
        top: 15px;

        right: 10px;

        left: 10px;

        width: auto;

        min-height: 90px;
    }

    .toast-content {
        font-size: 16px;
    }

}


@media (max-width: 450px) {

    .product-grid {
        grid-template-columns: 1fr;
    }

}
</style>