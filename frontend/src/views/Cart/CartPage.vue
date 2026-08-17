<template>
    <div class="cart-page">
        <div class="cart-container">

            <!-- =====================================================
                 DANH SÁCH SẢN PHẨM
            ====================================================== -->

            <div class="cart-table">

                <!-- Header -->
                <div class="cart-header">

                    <div class="product-column">
                        Sản phẩm
                    </div>

                    <div class="price-column">
                        Giá
                    </div>

                    <div class="quantity-column">
                        Số lượng
                    </div>

                    <div class="total-column">
                        Tổng tiền
                    </div>

                    <div class="action-column">
                        Thao tác
                    </div>

                </div>


                <!-- Loading -->
                <div v-if="loading" class="empty-cart">
                    Đang tải giỏ hàng...
                </div>


                <!-- Error -->
                <div v-else-if="errorMessage" class="empty-cart">
                    {{ errorMessage }}
                </div>


                <!-- Cart -->
                <template v-else>

                    <div v-for="item in cartItems" :key="item._id" class="cart-item">

                        <!-- Sản phẩm -->
                        <div class="product-column product-info">

                            <div class="product-image">

                                <img :src="item.book?.image ||
                                    item.book?.images?.[0] ||
                                    '/images/no-image.png'
                                    " :alt="item.book?.title ||
                                        'Sản phẩm'
                                        " />

                            </div>

                            <div class="product-name">
                                {{ item.book?.title }}
                            </div>

                        </div>


                        <!-- Giá -->
                        <div class="price-column">

                            {{ formatPrice(item.book?.unitPrice) }}

                        </div>


                        <!-- Số lượng -->
                        <div class="quantity-column">

                            <div class="quantity-box">

                                <button type="button" @click="decreaseQuantity(item)" :disabled="item.quantity <= 1 ||
                                    updatingItemId === item._id
                                    ">
                                    -
                                </button>

                                <input type="number" v-model.number="item.quantity" min="1" :max="item.book?.stock"
                                    :disabled="updatingItemId === item._id
                                        " @change="updateItemQuantity(item)" />

                                <button type="button" @click="increaseQuantity(item)" :disabled="item.quantity >=
                                    Number(item.book?.stock || 0) ||
                                    updatingItemId === item._id
                                    ">
                                    +
                                </button>

                            </div>

                        </div>


                        <!-- Tổng -->
                        <div class="total-column item-total">

                            {{ formatPrice(item.totalPrice) }}

                        </div>


                        <!-- Xóa -->
                        <div class="action-column">

                            <button type="button" class="delete-button" :class="{
                                'is-deleting':
                                    deletingItemId === item._id
                            }" :disabled="deletingItemId === item._id
                                    " @click="removeItem(item._id)">

                                <template v-if="deletingItemId === item._id">
                                    Đang xóa...
                                </template>

                                <template v-else>
                                    Xóa
                                </template>

                            </button>

                        </div>

                    </div>


                    <!-- Giỏ hàng trống -->
                    <div v-if="cartItems.length === 0" class="empty-cart">
                        Giỏ hàng trống
                    </div>

                </template>

            </div>


            <!-- =====================================================
                 VẬN CHUYỂN
            ====================================================== -->

            <div class="shipping-section">

                <div class="shipping-title">
                    Chọn đơn vị vận chuyển
                </div>

                <div class="shipping-options">

                    <label v-for="shipping in shippingMethods" :key="shipping.id" class="shipping-option">

                        <input type="radio" name="shipping" :value="shipping.id" v-model="selectedShipping" />

                        <span>
                            {{ shipping.name }}
                            -
                            {{ formatPrice(shipping.price) }}
                        </span>

                    </label>

                </div>

            </div>


            <!-- =====================================================
                 VOUCHER + THANH TOÁN
            ====================================================== -->

            <div class="cart-bottom">

                <!-- Voucher -->
                <div class="voucher-section">

                    <div class="voucher-icon">
                        🎟
                    </div>

                    <span class="voucher-name">
                        Bookstore voucher
                    </span>

                    <button type="button" class="choose-voucher" @click="openVoucherModal">
                        Chọn Hoặc Nhập Mã
                    </button>


                    <!-- Voucher đang chọn -->
                    <span v-if="selectedVoucher" class="selected-voucher">
                        Mã voucher:
                        {{ selectedVoucher.code }}

                        <button type="button" class="remove-voucher" @click="removeSelectedVoucher">
                            ×
                        </button>
                    </span>

                </div>


                <!-- Tổng tiền -->
                <div class="checkout-section">

                    <div class="total-payment">

                        <span class="total-label">
                            Tổng thanh toán
                            ({{ totalQuantity }} sản phẩm):
                        </span>

                        <span class="total-price">
                            {{ formatPrice(finalTotal) }}
                        </span>

                    </div>

                    <button type="button" class="checkout-button" @click="goToCheckout">
                        ĐI ĐẾN THANH TOÁN
                    </button>

                </div>

            </div>

        </div>


        <!-- =====================================================
             MODAL VOUCHER
        ====================================================== -->

        <div v-if="showVoucherModal" class="modal-overlay" @click.self="closeVoucherModal">

            <div class="voucher-modal">

                <!-- Header -->
                <div class="modal-header">

                    <h3>
                        Chọn Bookstore Voucher
                    </h3>

                    <button type="button" class="close-button" @click="closeVoucherModal">
                        ×
                    </button>

                </div>


                <!-- Danh sách voucher -->
                <div class="voucher-list">

                    <!-- Loading -->
                    <div v-if="voucherLoading" class="voucher-empty">
                        Đang tải voucher...
                    </div>


                    <!-- Error -->
                    <div v-else-if="voucherError" class="voucher-empty voucher-error">
                        {{ voucherError }}
                    </div>


                    <!-- Không có -->
                    <div v-else-if="vouchers.length === 0" class="voucher-empty">
                        Bạn chưa có voucher nào.
                    </div>


                    <!-- Có voucher -->
                    <div v-else v-for="voucher in vouchers" :key="voucher._id" class="voucher-item" :class="{
                        'voucher-selected':
                            selectedVoucher?._id === voucher._id
                    }" @click="selectVoucher(voucher)">

                        <div class="voucher-left">

                            <strong>
                                {{ voucher.code }}
                            </strong>

                            <!-- Phần trăm -->
                            <span v-if="voucher.type === 'percent'">
                                Giảm {{ voucher.value }}%
                            </span>

                            <!-- Giảm tiền -->
                            <span v-else>
                                Giảm
                                {{
                                    Number(
                                        voucher.value || 0
                                    ).toLocaleString("vi-VN")
                                }}đ
                            </span>


                            <!-- Đơn tối thiểu -->
                            <span v-if="voucher.minOrderValue">
                                Đơn tối thiểu
                                {{
                                    Number(
                                        voucher.minOrderValue
                                    ).toLocaleString("vi-VN")
                                }}đ
                            </span>


                            <!-- Giảm tối đa -->
                            <span v-if="voucher.maxDiscount">
                                Giảm tối đa
                                {{
                                    Number(
                                        voucher.maxDiscount
                                    ).toLocaleString("vi-VN")
                                }}đ
                            </span>

                        </div>


                        <div class="voucher-right">

                            <template v-if="voucher.type === 'percent'">
                                -{{ voucher.value }}%
                            </template>

                            <template v-else>
                                -{{
                                    Number(
                                        voucher.value || 0
                                    ).toLocaleString("vi-VN")
                                }}đ
                            </template>

                        </div>

                    </div>

                </div>

            </div>

        </div>


        <!-- =====================================================
             TOAST
        ====================================================== -->

        <Transition name="toast">

            <div v-if="toastMessage" class="cart-toast" :class="{
                'toast-success':
                    toastType === 'success',

                'toast-error':
                    toastType === 'error'
            }">

                <div class="toast-icon">

                    <span v-if="toastType === 'success'">
                        ✓
                    </span>

                    <span v-else>
                        !
                    </span>

                </div>

                <div class="toast-content">
                    {{ toastMessage }}
                </div>

                <button type="button" class="toast-close" @click="closeToast">
                    ×
                </button>

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


<script setup>
import {
    computed,
    onMounted,
    onUnmounted,
    ref
} from "vue";

import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import userService from "@/services/user.service.js";

// ============================================================
// USER STORE
// ============================================================

const userStore = useUserStore();

// ============================================================
// ROUTER
// ============================================================

const router = useRouter();

// ============================================================
// GIỎ HÀNG
// ============================================================

const cartItems = ref([]);
const loading = ref(false);
const errorMessage = ref("");

// ============================================================
// XÓA / CẬP NHẬT SẢN PHẨM
// ============================================================

const deletingItemId = ref(null);
const updatingItemId = ref(null);

// ============================================================
// TOAST
// ============================================================

const toastMessage = ref("");
const toastType = ref("success");

let toastTimer = null;

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

const closeToast = () => {
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    toastMessage.value = "";
};

// ============================================================
// LẤY USER ID
// ============================================================

const getUserId = () => {
    const user = userStore.user;

    if (!user) {
        return null;
    }

    return user._id || user.id || null;
};

// ============================================================
// CHUẨN HÓA RESPONSE API
// ============================================================

const getApiResult = (response) => {
    if (
        response?.data &&
        typeof response.data === "object" &&
        response.data.success !== undefined
    ) {
        return response.data;
    }

    return response;
};

// ============================================================
// CHUẨN HÓA VOUCHER
// ============================================================

/*
 * Backend /vouchers/my trả:
 *
 * [
 *   {
 *      _id: "USER_VOUCHER_ID",
 *      voucherId: {
 *          _id: "VOUCHER_ID",
 *          code: "SALE50K",
 *          description: "...",
 *          type: "fixed",
 *          value: 50000,
 *          minOrderValue: 100000,
 *          maxDiscount: null,
 *          ...
 *      },
 *      userId: "...",
 *      status: 0
 *   }
 * ]
 *
 * Frontend sẽ chuyển thành:
 *
 * [
 *   {
 *      _id: "VOUCHER_ID",
 *      userVoucherId: "USER_VOUCHER_ID",
 *      code: "SALE50K",
 *      description: "...",
 *      type: "fixed",
 *      value: 50000,
 *      minOrderValue: 100000,
 *      maxDiscount: null,
 *      voucherUserStatus: 0
 *   }
 * ]
 */

const normalizeVouchers = (result) => {
    if (!result) {
        return [];
    }

    let list = [];

    if (Array.isArray(result.data)) {
        list = result.data;
    } else if (Array.isArray(result.data?.vouchers)) {
        list = result.data.vouchers;
    } else if (Array.isArray(result.data?.items)) {
        list = result.data.items;
    } else if (Array.isArray(result.vouchers)) {
        list = result.vouchers;
    } else if (Array.isArray(result.items)) {
        list = result.items;
    } else if (Array.isArray(result)) {
        list = result;
    }

    return list
        .map((item) => {
            if (!item) {
                return null;
            }

            /*
             * Trường hợp backend trả:
             *
             * voucherId: {
             *    _id,
             *    code,
             *    value,
             *    ...
             * }
             */

            if (
                item.voucherId &&
                typeof item.voucherId === "object"
            ) {
                const voucher = item.voucherId;

                return {
                    ...voucher,

                    // ID của bản ghi VoucherUser
                    userVoucherId: item._id,

                    // ID voucher thật
                    _id: voucher._id || voucher.id,

                    // Trạng thái user đã lưu / đã dùng
                    voucherUserStatus: Number(item.status ?? 0)
                };
            }

            /*
             * Trường hợp backend trả field voucher
             */

            if (
                item.voucher &&
                typeof item.voucher === "object"
            ) {
                const voucher = item.voucher;

                return {
                    ...voucher,
                    userVoucherId: item._id,
                    _id: voucher._id || voucher.id,
                    voucherUserStatus: Number(item.status ?? 0)
                };
            }

            /*
             * Trường hợp API trả voucher trực tiếp
             */

            if (item.code) {
                return {
                    ...item,
                    userVoucherId:
                        item.userVoucherId ||
                        item._id,
                    voucherUserStatus:
                        Number(item.status ?? 0)
                };
            }

            return null;
        })
        .filter(
            (voucher) =>
                voucher &&
                voucher._id &&
                voucher.code
        );
};

// ============================================================
// LẤY GIỎ HÀNG
// ============================================================

const getCart = async () => {
    const userId = getUserId();

    if (!userId) {
        errorMessage.value =
            "Vui lòng đăng nhập để xem giỏ hàng";

        cartItems.value = [];

        return;
    }

    try {
        loading.value = true;
        errorMessage.value = "";

        const response =
            await userService.getCartByUserId(userId);

        console.log(
            "CART RESPONSE:",
            response
        );

        const result =
            getApiResult(response);

        if (!result?.success) {
            errorMessage.value =
                result?.message ||
                "Không thể lấy giỏ hàng";

            cartItems.value = [];

            return;
        }

        if (Array.isArray(result.data)) {
            cartItems.value =
                result.data;
        } else if (
            Array.isArray(result.data?.items)
        ) {
            cartItems.value =
                result.data.items;
        } else if (
            Array.isArray(result.data?.cartItems)
        ) {
            cartItems.value =
                result.data.cartItems;
        } else {
            cartItems.value = [];
        }

    } catch (error) {
        console.error(
            "Lỗi lấy giỏ hàng:",
            error
        );

        errorMessage.value =
            error?.response?.data?.message ||
            error?.message ||
            "Có lỗi xảy ra khi lấy giỏ hàng";

        cartItems.value = [];

    } finally {
        loading.value = false;
    }
};

// ============================================================
// SHIPPING
// ============================================================

const shippingMethods = ref([
    {
        id: 1,
        name: "Hỏa tốc",
        price: 45000
    },
    {
        id: 2,
        name: "Giao hàng tiết kiệm",
        price: 20000
    },
    {
        id: 3,
        name: "Giao hàng nhanh",
        price: 55000
    }
]);

const selectedShipping = ref(1);

// ============================================================
// VOUCHER
// ============================================================

const vouchers = ref([]);
const voucherLoading = ref(false);
const voucherError = ref("");
const selectedVoucher = ref(null);
const showVoucherModal = ref(false);

// ============================================================
// LẤY VOUCHER CỦA USER
// ============================================================

const fetchVouchers = async () => {
    try {
        voucherLoading.value = true;
        voucherError.value = "";

        const response =
            await userService.getMyVouchers();

        console.log(
            "========== GET MY VOUCHERS =========="
        );

        console.log(
            "MY VOUCHERS RESPONSE:",
            response
        );

        const result =
            getApiResult(response);

        console.log(
            "MY VOUCHERS RESULT:",
            result
        );

        if (!result?.success) {
            vouchers.value = [];

            voucherError.value =
                result?.message ||
                "Không thể lấy danh sách voucher";

            return;
        }

        const list =
            normalizeVouchers(result);

        console.log(
            "VOUCHERS SAU KHI CHUẨN HÓA:",
            list
        );

        vouchers.value = list;

    } catch (error) {
        console.error(
            "LỖI GET MY VOUCHERS:",
            error
        );

        vouchers.value = [];

        voucherError.value =
            error?.response?.data?.message ||
            error?.message ||
            "Không thể lấy danh sách voucher";

    } finally {
        voucherLoading.value = false;
    }
};

// ============================================================
// FORMAT TIỀN
// ============================================================

const formatPrice = (price) => {
    return (
        new Intl.NumberFormat("vi-VN").format(
            Number(price || 0)
        ) + "đ"
    );
};

// ============================================================
// TỔNG SỐ LƯỢNG
// ============================================================

const totalQuantity = computed(() => {
    return cartItems.value.reduce(
        (total, item) => {
            return (
                total +
                Number(item.quantity || 0)
            );
        },
        0
    );
});

// ============================================================
// TỔNG TIỀN SẢN PHẨM
// ============================================================

const productTotal = computed(() => {
    return cartItems.value.reduce(
        (total, item) => {
            const itemTotal =
                item.totalPrice !== undefined
                    ? Number(
                        item.totalPrice || 0
                    )
                    : Number(
                        item.book?.unitPrice || 0
                    ) *
                    Number(
                        item.quantity || 0
                    );

            return total + itemTotal;
        },
        0
    );
});

// ============================================================
// PHÍ VẬN CHUYỂN
// ============================================================

const shippingPrice = computed(() => {
    const shipping =
        shippingMethods.value.find(
            item =>
                item.id ===
                selectedShipping.value
        );

    return shipping
        ? shipping.price
        : 0;
});

// ============================================================
// GIẢM GIÁ VOUCHER
// ============================================================

const voucherDiscount = computed(() => {
    const voucher =
        selectedVoucher.value;

    if (!voucher) {
        return 0;
    }

    const minOrder =
        Number(
            voucher.minOrderValue || 0
        );

    if (
        minOrder > 0 &&
        productTotal.value < minOrder
    ) {
        return 0;
    }

    let discount = 0;

    if (
        voucher.type === "percent" ||
        voucher.type === "percentage"
    ) {
        discount =
            productTotal.value *
            Number(voucher.value || 0) /
            100;

        const maxDiscount =
            Number(
                voucher.maxDiscount || 0
            );

        if (maxDiscount > 0) {
            discount =
                Math.min(
                    discount,
                    maxDiscount
                );
        }

    } else if (
        voucher.type === "fixed" ||
        voucher.type === "amount"
    ) {
        discount =
            Number(
                voucher.value || 0
            );
    }

    return Math.min(
        discount,
        productTotal.value
    );
});

// ============================================================
// TỔNG THANH TOÁN
// ============================================================

const finalTotal = computed(() => {
    return Math.max(
        productTotal.value -
        voucherDiscount.value +
        shippingPrice.value,
        0
    );
});

// ============================================================
// TĂNG SỐ LƯỢNG
// ============================================================

const increaseQuantity = async (item) => {
    const stock =
        Number(item.book?.stock || 0);

    if (
        stock > 0 &&
        Number(item.quantity) >= stock
    ) {
        return;
    }

    item.quantity =
        Number(item.quantity || 0) + 1;

    await updateItemQuantity(item);
};

// ============================================================
// GIẢM SỐ LƯỢNG
// ============================================================

const decreaseQuantity = async (item) => {
    if (
        Number(item.quantity || 0) <= 1
    ) {
        return;
    }

    item.quantity =
        Number(item.quantity) - 1;

    await updateItemQuantity(item);
};

// ============================================================
// CẬP NHẬT SỐ LƯỢNG
// ============================================================

const updateItemQuantity = async (item) => {
    const userId = getUserId();

    if (!userId) {
        showToast(
            "Vui lòng đăng nhập",
            "error"
        );

        return;
    }

    let quantity =
        Number(item.quantity);

    if (
        Number.isNaN(quantity) ||
        quantity < 1
    ) {
        quantity = 1;
    }

    const stock =
        Number(item.book?.stock || 0);

    if (
        stock > 0 &&
        quantity > stock
    ) {
        quantity = stock;
    }

    item.quantity = quantity;

    try {
        updatingItemId.value =
            item._id;

        const response =
            await userService.updateQuantity(
                item._id,
                {
                    userId,
                    quantity
                }
            );

        const result =
            getApiResult(response);

        if (!result?.success) {
            showToast(
                result?.message ||
                "Cập nhật số lượng thất bại",
                "error"
            );

            await getCart();

            return;
        }

        const updatedItem =
            result.data;

        if (updatedItem) {
            const index =
                cartItems.value.findIndex(
                    cartItem =>
                        cartItem._id ===
                        item._id
                );

            if (index !== -1) {
                cartItems.value[index]
                    .quantity =
                    Number(
                        updatedItem.quantity ||
                        quantity
                    );

                const unitPrice =
                    Number(
                        cartItems.value[index]
                            .book?.unitPrice || 0
                    );

                cartItems.value[index]
                    .totalPrice =
                    unitPrice *
                    cartItems.value[index]
                        .quantity;
            }
        }

        window.dispatchEvent(
            new Event("cart-updated")
        );

    } catch (error) {
        console.error(
            "Lỗi cập nhật số lượng:",
            error
        );

        showToast(
            error?.response?.data?.message ||
            error?.message ||
            "Không thể cập nhật số lượng",
            "error"
        );

        await getCart();

    } finally {
        updatingItemId.value = null;
    }
};

// ============================================================
// XÓA SẢN PHẨM
// ============================================================

const removeItem = async (id) => {
    const userId = getUserId();

    if (!userId) {
        showToast(
            "Vui lòng đăng nhập",
            "error"
        );

        return;
    }

    if (
        deletingItemId.value === id
    ) {
        return;
    }

    try {
        deletingItemId.value = id;

        const response =
            await userService.deleteCartItem(
                id,
                userId
            );

        const result =
            getApiResult(response);

        if (result?.success) {
            cartItems.value =
                cartItems.value.filter(
                    item =>
                        item._id !== id
                );

            window.dispatchEvent(
                new Event("cart-updated")
            );

            showToast(
                "Đã xóa sản phẩm khỏi giỏ hàng",
                "success"
            );

        } else {
            showToast(
                result?.message ||
                "Xóa sản phẩm thất bại",
                "error"
            );
        }

    } catch (error) {
        console.error(
            "Lỗi xóa cart:",
            error
        );

        showToast(
            error?.response?.data?.message ||
            error?.message ||
            "Không thể xóa sản phẩm",
            "error"
        );

    } finally {
        deletingItemId.value = null;
    }
};

// ============================================================
// MỞ MODAL VOUCHER
// ============================================================

const openVoucherModal = async () => {
    showVoucherModal.value = true;

    await fetchVouchers();
};

// ============================================================
// ĐÓNG MODAL VOUCHER
// ============================================================

const closeVoucherModal = () => {
    showVoucherModal.value = false;
};

// ============================================================
// CHỌN VOUCHER
// ============================================================

const selectVoucher = (voucher) => {
    if (!voucher) {
        return;
    }

    const minOrder =
        Number(
            voucher.minOrderValue || 0
        );

    if (
        minOrder > 0 &&
        productTotal.value < minOrder
    ) {
        showToast(
            `Đơn hàng phải từ ${formatPrice(minOrder)}`,
            "error"
        );

        return;
    }

    selectedVoucher.value =
        voucher;

    showVoucherModal.value =
        false;

    showToast(
        `Đã chọn voucher ${voucher.code}`,
        "success"
    );
};

// ============================================================
// BỎ VOUCHER
// ============================================================

const removeSelectedVoucher = () => {
    selectedVoucher.value = null;

    showToast(
        "Đã bỏ voucher",
        "success"
    );
};

// ============================================================
// ĐI CHECKOUT
// ============================================================

const goToCheckout = () => {
    if (
        cartItems.value.length === 0
    ) {
        showToast(
            "Giỏ hàng đang trống",
            "error"
        );

        return;
    }

    console.log(
        "THÔNG TIN THANH TOÁN:",
        {
            items:
                cartItems.value,

            shipping:
                selectedShipping.value,

            shippingPrice:
                shippingPrice.value,

            voucher:
                selectedVoucher.value,

            voucherDiscount:
                voucherDiscount.value,

            productTotal:
                productTotal.value,

            finalTotal:
                finalTotal.value
        }
    );

    // Khi có trang checkout:
    router.push("/checkout");
};

// ============================================================
// ON MOUNTED
// ============================================================

onMounted(async () => {
    await getCart();
    await fetchVouchers();
});

// ============================================================
// ON UNMOUNTED
// ============================================================

onUnmounted(() => {
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }
});
</script>


<style scoped>
/* =========================================================
   TOÀN TRANG
========================================================= */

.cart-page {
    width: 100%;
    min-height: calc(100vh - 100px);
    background: #ffffff;
    padding-top: 70px;
    padding-bottom: 100px;
}


/* =========================================================
   CONTAINER
========================================================= */

.cart-container {
    width: 1200px;
    margin: 0 auto;
}


/* =========================================================
   BẢNG GIỎ HÀNG
========================================================= */

.cart-table {
    width: 100%;
}


/* =========================================================
   HEADER
========================================================= */

.cart-header {
    display: grid;

    grid-template-columns:
        minmax(350px, 1fr) 80px 90px 100px 80px;

    align-items: center;

    padding: 0 5px 8px;

    border-bottom: 1px solid #555;

    font-size: 12px;

    color: #555;
}


/* =========================================================
   ITEM
========================================================= */

.cart-item {
    display: grid;

    grid-template-columns:
        minmax(350px, 1fr) 80px 90px 100px 80px;

    align-items: center;

    min-height: 95px;

    padding: 10px 5px;

    border-bottom: 1px solid #eeeeee;

    font-size: 12px;
}


/* =========================================================
   CĂN GIỮA
========================================================= */

.quantity-column,
.total-column,
.action-column {
    text-align: center;
}


/* =========================================================
   PRODUCT
========================================================= */

.product-info {
    display: flex;
    align-items: center;
    gap: 25px;
}


.product-image {
    width: 80px;
    height: 70px;

    display: flex;

    align-items: center;
    justify-content: center;

    overflow: hidden;

    flex-shrink: 0;
}


.product-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}


.product-name {
    line-height: 1.5;
    color: #333;
    padding-right: 10px;
}


/* =========================================================
   PRICE
========================================================= */

.price-column {
    color: #333;
    white-space: nowrap;
}


/* =========================================================
   QUANTITY
========================================================= */

.quantity-box {
    display: flex;

    align-items: center;
    justify-content: center;
}


.quantity-box button {
    display: none;
    width: 25px;
    height: 25px;

    border: 1px solid #eeeeee;

    background: #000000;

    cursor: pointer;
}

.quantity-box input {
    width: 60px;
    height: 25px;
    text-align: center;

    border-radius: 4px;
    border: 1px solid #000000;

    outline: none;

    font-size: 12px;
    background-color: #ffffff;
    color: #000;

    -webkit-appearance: auto;
    appearance: auto;
}

/* Bình thường ẩn mũi tên */
.quantity-box input[type="number"]::-webkit-inner-spin-button,
.quantity-box input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: auto;
    appearance: auto;

    opacity: 0;

    background: transparent;
    border: none;

    display: block;
    margin: 0;

    width: 20px;
    height: 20px;

    transition: opacity 0.2s ease;
}

/* Rê chuột vào ô số lượng thì hiện mũi tên */
.quantity-box input[type="number"]:hover::-webkit-inner-spin-button,
.quantity-box input[type="number"]:hover::-webkit-outer-spin-button {
    opacity: 1;
}
/* =========================================================
   TOTAL
========================================================= */

.item-total {
    color: #52c800;
    white-space: nowrap;
}


/* =========================================================
   DELETE
========================================================= */

.delete-button {
    border: none;

    background: transparent;

    cursor: pointer;

    font-size: 12px;

    color: #333;

    padding: 5px;

    transition:
        color 0.2s ease,
        opacity 0.2s ease;
}


.delete-button:hover:not(:disabled) {
    color: #e53935;
}


.delete-button:disabled {
    opacity: 0.5;
    cursor: wait;
}


.delete-button.is-deleting {
    color: #999;
    cursor: wait;
}


/* =========================================================
   EMPTY
========================================================= */

.empty-cart {
    padding: 40px;

    text-align: center;

    color: #777;

    border-bottom: 1px solid #eee;
}


/* =========================================================
   SHIPPING
========================================================= */

.shipping-section {
    display: flex;

    justify-content: space-between;

    padding: 10px 0 16px;

    border-bottom: 1px solid #dddddd;
}


.shipping-title {
    font-size: 12px;
    color: #333;
}


.shipping-options {
    display: flex;

    flex-direction: column;

    gap: 5px;
}


.shipping-option {
    display: flex;

    align-items: center;

    gap: 5px;

    font-size: 12px;

    color: #555;

    cursor: pointer;
}


/* =========================================================
   BOTTOM
========================================================= */

.cart-bottom {
    display: flex;

    justify-content: space-between;

    align-items: center;

    padding-top: 12px;
}


/* =========================================================
   VOUCHER
========================================================= */

.voucher-section {
    display: flex;

    align-items: center;

    gap: 10px;

    font-size: 12px;
}


.voucher-icon {
    font-size: 16px;
    color: #ff675d;
}


.voucher-name {
    color: #333;
}


.choose-voucher {
    margin-left: 25px;

    border: none;

    background: transparent;

    color: #005bc5;

    font-size: 12px;

    font-weight: 600;

    cursor: pointer;
}


.choose-voucher:hover {
    text-decoration: underline;
}


.selected-voucher {
    display: inline-flex;

    align-items: center;

    gap: 5px;

    color: #71cd14;

    font-size: 12px;
}


.remove-voucher {
    width: 18px;
    height: 18px;

    border: none;

    background: transparent;

    color: #999;

    cursor: pointer;

    font-size: 16px;

    padding: 0;
}


.remove-voucher:hover {
    color: #e53935;
}


/* =========================================================
   CHECKOUT
========================================================= */

.checkout-section {
    display: flex;

    align-items: center;

    gap: 15px;
}


.total-payment {
    display: flex;

    align-items: baseline;

    gap: 3px;

    white-space: nowrap;
}


.total-label {
    color: #555;
    font-size: 12px;
}


.total-price {
    color: #5bc500;
    font-size: 17px;
}


.checkout-button {
    height: 28px;

    padding: 0 17px;

    border: none;

    border-radius: 3px;

    background: #62c900;

    color: #fff;

    font-size: 9px;

    font-weight: 600;

    cursor: pointer;
}


.checkout-button:hover {
    background: #54b800;
}


/* =========================================================
   MODAL
========================================================= */

.modal-overlay {
    position: fixed;

    inset: 0;

    background: rgba(0, 0, 0, 0.45);

    display: flex;

    align-items: center;

    justify-content: center;

    z-index: 9999;
}


.voucher-modal {
    width: 500px;

    max-width: calc(100% - 30px);

    max-height: 80vh;

    background: #fff;

    border-radius: 6px;

    overflow: hidden;

    box-shadow:
        0 10px 40px rgba(0, 0, 0, 0.2);
}


/* =========================================================
   MODAL HEADER
========================================================= */

.modal-header {
    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 15px 20px;

    border-bottom: 1px solid #eee;
}


.modal-header h3 {
    margin: 0;

    font-size: 16px;
}


.close-button {
    border: none;

    background: transparent;

    font-size: 25px;

    cursor: pointer;

    color: #555;
}


/* =========================================================
   VOUCHER LIST
========================================================= */

.voucher-list {
    padding: 15px;

    max-height: 400px;

    overflow-y: auto;
}


/* =========================================================
   VOUCHER ITEM
========================================================= */

.voucher-item {
    display: flex;

    justify-content: space-between;

    align-items: center;

    padding: 15px;

    margin-bottom: 10px;

    border: 1px solid #eeeeee;

    border-radius: 5px;

    cursor: pointer;

    transition:
        border-color 0.2s ease,
        background 0.2s ease;
}


.voucher-item:hover {
    border-color: #71cd14;

    background: #fafff5;
}


.voucher-item.voucher-selected {
    border-color: #71cd14;

    background: #f4fff0;
}


/* =========================================================
   VOUCHER LEFT
========================================================= */

.voucher-left {
    display: flex;

    flex-direction: column;

    gap: 5px;
}


.voucher-left strong {
    color: #71cd14;

    font-size: 14px;
}


.voucher-left span {
    font-size: 12px;

    color: #666;
}


/* =========================================================
   VOUCHER RIGHT
========================================================= */

.voucher-right {
    white-space: nowrap;

    color: #71cd14;

    font-size: 13px;

    font-weight: 600;
}


/* =========================================================
   VOUCHER EMPTY
========================================================= */

.voucher-empty {
    padding: 35px 20px;

    text-align: center;

    color: #999;

    font-size: 13px;
}


.voucher-error {
    color: #e53935;
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
   TOAST ICON
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
   TOAST CONTENT
========================================================= */

.toast-content {
    flex: 1;

    color: #777;

    font-size: 18px;

    line-height: 1.45;

    word-break: break-word;
}


/* =========================================================
   TOAST CLOSE
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

    cursor: pointer;

    padding: 0;
}


.toast-close:hover {
    color: #555;
}


/* =========================================================
   TOAST PROGRESS
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
   TOAST ANIMATION
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

    transform: translateX(100%);
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 800px) {

    .cart-container {
        width: 95%;
    }


    .cart-header,
    .cart-item {

        grid-template-columns:
            minmax(250px, 1fr) 70px 70px 80px 60px;

    }


    .product-info {
        gap: 10px;
    }


    .cart-bottom {
        flex-direction: column;

        align-items: flex-start;

        gap: 20px;
    }


    .checkout-section {
        width: 100%;

        justify-content: flex-end;
    }

}


@media (max-width: 600px) {

    .cart-page {
        padding-top: 30px;
    }


    .cart-container {
        width: calc(100% - 20px);
    }


    .cart-header {
        display: none;
    }


    .cart-item {
        grid-template-columns: 1fr;

        gap: 10px;

        padding: 15px 5px;
    }


    .price-column,
    .quantity-column,
    .total-column,
    .action-column {
        text-align: left;
    }


    .shipping-section {
        flex-direction: column;

        gap: 15px;
    }


    .cart-bottom {
        align-items: stretch;
    }


    .voucher-section {
        flex-wrap: wrap;
    }


    .checkout-section {
        justify-content: space-between;
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
</style>