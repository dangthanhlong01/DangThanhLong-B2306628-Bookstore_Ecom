<script setup>
import { ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

import { Swiper, SwiperSlide } from "swiper/vue";

import { useUserStore } from "@/stores/user";

import userService from "@/services/user.service.js";

import "swiper/css";
import "swiper/css/navigation";


// =====================================================
// PROPS
// =====================================================

const props = defineProps({
    title: {
        type: String,
        default: "",
    },

    description: {
        type: String,
        default: "",
    },

    data: {
        type: Array,
        default: () => [],
    },
});


// =====================================================
// ROUTER
// =====================================================

const router = useRouter();


// =====================================================
// USER STORE
// =====================================================

// Lấy thông tin user hiện tại từ Pinia
const userStore = useUserStore();


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
// success = thành công
// error = lỗi
const toastType = ref("success");

// Timer dùng để tự động đóng toast
let toastTimer = null;


// =====================================================
// HIỂN THỊ TOAST
// =====================================================

const showToast = (message, type = "success") => {

    // Nếu đang có timer cũ thì hủy
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    // Gán nội dung
    toastMessage.value = message;

    // Gán loại toast
    toastType.value = type;

    // Tạo timer mới
    toastTimer = setTimeout(() => {

        // Xóa nội dung
        toastMessage.value = "";

        // Xóa timer
        toastTimer = null;

    }, 2500);
};


// =====================================================
// ĐÓNG TOAST
// =====================================================

const closeToast = () => {

    // Hủy timer
    if (toastTimer) {
        clearTimeout(toastTimer);

        toastTimer = null;
    }

    // Ẩn toast
    toastMessage.value = "";
};


// =====================================================
// SWIPER
// =====================================================

// Lưu instance của Swiper
const swiperInstance = ref(null);


// Khi Swiper được khởi tạo
const onSwiper = (swiper) => {

    swiperInstance.value = swiper;
};


// Nút trái
const handlePrev = () => {

    if (swiperInstance.value) {

        swiperInstance.value.slidePrev();

    }
};


// Nút phải
const handleNext = () => {

    if (swiperInstance.value) {

        swiperInstance.value.slideNext();

    }
};


// =====================================================
// FORMAT GIÁ
// =====================================================

const formatPrice = (value) => {

    return Number(value || 0).toLocaleString("vi-VN") + "đ";

};


// =====================================================
// LẤY USER ID
// =====================================================

const getUserId = () => {

    const user = userStore.user;

    // Không có user
    if (!user) {

        return null;

    }

    // Backend có thể trả về _id
    if (user._id) {

        return user._id;

    }

    // Hoặc id
    if (user.id) {

        return user.id;

    }

    return null;
};


// =====================================================
// ĐI ĐẾN TRANG CHI TIẾT SÁCH
// =====================================================

const goToBookDetail = (book) => {

    console.log("========== ĐI CHI TIẾT SÁCH ==========");
    console.log("BOOK:", book);

    if (!book) {

        console.error("Không tìm thấy thông tin sách:", book);

        return;

    }

    // Route "BookDetail" hiện tại yêu cầu param "id"
    if (book._id) {

        router.push({
            name: "BookDetail",
            params: {
                id: book._id,
            },
        });

        return;

    }

    console.error("Sách không có _id:", book);

};


// =====================================================
// THÊM SÁCH VÀO GIỎ HÀNG
// =====================================================

const handleAddToCart = async (book) => {

    // -------------------------------------------------
    // LẤY USER ID
    // -------------------------------------------------

    const userId = getUserId();


    console.log("========== THÊM GIỎ HÀNG ==========");
    console.log("USER:", userStore.user);
    console.log("USER ID:", userId);
    console.log("BOOK:", book);


    // -------------------------------------------------
    // KIỂM TRA ĐĂNG NHẬP
    // -------------------------------------------------

    if (!userId) {

        showToast(
            "Vui lòng đăng nhập trước khi thêm vào giỏ hàng",
            "error"
        );

        return;
    }


    // -------------------------------------------------
    // KHÔNG CHO CLICK LIÊN TỤC
    // -------------------------------------------------

    if (addingBookId.value === book._id) {

        return;

    }


    try {

        // Đánh dấu sản phẩm đang được thêm
        addingBookId.value = book._id;


        // -------------------------------------------------
        // DATA GỬI BACKEND
        // -------------------------------------------------

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


        // -------------------------------------------------
        // GỌI API
        // -------------------------------------------------

        const response =
            await userService.addToCart(requestData);


        console.log(
            "========== RESPONSE GIỎ HÀNG =========="
        );

        console.log(
            "RESPONSE:",
            response
        );


        // -------------------------------------------------
        // API THÀNH CÔNG
        // -------------------------------------------------

        if (response?.success === true) {

            // ---------------------------------------------
            // BÁO CHO HEADER CẬP NHẬT GIỎ HÀNG
            // ---------------------------------------------

            window.dispatchEvent(
                new Event("cart-updated")
            );


            // ---------------------------------------------
            // LƯU ID SÁCH ĐÃ THÊM
            // ---------------------------------------------

            if (
                !addedBookIds.value.includes(
                    book._id
                )
            ) {

                addedBookIds.value.push(
                    book._id
                );

            }


            // ---------------------------------------------
            // HIỆN TOAST THÀNH CÔNG
            // ---------------------------------------------

            showToast(
                `"${book.title}" đã được thêm vào giỏ hàng`,
                "success"
            );


            // ---------------------------------------------
            // SAU 1.5 GIÂY ĐỔI NÚT VỀ BÌNH THƯỜNG
            // ---------------------------------------------

            setTimeout(() => {

                addedBookIds.value =
                    addedBookIds.value.filter(
                        (id) => id !== book._id
                    );

            }, 1500);


        } else {

            // -------------------------------------------------
            // BACKEND TRẢ SUCCESS FALSE
            // -------------------------------------------------

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


        // -------------------------------------------------
        // LẤY MESSAGE LỖI
        // -------------------------------------------------

        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Có lỗi xảy ra khi thêm vào giỏ hàng";


        // -------------------------------------------------
        // HIỆN TOAST LỖI
        // -------------------------------------------------

        showToast(
            message,
            "error"
        );


    } finally {

        // -------------------------------------------------
        // TẮT LOADING
        // -------------------------------------------------

        addingBookId.value = null;

    }

};


// =====================================================
// HỦY TIMER KHI COMPONENT BỊ HỦY
// =====================================================

onBeforeUnmount(() => {

    if (toastTimer) {

        clearTimeout(toastTimer);

        toastTimer = null;

    }

});
</script>


<template>

    <section class="new-product-feature">


        <!-- =================================================
             TIÊU ĐỀ
        ================================================== -->

        <h2 class="new-product-feature__title">
            {{ title }}
        </h2>


        <!-- =================================================
             MÔ TẢ
        ================================================== -->

        <p v-if="description" class="new-product-feature__description">
            {{ description }}
        </p>


        <!-- =================================================
             DANH SÁCH SẢN PHẨM
        ================================================== -->

        <div v-if="props.data && props.data.length > 0" class="product-slider">


            <!-- =================================================
                 NÚT TRÁI
            ================================================== -->

            <button type="button" class="product-slider__prev" aria-label="Sản phẩm trước" @click="handlePrev">
                ‹
            </button>


            <!-- =================================================
                 SWIPER
            ================================================== -->

            <Swiper :slides-per-view="4" :space-between="20" :slides-per-group="1" :loop="false" :breakpoints="{
                0: {
                    slidesPerView: 1,
                    spaceBetween: 12
                },

                450: {
                    slidesPerView: 2,
                    spaceBetween: 14
                },

                700: {
                    slidesPerView: 3,
                    spaceBetween: 16
                },

                1000: {
                    slidesPerView: 4,
                    spaceBetween: 20
                }
            }" class="product-swiper" @swiper="onSwiper">


                <!-- =================================================
                     CARD SÁCH
                ================================================== -->

                <SwiperSlide v-for="book in props.data" :key="book._id">

                    <div class="new-product-feature__item">


                        <!-- =================================================
                             ẢNH SÁCH
                        ================================================== -->

                        <div class="book-image" @click.stop="goToBookDetail(book)">

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
                        ================================================== -->

                        <div class="book-info">


                            <!-- TÊN SÁCH -->

                            <h3 class="book-title" @click.stop="goToBookDetail(book)">
                                {{ book.title }}
                            </h3>


                            <!-- =================================================
                                 GIÁ
                            ================================================== -->

                            <div class="book-price">

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
                                        book.discountPrice > 0
                                }">
                                    {{
                                        formatPrice(
                                            book.price
                                        )
                                    }}
                                </span>

                            </div>


                            <!-- =================================================
                                 ĐÃ BÁN
                            ================================================== -->

                            <div class="book-sold">

                                Đã bán:
                                {{ book.sold || 0 }}

                            </div>


                            <!-- =================================================
                                 NÚT THÊM GIỎ HÀNG
                            ================================================== -->

                            <button type="button" class="add-cart-btn" :class="{
                                'is-adding':
                                    addingBookId === book._id,

                                'is-added':
                                    addedBookIds.includes(
                                        book._id
                                    )
                            }" :disabled="addingBookId === book._id
                                " @click.stop="
                                        handleAddToCart(book)
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

                </SwiperSlide>

            </Swiper>


            <!-- =================================================
                 NÚT PHẢI
            ================================================== -->

            <button type="button" class="product-slider__next" aria-label="Sản phẩm tiếp theo" @click="handleNext">
                ›
            </button>

        </div>


        <!-- =================================================
             KHÔNG CÓ SẢN PHẨM
        ================================================== -->

        <p v-else class="new-product-feature__empty">
            Chưa có sản phẩm mới
        </p>


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


                <!-- =================================================
                     ICON
                ================================================== -->

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


                <!-- =================================================
                     NỘI DUNG
                ================================================== -->

                <div class="toast-content">
                    {{ toastMessage }}
                </div>


                <!-- =================================================
                     NÚT ĐÓNG
                ================================================== -->

                <button type="button" class="toast-close" @click="closeToast">
                    ×
                </button>


                <!-- =================================================
                     THANH THỜI GIAN
                ================================================== -->

                <div class="toast-progress" :class="{
                    'progress-success':
                        toastType === 'success',

                    'progress-error':
                        toastType === 'error'
                }"></div>

            </div>

        </Transition>

    </section>

</template>


<style scoped>
/* =========================================================
   KHU VỰC CHÍNH
========================================================= */

.new-product-feature {

    width: 100%;

    padding: 40px 0 50px;

    box-sizing: border-box;
}


/* =========================================================
   TIÊU ĐỀ
========================================================= */

.new-product-feature__title {

    margin: 0 0 10px;

    text-align: center;

    font-size: 28px;

    font-weight: 600;

    color: #222;
}


/* =========================================================
   MÔ TẢ
========================================================= */

.new-product-feature__description {

    margin: 0 0 30px;

    text-align: center;

    font-size: 15px;

    color: #777;
}


/* =========================================================
   KHUNG SLIDER
========================================================= */

.product-slider {

    position: relative;

    width: 86%;

    max-width: 1200px;

    margin: 0 auto;

    padding: 0 45px;

    box-sizing: border-box;
}


/* =========================================================
   SWIPER
========================================================= */

.product-swiper {

    width: 100%;
}


/* =========================================================
   CARD
========================================================= */

.new-product-feature__item {

    width: 100%;

    background: #fff;

    border: 1px solid #eee;

    border-radius: 8px;

    overflow: hidden;

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

    box-sizing: border-box;
}


.new-product-feature__item:hover {

    transform: translateY(-4px);

    box-shadow:
        0 5px 15px rgba(0, 0, 0, 0.1);
}


/* =========================================================
   ẢNH
========================================================= */

.book-image {

    width: 100%;

    height: 260px;

    display: flex;

    align-items: center;

    justify-content: center;

    background: #f8f8f8;

    overflow: hidden;

    cursor: pointer;
}


.book-image img {

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

    font-size: 14px;
}


/* =========================================================
   THÔNG TIN
========================================================= */

.book-info {

    padding: 14px;
}


.book-title {

    margin: 0 0 12px;

    font-size: 16px;

    font-weight: 500;

    line-height: 1.4;

    color: #333;

    min-height: 45px;

    display: -webkit-box;

    -webkit-line-clamp: 2;

    -webkit-box-orient: vertical;

    overflow: hidden;

    cursor: pointer;
}


.book-title:hover {

    color: #e53935;
}


/* =========================================================
   GIÁ
========================================================= */

.book-price {

    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 8px;

    margin-bottom: 8px;
}


.discount-price {

    color: #e53935;

    font-size: 17px;

    font-weight: 600;
}


.old-price {

    color: #999;

    font-size: 13px;

    text-decoration: line-through;
}


/* =========================================================
   ĐÃ BÁN
========================================================= */

.book-sold {

    font-size: 13px;

    color: #777;
}


/* =========================================================
   NÚT THÊM GIỎ HÀNG
========================================================= */

.add-cart-btn {

    width: 100%;

    margin-top: 12px;

    padding: 10px 12px;

    min-height: 40px;

    border: none;

    border-radius: 5px;

    background: #e53935;

    color: #fff;

    font-size: 14px;

    font-weight: 500;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.1s ease,
        opacity 0.2s ease;
}


.add-cart-btn:hover:not(:disabled) {

    background: #c62828;
}


.add-cart-btn:active:not(:disabled) {

    transform: scale(0.98);
}


/* Đang thêm */

.add-cart-btn.is-adding {

    background: #999;

    cursor: wait;
}


/* Đã thêm */

.add-cart-btn.is-added {

    background: #2e7d32;

    cursor: default;
}


/* Disabled */

.add-cart-btn:disabled {

    opacity: 0.8;

    cursor: wait;
}


/* =========================================================
   LOADING SPINNER
========================================================= */

.loading-spinner {

    display: inline-block;

    width: 13px;

    height: 13px;

    margin-right: 6px;

    border: 2px solid rgba(255, 255, 255, 0.4);

    border-top-color: #fff;

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


/* =========================================================
   MŨI TÊN
========================================================= */

.product-slider__prev,
.product-slider__next {

    position: absolute;

    top: 50%;

    transform: translateY(-50%);

    z-index: 20;

    width: 42px;

    height: 48px;

    border: none;

    background: transparent;

    color: #333;

    font-size: 50px;

    line-height: 40px;

    cursor: pointer;

    padding: 0;
}


.product-slider__prev {

    left: 0;
}


.product-slider__next {

    right: 0;
}


.product-slider__prev:hover,
.product-slider__next:hover {

    color: #000;

    transform:
        translateY(-50%) scale(1.1);
}


/* =========================================================
   TOAST
========================================================= */

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

    box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.15);

    overflow: hidden;

    box-sizing: border-box;
}


/* =========================================================
   ICON TOAST
========================================================= */

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


/* =========================================================
   NỘI DUNG TOAST
========================================================= */

.toast-content {

    flex: 1;

    color: #777;

    font-size: 20px;

    line-height: 1.45;

    word-break: break-word;
}


/* =========================================================
   NÚT ĐÓNG
========================================================= */

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

    font-size: 25px;

    line-height: 1;

    cursor: pointer;

    padding: 0;
}


.toast-close:hover {

    color: #555;
}


/* =========================================================
   THANH THỜI GIAN
========================================================= */

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


/* =========================================================
   ANIMATION TOAST
========================================================= */

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


/* =========================================================
   EMPTY
========================================================= */

.new-product-feature__empty {

    width: 86%;

    max-width: 1200px;

    margin: 30px auto;

    text-align: center;

    color: #999;

    font-size: 15px;
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1000px) {

    .product-slider {

        width: 90%;
    }


    .book-image {

        height: 230px;
    }

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 700px) {

    .product-slider {

        width: 92%;

        padding: 0 35px;
    }


    .book-image {

        height: 220px;
    }


    .new-product-feature__title {

        font-size: 24px;
    }


    .product-slider__prev,
    .product-slider__next {

        font-size: 40px;

        width: 32px;
    }


    .product-slider__prev {

        left: 0;
    }


    .product-slider__next {

        right: 0;
    }


    /* Toast mobile */

    .cart-toast {

        top: 15px;

        right: 10px;

        left: 10px;

        width: auto;

        min-height: 90px;
    }


    .toast-content {

        font-size: 17px;
    }

}


/* =========================================================
   ĐIỆN THOẠI NHỎ
========================================================= */

@media (max-width: 450px) {

    .product-slider {

        width: 94%;

        padding: 0 30px;
    }


    .book-image {

        height: 260px;
    }

}
</style>