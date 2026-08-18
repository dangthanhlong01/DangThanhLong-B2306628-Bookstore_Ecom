<template>
    <div class="checkout-page">

        <div class="checkout-container">

            <!-- =====================================================
                 ĐỊA CHỈ
            ====================================================== -->
            <section class="address-box">

                <div class="address-title">
                    <span class="location-icon">●</span>
                    Địa Chỉ Nhận Hàng
                </div>

                <!-- CÓ ĐỊA CHỈ -->
                <div v-if="selectedAddress" class="address-content">

                    <div class="address-user">

                        <strong>
                            {{
                                selectedAddress.receiverName ||
                                profile?.fullName ||
                                'Khách hàng'
                            }}
                        </strong>

                        <span>
                            {{
                                selectedAddress.phone ||
                                profile?.phone ||
                                ''
                            }}
                        </span>

                    </div>

                    <div class="address-detail">
                        {{ formatAddress(selectedAddress) }}
                    </div>

                    <div class="address-actions">

                        <span v-if="selectedAddress.isDefault" class="default-label">
                            Mặc định
                        </span>

                        <button type="button" @click="changeAddress">
                            Thay đổi
                        </button>

                    </div>

                </div>

                <!-- KHÔNG CÓ ĐỊA CHỈ -->
                <div v-else class="address-content">

                    <div class="address-detail empty-address">
                        Chưa có địa chỉ nhận hàng
                    </div>

                    <div class="address-actions">

                        <button type="button" @click="changeAddress">
                            Thêm địa chỉ
                        </button>

                    </div>

                </div>

            </section>


            <!-- =====================================================
                 SẢN PHẨM
            ====================================================== -->
            <section class="product-box">

                <div class="product-header">
                    <div>Sản phẩm</div>
                    <div>Giá</div>
                    <div>Số lượng</div>
                    <div>Tổng tiền</div>
                </div>


                <!-- GIỎ HÀNG TRỐNG -->
                <div v-if="cartItems.length === 0" class="empty-cart">
                    Không có sản phẩm trong giỏ hàng.
                </div>


                <!-- DANH SÁCH SẢN PHẨM -->
                <div v-for="item in cartItems" :key="item._id" class="product-row">

                    <div class="product-info">

                        <div class="product-image">

                            <img :src="getBookImage(item)" alt="" />

                        </div>

                        <div class="product-name">
                            {{ getBookTitle(item) }}
                        </div>

                    </div>


                    <div class="product-price">
                        {{ formatMoney(getBookPrice(item)) }}
                    </div>


                    <div class="product-quantity">
                        {{ getQuantity(item) }}
                    </div>


                    <div class="product-total">
                        {{
                            formatMoney(
                                getBookPrice(item) *
                                getQuantity(item)
                            )
                        }}
                    </div>

                </div>


                <!-- =================================================
                     VẬN CHUYỂN
                ================================================== -->
                <div class="shipping-section">

                    <div class="shipping-title">
                        Chọn đơn vị vận chuyển
                    </div>


                    <div class="shipping-options">

                        <label v-for="shipping in shippingTypes" :key="getShippingId(shipping)" class="shipping-option">

                            <input type="radio" name="shipping" :value="getShippingId(shipping)"
                                v-model="selectedShippingId" @change="handleShippingChange(shipping)" />

                            <span class="shipping-name">
                                {{ getShippingName(shipping) }}
                            </span>

                            <span class="shipping-price">
                                {{ formatMoney(getShippingPrice(shipping)) }}
                            </span>

                        </label>


                        <div v-if="shippingTypes.length === 0" class="empty-shipping">
                            Không có đơn vị vận chuyển.
                        </div>

                    </div>

                </div>


                <!-- =================================================
                     VOUCHER
                ================================================== -->
                <div class="voucher-section">

                    <div class="voucher-left">

                        <span class="voucher-icon">
                            ♢
                        </span>

                        <span>
                            Eiser voucher
                        </span>

                    </div>


                    <button type="button" class="choose-voucher-btn" @click="openVoucherModal">
                        Chọn Mã
                    </button>


                    <div v-if="selectedVoucher" class="selected-voucher">

                        <span>
                            {{
                                getVoucher(selectedVoucher)?.code ||
                                'Voucher'
                            }}
                        </span>

                        <span>
                            -{{ formatMoney(discountAmount) }}
                        </span>

                    </div>

                </div>


                <!-- =================================================
                     TỔNG
                ================================================== -->
                <div class="checkout-total">

                    Tổng thanh toán
                    ({{ totalQuantity }} sản phẩm):

                    <strong>
                        {{ formatMoney(finalTotal) }}
                    </strong>

                </div>

            </section>


            <!-- =====================================================
                 PAYMENT SUMMARY
            ====================================================== -->
            <section class="payment-box">

                <div class="payment-row">

                    <span>
                        Tổng tiền hàng
                    </span>

                    <span>
                        {{ formatMoney(subtotal) }}
                    </span>

                </div>


                <div class="payment-row">

                    <span>
                        Tổng tiền giảm giá
                    </span>

                    <span class="discount-text">
                        -{{ formatMoney(discountAmount) }}
                    </span>

                </div>


                <div class="payment-row">

                    <span>
                        Phí vận chuyển
                    </span>

                    <span>
                        {{ formatMoney(shippingFee) }}
                    </span>

                </div>


                <div class="payment-row payment-final">

                    <span>
                        Tổng thanh toán
                    </span>

                    <strong>
                        {{ formatMoney(finalTotal) }}
                    </strong>

                </div>


                <button type="button" class="order-btn" :disabled="creatingOrder" @click="placeOrder">
                    {{
                        creatingOrder
                            ? 'ĐANG ĐẶT HÀNG...'
                            : 'ĐẶT HÀNG'
                    }}
                </button>

            </section>

        </div>


        <!-- =========================================================
             MODAL CHỌN ĐỊA CHỈ
        ========================================================== -->
        <div v-if="showAddressModal" class="address-overlay" @click.self="closeAddressModal">

            <div class="address-modal">

                <!-- HEADER -->
                <div class="address-modal-header">

                    <h3>
                        Chọn Địa Chỉ Nhận Hàng
                    </h3>

                    <button type="button" class="address-close-btn" @click="closeAddressModal">
                        ×
                    </button>

                </div>


                <!-- BODY -->
                <div class="address-modal-body">

                    <!-- KHÔNG CÓ ĐỊA CHỈ -->
                    <div v-if="addresses.length === 0" class="no-address">

                        <div class="no-address-icon">
                            📍
                        </div>

                        <p>
                            Bạn chưa có địa chỉ giao hàng nào.
                        </p>

                        <button type="button" class="add-new-address-btn" @click="goToAddressPage">
                            + Thêm địa chỉ mới
                        </button>

                    </div>


                    <!-- CÓ ĐỊA CHỈ -->
                    <div v-else class="address-modal-list">

                        <div v-for="address in addresses" :key="address._id" class="address-select-item" :class="{
                            selected:
                                selectedAddress?._id ===
                                address._id
                        }" @click="selectAddress(address)">

                            <!-- RADIO -->
                            <div class="address-radio">

                                <span :class="{
                                    checked:
                                        selectedAddress?._id ===
                                        address._id
                                }"></span>

                            </div>


                            <!-- THÔNG TIN -->
                            <div class="address-select-info">

                                <div class="address-select-top">

                                    <strong>
                                        {{
                                            address.receiverName ||
                                            'Khách hàng'
                                        }}
                                    </strong>

                                    <span>
                                        {{ address.phone }}
                                    </span>

                                </div>


                                <div class="address-select-detail">

                                    {{ formatAddress(address) }}

                                </div>


                                <div v-if="address.isDefault" class="address-default-tag">
                                    Mặc định
                                </div>

                            </div>

                        </div>


                        <!-- NÚT THÊM -->
                        <button type="button" class="add-address-bottom-btn" @click="goToAddressPage">
                            + Thêm địa chỉ mới
                        </button>

                    </div>

                </div>


                <!-- FOOTER -->
                <div class="address-modal-footer">

                    <button type="button" class="address-cancel-btn" @click="closeAddressModal">
                        Hủy
                    </button>

                    <button type="button" class="address-confirm-btn" :disabled="!selectedAddress"
                        @click="confirmAddress">
                        Xác nhận
                    </button>

                </div>

            </div>

        </div>


        <!-- =========================================================
             VOUCHER MODAL
        ========================================================== -->
        <div v-if="showVoucherModal" class="voucher-overlay" @click.self="showVoucherModal = false">

            <div class="voucher-modal">

                <div class="voucher-modal-header">

                    <h3>
                        Chọn Eiser Voucher
                    </h3>

                    <button type="button" @click="showVoucherModal = false">
                        ×
                    </button>

                </div>


                <div class="voucher-list">

                    <div v-if="availableVouchers.length === 0" class="empty-voucher">
                        Bạn chưa có voucher nào có thể sử dụng.
                    </div>


                    <div v-for="item in availableVouchers" :key="getVoucherItemId(item)" class="voucher-card" :class="{
                        selected:
                            getVoucherItemId(selectedVoucher) ===
                            getVoucherItemId(item)
                    }" @click="selectVoucher(item)">

                        <div class="voucher-left-part">

                            <div class="voucher-symbol">
                                S
                            </div>

                            <div class="voucher-code">
                                {{
                                    getVoucher(item)?.code ||
                                    'VOUCHER'
                                }}
                            </div>

                        </div>


                        <div class="voucher-right-part">

                            <div class="voucher-main">

                                <div class="voucher-description">

                                    {{
                                        getVoucherDescription(
                                            getVoucher(item)
                                        )
                                    }}

                                </div>


                                <div class="voucher-condition">

                                    {{
                                        getVoucherMaxText(
                                            getVoucher(item)
                                        )
                                    }}

                                </div>


                                <div class="voucher-progress">

                                    <div class="progress-bg">

                                        <div class="progress-value" :style="{
                                            width:
                                                getVoucherUsedPercent(
                                                    getVoucher(item)
                                                ) + '%'
                                        }"></div>

                                    </div>


                                    <span>

                                        Đã dùng
                                        {{
                                            getVoucherUsedPercent(
                                                getVoucher(item)
                                            )
                                        }}%

                                    </span>

                                </div>


                                <div class="voucher-min-order">

                                    Đơn tối thiểu
                                    {{
                                        formatMoney(
                                            getVoucher(item)
                                                ?.minOrderValue || 0
                                        )
                                    }}

                                </div>

                            </div>


                            <div class="voucher-use">

                                Dùng ngay

                                <span>
                                    ›
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="voucher-modal-footer">

                    <button type="button" class="cancel-btn" @click="showVoucherModal = false">
                        Hủy
                    </button>

                </div>

            </div>

        </div>

    </div>
</template>


<script setup>

import {
    computed,
    onMounted,
    ref
} from 'vue'

import {
    useRouter
} from 'vue-router'

import userService from '../../services/user.service.js'


const router = useRouter()


// =====================================================
// STATE
// =====================================================

const profile = ref(null)

const cartItems = ref([])

const shippingTypes = ref([])

const myVouchers = ref([])


// =====================================================
// ADDRESS
// =====================================================

const addresses = ref([])

const selectedAddress = ref(null)

const showAddressModal = ref(false)


// =====================================================
// SHIPPING
// =====================================================

const selectedShippingId = ref(null)


// =====================================================
// VOUCHER
// =====================================================

const selectedVoucher = ref(null)

const showVoucherModal = ref(false)


// =====================================================
// OTHER
// =====================================================

const note = ref('')

const creatingOrder = ref(false)


// =====================================================
// PROFILE
// =====================================================

const loadProfile = async () => {

    try {

        const response =
            await userService.getProfile()

        const data =
            response?.data?.data ||
            response?.data ||
            {}

        profile.value =
            data?.user ||
            data


        // ==============================
        // LẤY DANH SÁCH ĐỊA CHỈ
        // ==============================

        const profileAddresses =
            Array.isArray(profile.value?.addresses)
                ? profile.value.addresses
                : []


        addresses.value =
            profileAddresses


        // ==============================
        // CHỌN ĐỊA CHỈ MẶC ĐỊNH
        // ==============================

        const defaultAddress =
            addresses.value.find(
                address =>
                    address.isDefault === true
            )


        selectedAddress.value =
            defaultAddress ||
            addresses.value[0] ||
            null

    } catch (error) {

        console.error(
            'LỖI LẤY PROFILE:',
            error
        )

        profile.value = null

        addresses.value = []

        selectedAddress.value = null
    }
}


// =====================================================
// CART
// =====================================================

const loadCart = async () => {
    try {

        const userId =
            profile.value?._id ||
            profile.value?.id ||
            profile.value?.userId

        if (!userId) {
            cartItems.value = []
            return
        }

        const response =
            await userService.getCartByUserId(userId)

        console.log('CART RAW:', response?.data)

        const data =
            response?.data?.data ||
            response?.data ||
            []

        console.log('CART ITEMS:', data)

        if (Array.isArray(data)) {
            cartItems.value = data
        } else {
            cartItems.value =
                data?.items ||
                data?.carts ||
                data?.cartItems ||
                []
        }

        console.log('CART FINAL:', cartItems.value)

    } catch (error) {

        console.error(
            'LỖI LẤY CART:',
            error
        )

        cartItems.value = []
    }
}

// =====================================================
// SHIPPING
// =====================================================

const loadShippingTypes = async () => {

    try {

        const response =
            await userService.getShippingTypes()


        const rawData =
            response?.data?.data ??
            response?.data ??
            []


        let list = []


        if (Array.isArray(rawData)) {

            list = rawData

        } else if (
            Array.isArray(rawData?.items)
        ) {

            list = rawData.items

        } else if (
            Array.isArray(
                rawData?.shippingTypes
            )
        ) {

            list =
                rawData.shippingTypes

        } else if (
            Array.isArray(
                rawData?.data
            )
        ) {

            list =
                rawData.data

        }


        shippingTypes.value =
            list


        if (list.length > 0) {

            selectedShippingId.value =
                getShippingId(
                    list[0]
                )

        } else {

            selectedShippingId.value =
                null
        }

    } catch (error) {

        console.error(
            'LỖI LẤY SHIPPING:',
            error
        )

        shippingTypes.value = []

        selectedShippingId.value =
            null
    }
}


// =====================================================
// VOUCHER
// =====================================================

const loadMyVouchers = async () => {

    try {

        const response =
            await userService.getMyVouchers({
                status: 0,
                limit: 100
            })


        let data =
            response?.data


        if (
            data?.data !== undefined
        ) {

            data =
                data.data
        }


        if (
            data?.vouchers !== undefined
        ) {

            data =
                data.vouchers
        }


        myVouchers.value =
            Array.isArray(data)
                ? data
                : []

    } catch (error) {

        console.error(
            'LỖI LẤY VOUCHER:',
            error
        )

        myVouchers.value = []
    }
}


// =====================================================
// FORMAT ADDRESS
// =====================================================

const formatAddress = (address) => {

    if (!address) {
        return ''
    }


    return [
        address.detail,
        address.district,
        address.province
    ]
        .filter(Boolean)
        .join(', ')
}


// =====================================================
// LOAD ALL
// =====================================================

const loadData = async () => {

    await loadProfile()


    await Promise.all([
        loadCart(),
        loadShippingTypes(),
        loadMyVouchers()
    ])
}


onMounted(() => {

    loadData()

})


// =====================================================
// ADDRESS MODAL
// =====================================================

const changeAddress = () => {

    /*
     * KHÔNG CHUYỂN TRANG /address NỮA.
     * MỞ MODAL CHỌN ĐỊA CHỈ.
     */

    showAddressModal.value = true
}


const closeAddressModal = () => {

    showAddressModal.value = false
}


const selectAddress = (address) => {

    if (!address) {
        return
    }

    selectedAddress.value =
        address
}


const confirmAddress = () => {

    if (!selectedAddress.value) {
        return
    }

    showAddressModal.value = false
}


const goToAddressPage = () => {

    showAddressModal.value = false

    router.push('/user/address')

}


// =====================================================
// CART HELPERS
// =====================================================

const getBook = (item) => {

    if (!item) {
        return {}
    }


    if (
        item.bookId &&
        typeof item.bookId === 'object'
    ) {

        return item.bookId
    }


    if (
        item.book &&
        typeof item.book === 'object'
    ) {

        return item.book
    }


    return {}
}


const getBookId = (item) => {

    if (!item) {
        return null
    }


    if (
        item.bookId &&
        typeof item.bookId === 'object'
    ) {

        return item.bookId?._id
    }


    if (item.bookId) {
        return item.bookId
    }


    if (item.book?._id) {
        return item.book._id
    }


    return null
}


const getBookTitle = (item) => {

    const book =
        getBook(item)


    return (
        book.title ||
        book.name ||
        item?.title ||
        'Sách'
    )
}


const getBookImage = (item) => {

    const book =
        getBook(item)


    if (
        Array.isArray(book.images) &&
        book.images.length > 0
    ) {

        return book.images[0]
    }


    if (book.image) {
        return book.image
    }


    if (item?.image) {
        return item.image
    }


    return '/images/no-image.jpg'
}


const getBookPrice = (item) => {

    const book =
        getBook(item)


    if (
        book.discountPrice !== undefined &&
        Number(book.discountPrice) > 0
    ) {

        return Number(
            book.discountPrice
        )
    }


    if (
        book.price !== undefined
    ) {

        return Number(
            book.price
        )
    }


    if (
        item?.price !== undefined
    ) {

        return Number(
            item.price
        )
    }


    return 0
}


const getQuantity = (item) => {

    return Number(
        item?.quantity ||
        item?.qty ||
        1
    )
}


// =====================================================
// TOTAL
// =====================================================

const subtotal = computed(() => {

    return cartItems.value.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                getBookPrice(item) *
                getQuantity(item)
            )

        },
        0
    )
})


const totalQuantity = computed(() => {

    return cartItems.value.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                getQuantity(item)
            )

        },
        0
    )
})


// =====================================================
// SHIPPING HELPERS
// =====================================================

const getShippingId = (shipping) => {

    if (!shipping) {
        return null
    }


    return (
        shipping._id ||
        shipping.id ||
        shipping.typeShipId ||
        shipping.shippingTypeId ||
        shipping.typeId ||
        null
    )
}


const getShippingName = (shipping) => {

    if (!shipping) {
        return 'Đơn vị vận chuyển'
    }


    return (
        shipping.type ||
        shipping.name ||
        shipping.typeName ||
        shipping.shippingName ||
        shipping.title ||
        shipping.description ||
        'Đơn vị vận chuyển'
    )
}


const getShippingPrice = (shipping) => {

    if (!shipping) {
        return 0
    }


    return Number(
        shipping.price ??
        shipping.shippingFee ??
        shipping.fee ??
        shipping.cost ??
        shipping.shipFee ??
        0
    )
}


const selectedShipping = computed(() => {

    if (!selectedShippingId.value) {
        return null
    }


    return (
        shippingTypes.value.find(
            shipping =>
                String(
                    getShippingId(
                        shipping
                    )
                ) ===
                String(
                    selectedShippingId.value
                )
        ) || null
    )
})


const shippingFee = computed(() => {

    return getShippingPrice(
        selectedShipping.value
    )
})


const handleShippingChange = (
    shipping
) => {

    selectedShippingId.value =
        getShippingId(
            shipping
        )
}


// =====================================================
// VOUCHER HELPERS
// =====================================================

const getVoucher = (item) => {

    if (!item) {
        return null
    }


    if (
        item.voucherId &&
        typeof item.voucherId === 'object'
    ) {

        return item.voucherId
    }


    if (
        item.voucher &&
        typeof item.voucher === 'object'
    ) {

        return item.voucher
    }


    if (
        item.voucherInfo &&
        typeof item.voucherInfo === 'object'
    ) {

        return item.voucherInfo
    }


    if (
        item.code ||
        item.voucherCode
    ) {

        return item
    }


    if (
        item.voucherId &&
        (
            typeof item.voucherId === 'string' ||
            typeof item.voucherId === 'number'
        )
    ) {

        const voucherId =
            String(
                item.voucherId
            )


        const found =
            myVouchers.value.find(
                voucherItem => {

                    const id =
                        voucherItem?._id

                    const nestedId =
                        voucherItem?.voucher?._id

                    const nestedVoucherId =
                        typeof voucherItem?.voucherId === 'object'
                            ? voucherItem?.voucherId?._id
                            : voucherItem?.voucherId


                    return (
                        String(id) === voucherId ||
                        String(nestedId) === voucherId ||
                        String(nestedVoucherId) === voucherId
                    )

                }
            )


        if (found) {

            if (
                found.voucher &&
                typeof found.voucher === 'object'
            ) {

                return found.voucher
            }


            if (
                found.voucherId &&
                typeof found.voucherId === 'object'
            ) {

                return found.voucherId
            }


            return found
        }

    }


    return null
}


// =====================================================
// VOUCHER ITEM ID
// =====================================================

const getVoucherItemId = (item) => {

    if (!item) {
        return null
    }


    const voucher =
        getVoucher(item)


    if (voucher?._id) {

        return String(
            voucher._id
        )
    }


    if (item?.voucherId) {

        if (
            typeof item.voucherId === 'object'
        ) {

            return String(
                item.voucherId?._id || ''
            )
        }


        return String(
            item.voucherId
        )
    }


    return item?._id
        ? String(item._id)
        : null
}


// =====================================================
// AVAILABLE VOUCHERS
// =====================================================

const availableVouchers =
    computed(() => {

        const now =
            new Date()


        return myVouchers.value.filter(
            item => {

                const voucher =
                    getVoucher(item)


                if (!voucher) {
                    return false
                }


                const voucherStatus =
                    voucher.status


                if (
                    voucherStatus !== undefined &&
                    voucherStatus !== null &&
                    String(
                        voucherStatus
                    ).toLowerCase() !== 'active' &&
                    String(
                        voucherStatus
                    ) !== '1' &&
                    String(
                        voucherStatus
                    ).toLowerCase() !== 'true'
                ) {

                    return false
                }


                if (
                    item?.status !== undefined &&
                    item?.status !== null &&
                    Number(item.status) !== 0
                ) {

                    return false
                }


                if (
                    voucher.startDate &&
                    now < new Date(
                        voucher.startDate
                    )
                ) {

                    return false
                }


                if (
                    voucher.endDate &&
                    now > new Date(
                        voucher.endDate
                    )
                ) {

                    return false
                }


                const quantity =
                    Number(
                        voucher.quantity ?? 0
                    )


                const usedCount =
                    Number(
                        voucher.usedCount ?? 0
                    )


                if (
                    quantity > 0 &&
                    usedCount >= quantity
                ) {

                    return false
                }


                const minOrder =
                    Number(
                        voucher.minOrderValue ?? 0
                    )


                if (
                    subtotal.value <
                    minOrder
                ) {

                    return false
                }


                return true

            }
        )

    })


// =====================================================
// VOUCHER TEXT
// =====================================================

const getVoucherDescription = (
    voucher
) => {

    if (!voucher) {
        return 'Voucher giảm giá'
    }


    if (voucher.description) {
        return voucher.description
    }


    if (
        voucher.type === 'percent'
    ) {

        return `Giảm ${voucher.value}%`
    }


    return `Giảm ${formatMoney(
        voucher.value
    )}`
}


const getVoucherMaxText = (
    voucher
) => {

    if (!voucher) {
        return ''
    }


    if (
        voucher.type === 'percent'
    ) {

        if (
            voucher.maxDiscount !== null &&
            voucher.maxDiscount !== undefined
        ) {

            return `Giảm tối đa ${formatMoney(
                voucher.maxDiscount
            )}`
        }


        return `Giảm ${voucher.value}%`
    }


    return `Giảm ${formatMoney(
        voucher.value
    )}`
}


const getVoucherUsedPercent = (
    voucher
) => {

    if (!voucher) {
        return 0
    }


    const quantity =
        Number(
            voucher.quantity || 0
        )


    const usedCount =
        Number(
            voucher.usedCount || 0
        )


    if (quantity <= 0) {
        return 0
    }


    return Math.min(
        100,
        Math.round(
            (
                usedCount /
                quantity
            ) *
            100
        )
    )
}


// =====================================================
// DISCOUNT
// =====================================================

const calculateVoucherDiscount = (
    voucher
) => {

    if (!voucher) {
        return 0
    }


    let discount = 0


    if (
        voucher.type === 'percent'
    ) {

        discount =
            subtotal.value *
            Number(
                voucher.value || 0
            ) /
            100


        if (
            voucher.maxDiscount !== null &&
            voucher.maxDiscount !== undefined
        ) {

            discount =
                Math.min(
                    discount,
                    Number(
                        voucher.maxDiscount
                    )
                )
        }

    } else {

        discount =
            Number(
                voucher.value || 0
            )

    }


    return Math.min(
        discount,
        subtotal.value
    )
}


const discountAmount =
    computed(() => {

        const voucher =
            getVoucher(
                selectedVoucher.value
            )


        return calculateVoucherDiscount(
            voucher
        )

    })


const finalTotal =
    computed(() => {

        return Math.max(
            0,
            subtotal.value -
            discountAmount.value +
            shippingFee.value
        )

    })


// =====================================================
// OPEN VOUCHER
// =====================================================

const openVoucherModal = () => {

    showVoucherModal.value =
        true
}


// =====================================================
// SELECT VOUCHER
// =====================================================

const selectVoucher = async (
    item
) => {

    const voucher =
        getVoucher(item)


    if (!voucher) {

        alert(
            'Không tìm thấy thông tin voucher'
        )

        return
    }


    if (!voucher.code) {

        alert(
            'Voucher không có mã code'
        )

        return
    }


    try {

        const result =
            await userService.validateVoucher(
                voucher.code,
                subtotal.value
            )


        if (
            result?.data?.success === false
        ) {

            alert(
                result?.data?.message ||
                'Voucher không thể sử dụng'
            )

            return
        }


        selectedVoucher.value =
            item


        showVoucherModal.value =
            false

    } catch (error) {

        alert(
            error?.response?.data?.message ||
            error?.message ||
            'Voucher không thể sử dụng'
        )

    }

}


// =====================================================
// PLACE ORDER
// =====================================================

const placeOrder = async () => {
    if (cartItems.value.length === 0) {
        alert('Giỏ hàng đang trống')
        return
    }

    if (!selectedAddress.value) {
        alert('Vui lòng chọn địa chỉ nhận hàng')
        return
    }

    if (!selectedShippingId.value) {
        alert('Vui lòng chọn đơn vị vận chuyển')
        return
    }

    creatingOrder.value = true

    try {
        const voucher = getVoucher(selectedVoucher.value)

        // =================================================
        // 1. TẠO ĐƠN HÀNG
        // =================================================
        const orderData = {
            addressUserId:
                selectedAddress.value?._id ||
                profile.value?.addressUserId ||
                profile.value?.addressId ||
                null,

            statusId: null,

            typeShipId: selectedShippingId.value,

            voucherId:
                voucher?._id || null,

            note:
                note.value || null,

            isPaymentOnline: false,

            shipperId: null,

            image: null
        }

        const orderResponse =
            await userService.createOrderBook(orderData)

        const order =
            orderResponse?.data?.data ||
            orderResponse?.data

        const orderId = order?._id

        if (!orderId) {
            throw new Error('Không lấy được ID đơn hàng')
        }

        // =================================================
        // 2. TẠO ORDER DETAIL
        // =================================================
        for (const item of cartItems.value) {
            const bookId = getBookId(item)

            if (!bookId) {
                continue
            }

            const detailData = {
                bookId: bookId,
                quantity: getQuantity(item),
                realPrice: getBookPrice(item)
            }

            await userService.createOrderDetail(
                orderId,
                detailData
            )
        }

        // =================================================
        // 3. XÓA GIỎ HÀNG
        // =================================================
        const userId =
            profile.value?._id ||
            profile.value?.id ||
            profile.value?.userId

        if (userId) {
            await userService.clearCart(userId)
        }

        // Lấy lại giỏ hàng từ database
        cartItems.value = []
        window.dispatchEvent(
            new Event('cart-updated')
        )
    
        // =================================================
        // 4. THÔNG BÁO + CHUYỂN TRANG
        // =================================================
        alert('Đặt hàng thành công!')

        router.push('/user/orders')

    } catch (error) {
        console.error('LỖI ĐẶT HÀNG:', error)

        alert(
            error?.response?.data?.message ||
            error?.message ||
            'Không thể đặt hàng'
        )

    } finally {
        creatingOrder.value = false
    }
}


// =====================================================
// FORMAT MONEY
// =====================================================

const formatMoney = (
    value
) => {

    return (
        Number(
            value || 0
        ).toLocaleString('vi-VN') +
        'đ'
    )

}

</script>


<style scoped>
/* =====================================================
   GLOBAL
===================================================== */

* {
    box-sizing: border-box;
}


/* =====================================================
   CHECKOUT
===================================================== */

.checkout-page {

    background: #f5f5f5;

    min-height: 100vh;

    padding:
        15px 0 40px;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    color: #333;

}


.checkout-container {

    width: 748px;

    margin: 0 auto;

}


/* =====================================================
   ADDRESS BOX
===================================================== */

.address-box {

    background: white;

    margin-bottom: 12px;

    border-top: 3px solid transparent;

    border-image:
        repeating-linear-gradient(90deg,
            #5da9e9 0 28px,
            white 28px 32px,
            #ed687b 32px 60px,
            white 60px 64px) 1;

}


.address-title {

    padding:
        16px 18px 8px;

    color: #58b51a;

    font-size: 14px;

    font-weight: 500;

}


.location-icon {

    font-size: 15px;

    margin-right: 7px;

}


.address-content {

    min-height: 55px;

    display: flex;

    align-items: center;

    padding:
        5px 18px 15px;

    gap: 25px;

}


.address-user {

    width: 280px;

    display: flex;

    flex-direction: column;

    gap: 6px;

    font-size: 12px;

    flex-shrink: 0;

}


.address-user span {

    font-size: 12px;

}


.address-detail {

    flex: 1;

    font-size: 12px;

}


.empty-address {

    color: #999;

}


.address-actions {

    display: flex;

    gap: 12px;

    align-items: center;

    font-size: 12px;

    white-space: nowrap;

}


.default-label {

    color: #999;

}


.address-actions button {

    border: none;

    background: transparent;

    color: #1675d1;

    cursor: pointer;

    padding: 0;

}


.address-actions button:hover {

    color: #f4512c;

}


/* =====================================================
   PRODUCT
===================================================== */

.product-box {

    background: white;

    padding:
        0 12px 16px;

}


.product-header {

    display: grid;

    grid-template-columns:
        1fr 100px 80px 100px;

    padding:
        12px 8px;

    border-bottom:
        1px solid #ddd;

    color: #555;

    font-size: 11px;

}


.product-header div:not(:first-child) {

    text-align: center;

}


.product-row {

    display: grid;

    grid-template-columns:
        1fr 100px 80px 100px;

    align-items: center;

    min-height: 95px;

    border-bottom:
        1px solid #eee;

    padding:
        10px 8px;

    font-size: 11px;

}


.product-info {

    display: flex;

    align-items: center;

    gap: 18px;

}


.product-image {

    width: 88px;

    height: 60px;

    border:
        1px solid #eee;

    display: flex;

    justify-content: center;

    align-items: center;

    overflow: hidden;

    flex-shrink: 0;

}


.product-image img {

    width: 100%;

    height: 100%;

    object-fit: contain;

}


.product-name {

    max-width: 380px;

    line-height: 1.5;

}


.product-price,
.product-quantity,
.product-total {

    text-align: center;

}


.product-total {

    color: #55b400;

}


.empty-cart {

    text-align: center;

    padding: 30px;

    color: #999;

    font-size: 13px;

}


/* =====================================================
   SHIPPING
===================================================== */

.shipping-section {

    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    padding:
        15px 8px 20px;

    border-bottom:
        1px solid #eee;

}


.shipping-title {

    font-size: 13px;

    color: #333;

    padding-top: 4px;

}


.shipping-options {

    width: 200px;

    display: flex;

    flex-direction: column;

    gap: 10px;

}


.shipping-option {

    display: grid;

    grid-template-columns:
        18px 1fr auto;

    align-items: center;

    column-gap: 7px;

    cursor: pointer;

    font-size: 12px;

    color: #555;

    width: 100%;

}


.shipping-option input[type="radio"] {

    margin: 0;

    accent-color: #2196f3;

}


.shipping-name {

    text-align: left;

}


.shipping-price {

    text-align: right;

    color: #55a900;

    font-weight: 500;

    white-space: nowrap;

}


.empty-shipping {

    text-align: right;

    color: #999;

    font-size: 12px;

}


/* =====================================================
   VOUCHER
===================================================== */

.voucher-section {

    display: flex;

    align-items: center;

    padding:
        13px 8px;

    border-bottom:
        1px solid #eee;

    gap: 12px;

}


.voucher-left {

    display: flex;

    align-items: center;

    gap: 6px;

    color: #555;

    font-size: 12px;

}


.voucher-icon {

    color: #f04b31;

}


.choose-voucher-btn {

    border: none;

    background: transparent;

    color: #1675d1;

    cursor: pointer;

    font-size: 12px;

}


.selected-voucher {

    margin-left: auto;

    color: #f04b31;

    font-size: 11px;

    display: flex;

    gap: 8px;

}


/* =====================================================
   CHECKOUT TOTAL
===================================================== */

.checkout-total {

    display: flex;

    justify-content: flex-end;

    align-items: center;

    gap: 5px;

    padding: 8px;

    font-size: 13px;

}


.checkout-total strong {

    color: #55b400;

    font-size: 16px;

    font-weight: 500;

}


/* =====================================================
   PAYMENT
===================================================== */

.payment-box {

    margin-top: 15px;

    background: white;

    padding:
        20px 35px;

    overflow: hidden;

}


.payment-row {

    display: flex;

    justify-content: space-between;

    padding: 6px 0;

    font-size: 13px;

    color: #777;

}


.discount-text {

    color: #55b400;

}


.payment-final {

    font-size: 15px;

    color: #555;

    border-top:
        1px solid #eee;

    margin-top: 5px;

    padding-top: 14px;

}


.payment-final strong {

    color: #55b400;

    font-size: 18px;

    font-weight: 500;

}


.order-btn {

    margin-top: 15px;

    width: 130px;

    height: 35px;

    border: none;

    background: #439b08;

    color: white;

    cursor: pointer;

    font-size: 11px;

    float: right;

}


.order-btn:hover {

    background: #368000;

}


.order-btn:disabled {

    background: #aaa;

    cursor: not-allowed;

}


/* =====================================================
   ADDRESS MODAL
===================================================== */

.address-overlay {

    position: fixed;

    inset: 0;

    background:
        rgba(0,
            0,
            0,
            0.48);

    display: flex;

    align-items: center;

    justify-content: center;

    z-index: 9998;

    padding: 20px;

}


.address-modal {

    width: 520px;

    max-width: 100%;

    max-height:
        calc(100vh - 40px);

    background: white;

    border-radius: 4px;

    box-shadow:
        0 8px 35px rgba(0,
            0,
            0,
            0.25);

    display: flex;

    flex-direction: column;

    overflow: hidden;

}


.address-modal-header {

    height: 56px;

    padding:
        0 18px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    border-bottom:
        1px solid #eee;

    flex-shrink: 0;

}


.address-modal-header h3 {

    margin: 0;

    font-size: 16px;

    font-weight: 500;

    color: #333;

}


.address-close-btn {

    border: none;

    background: transparent;

    font-size: 26px;

    line-height: 1;

    color: #777;

    cursor: pointer;

}


.address-close-btn:hover {

    color: #222;

}


/* =====================================================
   ADDRESS MODAL BODY
===================================================== */

.address-modal-body {

    padding: 14px 18px;

    overflow-y: auto;

    max-height:
        calc(100vh - 160px);

}


.address-modal-list {

    display: flex;

    flex-direction: column;

    gap: 10px;

}


.address-select-item {

    display: flex;

    align-items: flex-start;

    gap: 12px;

    padding:
        14px;

    border:
        1px solid #ddd;

    cursor: pointer;

    transition:
        border-color 0.15s,
        background 0.15s;

}


.address-select-item:hover {

    border-color: #aaa;

}


.address-select-item.selected {

    border-color: #f4512c;

    background:
        #fffaf8;

}


/* RADIO */

.address-radio {

    width: 18px;

    height: 18px;

    border:
        1px solid #aaa;

    border-radius: 50%;

    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;

    margin-top: 1px;

}


.address-radio span {

    width: 9px;

    height: 9px;

    border-radius: 50%;

    background: transparent;

}


.address-radio span.checked {

    background: #f4512c;

}


/* INFO */

.address-select-info {

    flex: 1;

    min-width: 0;

}


.address-select-top {

    display: flex;

    align-items: center;

    gap: 12px;

    margin-bottom: 7px;

    font-size: 12px;

}


.address-select-top strong {

    font-weight: 600;

    color: #333;

}


.address-select-top span {

    color: #666;

}


.address-select-detail {

    color: #555;

    font-size: 12px;

    line-height: 1.5;

    word-break: break-word;

}


.address-default-tag {

    display: inline-block;

    margin-top: 8px;

    padding:
        3px 6px;

    border:
        1px solid #f4512c;

    color: #f4512c;

    font-size: 10px;

}


/* =====================================================
   ADD ADDRESS
===================================================== */

.add-address-bottom-btn {

    width: 100%;

    padding: 11px;

    border:
        1px dashed #f4512c;

    background: white;

    color: #f4512c;

    font-size: 12px;

    cursor: pointer;

}


.add-address-bottom-btn:hover {

    background: #fff8f5;

}


/* =====================================================
   EMPTY ADDRESS
===================================================== */

.no-address {

    text-align: center;

    padding:
        40px 20px;

    color: #999;

}


.no-address-icon {

    font-size: 40px;

    margin-bottom: 10px;

}


.no-address p {

    font-size: 13px;

    margin:
        0 0 18px;

}


.add-new-address-btn {

    border: none;

    background: #f4512c;

    color: white;

    padding:
        10px 16px;

    cursor: pointer;

    font-size: 12px;

}


.add-new-address-btn:hover {

    background: #df3f1d;

}


/* =====================================================
   ADDRESS MODAL FOOTER
===================================================== */

.address-modal-footer {

    padding:
        12px 18px;

    border-top:
        1px solid #eee;

    display: flex;

    justify-content: flex-end;

    gap: 10px;

    flex-shrink: 0;

}


.address-modal-footer button {

    min-width: 80px;

    padding:
        9px 15px;

    font-size: 12px;

    cursor: pointer;

}


.address-cancel-btn {

    border:
        1px solid #ddd;

    background: white;

    color: #555;

}


.address-cancel-btn:hover {

    background: #f5f5f5;

}


.address-confirm-btn {

    border: none;

    background: #f4512c;

    color: white;

}


.address-confirm-btn:hover {

    background: #df3f1d;

}


.address-confirm-btn:disabled {

    background: #aaa;

    cursor: not-allowed;

}


/* =====================================================
   VOUCHER MODAL
===================================================== */

.voucher-overlay {

    position: fixed;

    inset: 0;

    background:
        rgba(0,
            0,
            0,
            0.48);

    display: flex;

    align-items: center;

    justify-content: center;

    z-index: 9999;

}


.voucher-modal {

    width: 450px;

    background: white;

    border-radius: 3px;

    box-shadow:
        0 5px 30px rgba(0,
            0,
            0,
            0.25);

}


.voucher-modal-header {

    height: 50px;

    display: flex;

    justify-content: space-between;

    align-items: center;

    padding:
        0 12px;

    border-bottom:
        1px solid #ddd;

}


.voucher-modal-header h3 {

    font-size: 15px;

    font-weight: 400;

    margin: 0;

}


.voucher-modal-header button {

    border: none;

    background: transparent;

    font-size: 20px;

    color: #555;

    cursor: pointer;

}


.voucher-list {

    padding: 12px;

    max-height: 380px;

    overflow-y: auto;

}


.voucher-card {

    height: 100px;

    display: flex;

    margin-bottom: 12px;

    border:
        1px solid #ddd;

    cursor: pointer;

    transition:
        0.15s;

}


.voucher-card:hover {

    border-color: #f04b31;

}


.voucher-card.selected {

    border:
        1px solid #f04b31;

}


.voucher-left-part {

    width: 112px;

    background: #f45132;

    color: white;

    position: relative;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

}


.voucher-left-part::before,
.voucher-left-part::after {

    content: "";

    position: absolute;

    width: 14px;

    height: 14px;

    background: white;

    border-radius: 50%;

    left: -7px;

}


.voucher-left-part::before {

    top: 14px;

}


.voucher-left-part::after {

    bottom: 14px;

}


.voucher-symbol {

    width: 26px;

    height: 26px;

    border:
        2px solid white;

    display: flex;

    justify-content: center;

    align-items: center;

    font-size: 14px;

    margin-bottom: 4px;

}


.voucher-code {

    font-size: 10px;

    font-weight: 600;

}


.voucher-right-part {

    flex: 1;

    display: flex;

    justify-content: space-between;

    padding:
        10px 10px 8px 12px;

}


.voucher-main {

    min-width: 0;

}


.voucher-description {

    font-size: 13px;

    margin-bottom: 4px;

}


.voucher-condition {

    font-size: 9px;

    color: #999;

}


.voucher-progress {

    display: flex;

    align-items: center;

    gap: 5px;

    margin-top: 5px;

}


.progress-bg {

    width: 75px;

    height: 6px;

    background: #e5e5e5;

    border-radius: 4px;

    overflow: hidden;

}


.progress-value {

    height: 100%;

    background: #f45132;

}


.voucher-progress span {

    color: #f45132;

    font-size: 8px;

}


.voucher-min-order {

    margin-top: 5px;

    color: #999;

    font-size: 9px;

}


.voucher-use {

    color: #f45132;

    font-size: 10px;

    white-space: nowrap;

}


.voucher-use span {

    font-size: 16px;

    vertical-align: -1px;

}


.voucher-modal-footer {

    border-top:
        1px solid #eee;

    padding: 10px;

    display: flex;

    justify-content: flex-end;

}


.cancel-btn {

    border: none;

    background: #6c757d;

    color: white;

    padding:
        7px 13px;

    border-radius: 2px;

    cursor: pointer;

    font-size: 11px;

}


.empty-voucher {

    text-align: center;

    color: #999;

    font-size: 12px;

    padding: 30px 0;

}


/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 800px) {

    .checkout-container {

        width:
            calc(100% - 20px);

    }


    .address-content {

        flex-wrap: wrap;

    }


    .address-user {

        width: 100%;

    }


    .address-detail {

        width: 100%;

        flex: none;

    }


    .product-header,
    .product-row {

        grid-template-columns:
            1fr 80px 60px 90px;

    }


    .product-name {

        max-width: 250px;

    }


    .shipping-section {

        gap: 20px;

    }


    .shipping-options {

        width: 300px;

    }


    .address-modal {

        width: 100%;

    }

}
</style>