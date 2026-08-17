<template>
    <div class="book-detail-page">
        <div class="book-detail-container">

            <!-- =========================
           LOADING
      ========================== -->
            <div v-if="loading" class="loading-state">
                Đang tải thông tin sách...
            </div>

            <!-- =========================
           ERROR
      ========================== -->
            <div v-else-if="error" class="error-state">
                {{ error }}
            </div>

            <!-- =========================
           BOOK DETAIL
      ========================== -->
            <div v-else-if="book" class="book-detail">

                <!-- =========================
             LEFT - IMAGE
        ========================== -->
                <div class="book-images">

                    <div class="thumbnail-list">
                        <button v-for="(image, index) in book.images" :key="`${image}-${index}`" type="button"
                            class="thumbnail" :class="{ active: selectedImageIndex === index }"
                            @click="selectedImageIndex = index">
                            <img :src="image" :alt="book.title" />
                        </button>
                    </div>

                    <div class="main-image-wrapper">
                        <img v-if="currentImage" :src="currentImage" :alt="book.title" class="main-image" />

                        <div v-else class="no-image">
                            Không có hình ảnh
                        </div>
                    </div>

                </div>

                <!-- =========================
             RIGHT - INFORMATION
        ========================== -->
                <div class="book-info">

                    <h1 class="book-title">
                        {{ book.title }}
                    </h1>

                    <!-- PRICE -->
                    <div class="price-area">

                        <template v-if="hasDiscount">
                            <span class="discount-price">
                                {{ formatPrice(book.discountPrice) }}
                            </span>

                            <span class="original-price">
                                {{ formatPrice(book.price) }}
                            </span>
                        </template>

                        <span v-else class="discount-price">
                            {{ formatPrice(book.price) }}
                        </span>

                    </div>

                    <div class="divider"></div>

                    <!-- BOOK INFORMATION -->
                    <div class="book-information">

                        <!-- AUTHOR -->
                        <div class="info-row">
                            <span class="info-label">
                                Tác giả
                            </span>

                            <span class="info-value">
                                <template v-if="book.authorIds?.length">
                                    {{ getAuthorNames() }}
                                </template>

                                <template v-else>
                                    Chưa cập nhật
                                </template>
                            </span>
                        </div>

                        <!-- PUBLISHER -->
                        <div class="info-row">
                            <span class="info-label">
                                Nhà xuất bản
                            </span>

                            <span class="info-value">
                                {{ book.publisherId?.name || 'Chưa cập nhật' }}
                            </span>
                        </div>

                        <!-- CATEGORY -->
                        <div class="info-row">
                            <span class="info-label">
                                Danh mục
                            </span>

                            <span class="info-value">
                                <template v-if="book.categoryIds?.length">
                                    {{ getCategoryNames() }}
                                </template>

                                <template v-else>
                                    Chưa cập nhật
                                </template>
                            </span>
                        </div>

                        <!-- ISBN -->
                        <div class="info-row">
                            <span class="info-label">
                                ISBN
                            </span>

                            <span class="info-value">
                                {{ book.isbn || 'Chưa cập nhật' }}
                            </span>
                        </div>

                        <!-- PAGE COUNT -->
                        <div class="info-row">
                            <span class="info-label">
                                Số trang
                            </span>

                            <span class="info-value">
                                {{ book.pageCount || 'Chưa cập nhật' }}
                            </span>
                        </div>

                        <!-- PUBLISH YEAR -->
                        <div class="info-row">
                            <span class="info-label">
                                Năm xuất bản
                            </span>

                            <span class="info-value">
                                {{ book.publishYear || 'Chưa cập nhật' }}
                            </span>
                        </div>

                        <!-- LANGUAGE -->
                        <div class="info-row">
                            <span class="info-label">
                                Ngôn ngữ
                            </span>

                            <span class="info-value">
                                {{ book.language || 'Chưa cập nhật' }}
                            </span>
                        </div>

                        <!-- FORMAT -->
                        <div class="info-row">
                            <span class="info-label">
                                Hình thức
                            </span>

                            <span class="info-value">
                                {{ book.format || 'Chưa cập nhật' }}
                            </span>
                        </div>

                        <!-- STOCK -->
                        <div class="info-row">
                            <span class="info-label">
                                Tình trạng
                            </span>

                            <span class="info-value stock-status" :class="{
                                'out-of-stock': book.stock <= 0,
                                'in-stock': book.stock > 0
                            }">
                                {{ stockText }}
                            </span>
                        </div>

                    </div>

                    <div class="divider"></div>

                    <!-- QUANTITY -->
                    <div class="quantity-area">

                        <span class="quantity-label">
                            Số lượng
                        </span>

                        <div class="quantity-control">

                            <button type="button" class="quantity-button" :disabled="quantity <= 1"
                                @click="decreaseQuantity">
                                −
                            </button>

                            <span class="quantity-value">
                                {{ quantity }}
                            </span>

                            <button type="button" class="quantity-button" :disabled="quantity >= book.stock"
                                @click="increaseQuantity">
                                +
                            </button>

                        </div>

                    </div>

                    <!-- ADD TO CART -->
                    <div class="action-area">

                        <button type="button" class="add-cart-button" :class="{
                            'is-adding': addingToCart,
                            'is-added': addedToCart
                        }" :disabled="book.stock <= 0 || addingToCart" @click="handleAddToCart">

                            <!-- ĐANG THÊM -->
                            <template v-if="addingToCart">
                                <span class="loading-spinner"></span>
                                Đang thêm...
                            </template>

                            <!-- ĐÃ THÊM -->
                            <template v-else-if="addedToCart">
                                ✓ Đã thêm
                            </template>

                            <!-- BÌNH THƯỜNG -->
                            <template v-else>
                                {{ book.stock > 0 ? 'THÊM VÀO GIỎ HÀNG' : 'HẾT HÀNG' }}
                            </template>

                        </button>

                    </div>

                </div>

            </div>

            <!-- =========================
           NOT FOUND
      ========================== -->
            <div v-else class="empty-state">
                Không tìm thấy thông tin sách.
            </div>

        </div>

        <!-- =========================
       TOAST
    ========================== -->
        <Transition name="toast">

            <div v-if="toastMessage" class="cart-toast" :class="{
                'toast-success': toastType === 'success',
                'toast-error': toastType === 'error'
            }">

                <div class="toast-icon">
                    <span v-if="toastType === 'success'">✓</span>
                    <span v-else>!</span>
                </div>

                <div class="toast-content">
                    {{ toastMessage }}
                </div>

                <button type="button" class="toast-close" @click="closeToast">
                    ×
                </button>

                <div class="toast-progress" :class="{
                    'progress-success': toastType === 'success',
                    'progress-error': toastType === 'error'
                }"></div>

            </div>

        </Transition>

    </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import userService from '@/services/user.service'

const route = useRoute()

// =====================================================
// USER STORE
// =====================================================
const userStore = useUserStore()

const book = ref(null)
const loading = ref(true)
const error = ref('')

const selectedImageIndex = ref(0)
const quantity = ref(1)

// =====================================================
// TRẠNG THÁI THÊM GIỎ HÀNG
// =====================================================
const addingToCart = ref(false)
const addedToCart = ref(false)

// =====================================================
// TOAST
// =====================================================
const toastMessage = ref('')
const toastType = ref('success')
let toastTimer = null

const showToast = (message, type = 'success') => {
    if (toastTimer) {
        clearTimeout(toastTimer)
        toastTimer = null
    }

    toastMessage.value = message
    toastType.value = type

    toastTimer = setTimeout(() => {
        toastMessage.value = ''
        toastTimer = null
    }, 2500)
}

const closeToast = () => {
    if (toastTimer) {
        clearTimeout(toastTimer)
        toastTimer = null
    }

    toastMessage.value = ''
}

/*
 * =========================
 * FORMAT PRICE
 * =========================
 */
const formatPrice = (value) => {
    if (value === undefined || value === null) {
        return '0đ'
    }

    return Number(value).toLocaleString('vi-VN') + 'đ'
}

/*
 * =========================
 * DISCOUNT
 * =========================
 */
const hasDiscount = computed(() => {
    if (!book.value) {
        return false
    }

    return (
        Number(book.value.discountPrice) > 0 &&
        Number(book.value.discountPrice) < Number(book.value.price)
    )
})

/*
 * =========================
 * CURRENT IMAGE
 * =========================
 */
const currentImage = computed(() => {
    if (!book.value?.images?.length) {
        return ''
    }

    return book.value.images[selectedImageIndex.value] || book.value.images[0]
})

/*
 * =========================
 * STOCK TEXT
 * =========================
 */
const stockText = computed(() => {
    if (!book.value) {
        return ''
    }

    if (book.value.stock <= 0) {
        return 'Hết hàng'
    }

    return `Còn ${book.value.stock} sản phẩm`
})

/*
 * =========================
 * AUTHOR
 * =========================
 */
const getAuthorNames = () => {
    if (!book.value?.authorIds?.length) {
        return ''
    }

    return book.value.authorIds
        .map(author => author?.name)
        .filter(Boolean)
        .join(', ')
}

/*
 * =========================
 * CATEGORY
 * =========================
 */
const getCategoryNames = () => {
    if (!book.value?.categoryIds?.length) {
        return ''
    }

    return book.value.categoryIds
        .map(category => category?.name)
        .filter(Boolean)
        .join(', ')
}

/*
 * =========================
 * QUANTITY
 * =========================
 */
const decreaseQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--
    }
}

const increaseQuantity = () => {
    if (!book.value) {
        return
    }

    if (quantity.value < book.value.stock) {
        quantity.value++
    }
}

/*
 * =========================
 * LOAD BOOK
 * =========================
 */
const loadBook = async () => {
    loading.value = true
    error.value = ''

    try {
        const id = route.params.id

        if (!id) {
            error.value = 'Không có mã sách.'
            return
        }

        const response = await userService.getBookById(id)

        if (!response?.success || !response?.data) {
            error.value =
                response?.message || 'Không thể lấy thông tin sách.'
            return
        }

        book.value = response.data

        selectedImageIndex.value = 0

        if (book.value.stock <= 0) {
            quantity.value = 0
        } else {
            quantity.value = 1
        }

    } catch (err) {
        console.error('Lỗi lấy chi tiết sách:', err)

        error.value =
            err?.message ||
            err?.response?.data?.message ||
            'Không thể tải thông tin sách.'
    } finally {
        loading.value = false
    }
}

/*
 * =========================
 * LẤY USER ID
 * =========================
 */
const getUserId = () => {
    const user = userStore.user

    if (!user) {
        return null
    }

    if (user._id) {
        return user._id
    }

    if (user.id) {
        return user.id
    }

    return null
}

/*
 * =========================
 * THÊM SÁCH VÀO GIỎ HÀNG
 * =========================
 */
const handleAddToCart = async () => {

    if (!book.value || book.value.stock <= 0) {
        return
    }

    // -------------------------------------------------
    // KIỂM TRA ĐĂNG NHẬP
    // -------------------------------------------------
    const userId = getUserId()

    if (!userId) {
        showToast('Vui lòng đăng nhập trước khi thêm vào giỏ hàng', 'error')
        return
    }

    // -------------------------------------------------
    // KHÔNG CHO CLICK LIÊN TỤC
    // -------------------------------------------------
    if (addingToCart.value) {
        return
    }

    try {
        addingToCart.value = true

        // -------------------------------------------------
        // DATA GỬI BACKEND
        // -------------------------------------------------
        const requestData = {
            type: 'ADD_NEW',
            userId: userId,
            bookId: book.value._id,
            quantity: quantity.value
        }

        // -------------------------------------------------
        // GỌI API
        // -------------------------------------------------
        const response = await userService.addToCart(requestData)

        if (response?.success === true) {

            // ---------------------------------------------
            // BÁO CHO HEADER CẬP NHẬT GIỎ HÀNG
            // ---------------------------------------------
            window.dispatchEvent(new Event('cart-updated'))

            // ---------------------------------------------
            // HIỆN TRẠNG THÁI ĐÃ THÊM
            // ---------------------------------------------
            addedToCart.value = true

            showToast(
                `"${book.value.title}" đã được thêm vào giỏ hàng`,
                'success'
            )

            setTimeout(() => {
                addedToCart.value = false
            }, 1500)

        } else {

            showToast(
                response?.message || 'Không thể thêm sách vào giỏ hàng',
                'error'
            )

        }

    } catch (err) {
        console.error('Lỗi thêm giỏ hàng:', err)

        const message =
            err?.response?.data?.message ||
            err?.message ||
            'Có lỗi xảy ra khi thêm vào giỏ hàng'

        showToast(message, 'error')

    } finally {
        addingToCart.value = false
    }
}

onBeforeUnmount(() => {
    if (toastTimer) {
        clearTimeout(toastTimer)
        toastTimer = null
    }
})

onMounted(() => {
    loadBook()
})
</script>

<style scoped>
/* =========================
   PAGE
========================= */

.book-detail-page {
    width: 100%;
    min-height: 100vh;
    background: #fff;
    padding: 50px 0 70px;
    box-sizing: border-box;
}

.book-detail-container {
    width: min(1180px, calc(100% - 60px));
    margin: 0 auto;
}

/* =========================
   LOADING / ERROR
========================= */

.loading-state,
.error-state,
.empty-state {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: #666;
}

.error-state {
    color: #d33;
}

/* =========================
   MAIN LAYOUT
========================= */

.book-detail {
    display: grid;
    grid-template-columns: 52% 48%;
    gap: 50px;
    align-items: start;
}

/* =========================
   IMAGE AREA
========================= */

.book-images {
    display: flex;
    gap: 18px;
    min-width: 0;
}

.thumbnail-list {
    width: 76px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.thumbnail {
    width: 76px;
    height: 92px;
    padding: 5px;
    border: 1px solid #e5e5e5;
    background: #fff;
    cursor: pointer;
    transition: 0.2s ease;
}

.thumbnail:hover {
    border-color: #72cf00;
}

.thumbnail.active {
    border: 2px solid #72cf00;
}

.thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.main-image-wrapper {
    flex: 1;
    min-width: 0;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    background: #f7f7f7;
}

/* =========================
   BOOK INFORMATION
========================= */

.book-info {
    padding-top: 5px;
}

.book-title {
    margin: 0 0 15px;
    color: #222;
    font-size: 25px;
    line-height: 1.45;
    font-weight: 500;
}

.price-area {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
}

.discount-price {
    color: #59c900;
    font-size: 24px;
    font-weight: 600;
}

.original-price {
    color: #999;
    font-size: 16px;
    text-decoration: line-through;
}

.divider {
    width: 100%;
    height: 1px;
    background: #eeeeee;
    margin: 18px 0;
}

/* =========================
   INFORMATION ROW
========================= */

.book-information {
    width: 100%;
}

.info-row {
    display: grid;
    grid-template-columns: 145px 1fr;
    gap: 15px;
    margin-bottom: 14px;
    font-size: 14px;
    line-height: 1.5;
}

.info-label {
    color: #777;
}

.info-value {
    color: #333;
    word-break: break-word;
}

.stock-status.in-stock {
    color: #59c900;
}

.stock-status.out-of-stock {
    color: #e53935;
}

/* =========================
   QUANTITY
========================= */

.quantity-area {
    display: flex;
    align-items: center;
    gap: 30px;
    margin: 22px 0;
}

.quantity-label {
    color: #666;
    font-size: 14px;
}

.quantity-control {
    display: flex;
    align-items: center;
    height: 40px;
    border: 1px solid #ddd;
}

.quantity-button {
    width: 38px;
    height: 38px;
    border: 0;
    background: #fff;
    color: #333;
    font-size: 20px;
    cursor: pointer;
}

.quantity-button:hover:not(:disabled) {
    background: #f5f5f5;
}

.quantity-button:disabled {
    color: #ccc;
    cursor: not-allowed;
}

.quantity-value {
    min-width: 45px;
    text-align: center;
    color: #333;
    font-size: 14px;
}

/* =========================
   BUTTON
========================= */

.action-area {
    display: flex;
    align-items: center;
    gap: 12px;
}

.add-cart-button {
    min-width: 190px;
    height: 44px;
    padding: 0 25px;
    border: 0;
    border-radius: 3px;
    background: #58c900;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s ease;
}

.add-cart-button:hover:not(:disabled) {
    background: #4db300;
}

.add-cart-button:disabled {
    background: #bdbdbd;
    cursor: not-allowed;
}

/* Đang thêm */
.add-cart-button.is-adding {
    background: #999;
    cursor: wait;
}

/* Đã thêm */
.add-cart-button.is-added {
    background: #2e7d32;
    cursor: default;
}

/* =========================
   LOADING SPINNER
========================= */

.loading-spinner {
    display: inline-block;
    width: 13px;
    height: 13px;
    margin-right: 6px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    vertical-align: middle;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* =========================
   TOAST
========================= */

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
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    box-sizing: border-box;
}

.toast-icon {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
}

.toast-success .toast-icon {
    background: #4caf50;
}

.toast-error .toast-icon {
    background: #f04444;
}

.toast-content {
    flex: 1;
    color: #777;
    font-size: 16px;
    line-height: 1.45;
    word-break: break-word;
}

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
    color: #aaa;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
}

.toast-close:hover {
    color: #555;
}

.toast-progress {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 5px;
    width: 100%;
    transform-origin: left;
    animation: toastProgress 2.5s linear forwards;
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

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {
    .book-detail {
        grid-template-columns: 1fr;
        gap: 35px;
    }

    .main-image-wrapper {
        height: 450px;
    }

    .book-info {
        padding-top: 0;
    }
}

@media (max-width: 600px) {
    .book-detail-container {
        width: calc(100% - 30px);
    }

    .book-detail-page {
        padding: 25px 0 50px;
    }

    .book-images {
        gap: 10px;
    }

    .thumbnail-list {
        width: 60px;
    }

    .thumbnail {
        width: 60px;
        height: 75px;
    }

    .main-image-wrapper {
        height: 350px;
    }

    .book-title {
        font-size: 20px;
    }

    .discount-price {
        font-size: 21px;
    }

    .info-row {
        grid-template-columns: 115px 1fr;
    }

    .cart-toast {
        top: 15px;
        right: 10px;
        left: 10px;
        width: auto;
        min-height: 90px;
    }

    .toast-content {
        font-size: 14px;
    }
}
</style>