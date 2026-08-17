<script setup>
import { computed, ref, nextTick } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import { useUserStore } from "@/stores/user";
import shopcartService from "@/services/user.service.js";
import "swiper/css";
import "swiper/css/navigation";

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
// Store chứa thông tin người dùng đang đăng nhập
const userStore = useUserStore();
// Lưu instance của Swiper hiện tại
const swiperInstance = ref(null);

// Module Navigation để sử dụng nút trái/phải
const swiperModules = [Navigation];

// Danh sách sách
const books = computed(() => {
    return Array.isArray(props.data) ? props.data : [];
});

// Khi Swiper được khởi tạo
const onSwiper = (swiper) => {
    swiperInstance.value = swiper;

    // Đảm bảo Swiper nhận đúng navigation sau khi DOM đã render
    nextTick(() => {
        if (swiperInstance.value) {
            swiperInstance.value.navigation.init();
            swiperInstance.value.navigation.update();
        }
    });
};

// Chuyển sang sản phẩm phía trước
const prevSlide = () => {
    if (swiperInstance.value) {
        swiperInstance.value.slidePrev();
    }
};

// Chuyển sang sản phẩm phía sau
const nextSlide = () => {
    if (swiperInstance.value) {
        swiperInstance.value.slideNext();
    }
};
const testClick = (book) => {
    console.log("========== NÚT ĐÃ ĐƯỢC BẤM ==========");
    console.log("BOOK:", book);

    alert("Nút hoạt động");
};
// Format giá tiền Việt Nam
const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
};
// =====================================================
// THÊM SÁCH VÀO GIỎ HÀNG
// =====================================================
const addToCart = async (book) => {
    // Log ngay đầu hàm để kiểm tra nút có gọi được hàm hay không
    console.log("========== CLICK ADD CART ==========");
    console.log("BOOK:", book);

    // Kiểm tra thông tin user
    console.log("USER STORE:", userStore.user);

    // Lấy ID user
    const userId = userStore.user?._id || userStore.user?.id;

    console.log("USER ID:", userId);

    // Nếu chưa đăng nhập
    if (!userId) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
        return;
    }

    // Kiểm tra book
    if (!book?._id) {
        console.error("Không có Book ID:", book);
        alert("Không xác định được sách");
        return;
    }

    try {
        // Dữ liệu gửi backend
        const requestData = {
            userId: userId,
            bookId: book._id,
            quantity: 1,
        };

        console.log("REQUEST ADD CART:", requestData);

        // Gọi API
        const response = await shopcartService.addToCart(requestData);

        console.log("RESPONSE ADD CART:", response);

        // Backend trả response trực tiếp
        if (response?.success) {
            alert("Đã thêm sách vào giỏ hàng!");
        } else {
            alert(
                response?.message ||
                "Không thể thêm sách vào giỏ hàng"
            );
        }

    } catch (error) {
        console.error("========== ADD CART ERROR ==========");
        console.error(error);

        console.error(
            "BACKEND RESPONSE:",
            error?.response?.data
        );

        alert(
            error?.response?.data?.message ||
            "Có lỗi xảy ra khi thêm sách vào giỏ hàng"
        );
    }
};
</script>

<template>
    <section class="box-productFeature">

        <!-- ================= TIÊU ĐỀ ================= -->

        <h2 class="product-feature__title">
            {{ title }}
        </h2>

        <!-- ================= MÔ TẢ ================= -->

        <p v-if="description" class="product-feature__description">
            {{ description }}
        </p>


        <!-- ================= SLIDER ================= -->

        <div v-if="books.length > 0" class="product-feature__slider">

            <Swiper :modules="swiperModules" :slides-per-view="4" :space-between="24" :loop="books.length > 4"
                :speed="500" :breakpoints="{
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 12
                    },
                    600: {
                        slidesPerView: 2,
                        spaceBetween: 16
                    },
                    900: {
                        slidesPerView: 3,
                        spaceBetween: 20
                    },
                    1200: {
                        slidesPerView: 4,
                        spaceBetween: 24
                    }
                }" class="product-feature__swiper" @swiper="onSwiper">

                <SwiperSlide v-for="book in books" :key="book._id">

                    <!-- ================= CARD SÁCH ================= -->

                    <div class="product-feature__item">

                        <!-- Ảnh sách -->
                        <div class="book-image">

                            <img v-if="
                                book.images &&
                                book.images.length > 0
                            " :src="book.images[0]" :alt="book.title" />

                            <div v-else class="no-image">
                                Không có ảnh
                            </div>

                        </div>


                        <!-- Thông tin sách -->
                        <div class="book-info">

                            <!-- Tên sách -->
                            <h3 class="book-title">
                                {{ book.title }}
                            </h3>


                            <!-- Giá -->
                            <div class="book-price">

                                <!-- Giá khuyến mãi -->
                                <span v-if="book.discountPrice > 0" class="discount-price">
                                    {{ formatPrice(book.discountPrice) }}
                                </span>

                                <!-- Giá gốc -->
                                <span :class="{
                                    'old-price':
                                        book.discountPrice > 0
                                }">
                                    {{ formatPrice(book.price) }}
                                </span>

                            </div>


                            <!-- Đã bán -->
                            <div class="book-sold">
                                Đã bán: {{ book.sold || 0 }}
                            </div>


                            <button type="button" class="add-cart-btn" @click="testClick(book)">
                                 Thêm vào giỏ hàng
                            </button>

                        </div>

                    </div>

                </SwiperSlide>

            </Swiper>


            <!-- ================= MŨI TÊN TRÁI ================= -->

            <button type="button" class="product-feature-prev" @click="prevSlide">
                ‹
            </button>


            <!-- ================= MŨI TÊN PHẢI ================= -->

            <button type="button" class="product-feature-next" @click="nextSlide">
                ›
            </button>

        </div>


        <!-- ================= KHÔNG CÓ SẢN PHẨM ================= -->

        <p v-else class="product-feature__empty">
            Chưa có sản phẩm đặc trưng
        </p>

    </section>
</template>


<style scoped>
/* =====================================================
   CONTAINER
===================================================== */

.box-productFeature {
    position: relative;

    width: 100%;

    max-width: 1440px;

    margin: 0 auto;

    padding: 40px 70px;

    box-sizing: border-box;
}


/* =====================================================
   TIÊU ĐỀ
===================================================== */

.product-feature__title {
    text-align: center;

    font-size: 24px;

    font-weight: 600;

    margin: 0 0 8px;

    color: #ffffff;
}


.product-feature__description {
    text-align: center;

    color: #888;

    font-size: 16px;

    margin: 0 0 28px;
}


/* =====================================================
   SLIDER
===================================================== */

.product-feature__slider {
    position: relative;

    width: 100%;

    padding: 0 0;
}


.product-feature__swiper {
    width: 100%;
}


/* =====================================================
   CARD
===================================================== */

.product-feature__item {
    background: #ffffff;

    border-radius: 8px;

    overflow: hidden;

    height: 100%;

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}


.product-feature__item:hover {
    transform: translateY(-3px);

    box-shadow:
        0 5px 15px rgba(0, 0, 0, 0.15);
}


/* =====================================================
   ẢNH SÁCH
===================================================== */

.book-image {
    width: 100%;

    height: 300px;

    display: flex;

    align-items: center;

    justify-content: center;

    background: #f8f8f8;
}


.book-image img {
    width: 100%;

    height: 100%;

    object-fit: contain;

    display: block;
}


.no-image {
    color: #999;

    font-size: 14px;
}


/* =====================================================
   THÔNG TIN SÁCH
===================================================== */

.book-info {
    padding: 14px;
}


.book-title {
    font-size: 16px;

    font-weight: 500;

    color: #111;

    margin: 0 0 18px;

    min-height: 44px;

    display: -webkit-box;

    -webkit-line-clamp: 2;

    -webkit-box-orient: vertical;

    overflow: hidden;
}


/* =====================================================
   GIÁ
===================================================== */

.book-price {
    display: flex;

    align-items: center;

    gap: 8px;

    margin-bottom: 12px;
}


.discount-price {
    color: #ef3030;

    font-size: 18px;

    font-weight: 600;
}


.old-price {
    color: #999;

    font-size: 13px;

    text-decoration: line-through;
}


/* =====================================================
   ĐÃ BÁN
===================================================== */

.book-sold {
    color: #777;

    font-size: 13px;

    margin-bottom: 16px;
}


/* =====================================================
   NÚT THÊM GIỎ HÀNG
===================================================== */

.add-cart-btn {
    width: 100%;

    height: 48px;

    border: none;

    border-radius: 6px;

    background: #ef3030;

    color: #ffffff;

    font-size: 15px;

    font-weight: 500;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.1s ease;
}


.add-cart-btn:hover {
    background: #d92323;
}


.add-cart-btn:active {
    transform: scale(0.98);
}


/* =====================================================
   MŨI TÊN TRÁI / PHẢI
===================================================== */

.product-feature-prev,
.product-feature-next {
    position: absolute;

    top: 50%;

    transform: translateY(-50%);

    z-index: 20;

    width: 44px;

    height: 48px;

    border: none;

    background: transparent;

    color: #555;

    font-size: 50px;

    line-height: 40px;

    cursor: pointer;

    padding: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    transition:
        color 0.2s ease,
        transform 0.2s ease;
}


.product-feature-prev {
    left: 8px;
}


.product-feature-next {
    right: 8px;
}


.product-feature-prev:hover,
.product-feature-next:hover {
    color: #ffffff;

    transform:
        translateY(-50%) scale(1.1);
}


/* =====================================================
   EMPTY
===================================================== */

.product-feature__empty {
    text-align: center;

    color: #999;

    padding: 30px;
}


/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1200px) {

    .box-productFeature {
        padding-left: 50px;

        padding-right: 50px;
    }

}


@media (max-width: 900px) {

    .box-productFeature {
        padding-left: 40px;

        padding-right: 40px;
    }

}


@media (max-width: 600px) {

    .box-productFeature {
        padding-left: 30px;

        padding-right: 30px;
    }


    .book-image {
        height: 260px;
    }


    .product-feature-prev {
        left: 0;
    }


    .product-feature-next {
        right: 0;
    }

}
</style>