<template>
    <div class="order-history">

        <!-- =====================================================
             TABS TRẠNG THÁI
        ====================================================== -->
        <div class="status-tabs">

            <button v-for="tab in statusTabs" :key="tab.value" type="button" class="status-tab"
                :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">
                {{ tab.label }}
            </button>

        </div>


        <!-- =====================================================
             Ô TÌM KIẾM (theo tên sản phẩm / mã đơn)
        ====================================================== -->
        <div class="search-bar">

            <input type="text" v-model="searchKeyword" placeholder="Tìm đơn hàng theo tên sản phẩm hoặc mã đơn" />

        </div>


        <!-- =====================================================
             LOADING
        ====================================================== -->
        <div v-if="loading" class="state-box">
            Đang tải đơn hàng...
        </div>


        <!-- =====================================================
             LỖI
        ====================================================== -->
        <div v-else-if="loadError" class="state-box error-box">
            {{ loadError }}
            <button type="button" class="retry-btn" @click="loadOrders">Thử lại</button>
        </div>


        <!-- =====================================================
             RỖNG
        ====================================================== -->
        <div v-else-if="filteredOrders.length === 0" class="state-box empty-box">

            <div class="empty-icon">🛍</div>
            <p>Chưa có đơn hàng nào ở trạng thái này</p>
            <router-link to="/" class="shop-now-btn">Mua sắm ngay</router-link>

        </div>


        <!-- =====================================================
             DANH SÁCH ĐƠN HÀNG
        ====================================================== -->
        <div v-else class="order-list">

            <div v-for="order in filteredOrders" :key="order._id" class="order-card">

                <!-- HEADER: mã đơn + trạng thái -->
                <div class="order-card-header" @click="goToOrderDetail(order._id)">

                    <div class="order-shop">
                        <span class="shop-icon">
                            <img src="../../assets/logo.jpg" alt="Eiser Shop" />
                        </span>
                        <span class="shop-name"> shop</span>
                        <span class="order-code">#{{ shortId(order._id) }}</span>
                    </div>

                    <div class="order-status" :class="statusClass(order.statusId)">
                        {{ statusLabel(order.statusId) }}
                    </div>

                </div>


                <!-- LOADING RIÊNG CHO DETAILS -->
                <div v-if="order._loadingDetails" class="order-items-loading">
                    Đang tải sản phẩm...
                </div>


                <!-- DANH SÁCH SẢN PHẨM TRONG ĐƠN -->
                <div v-else class="order-items" @click="goToOrderDetail(order._id)">

                    <div v-for="detail in order._details" :key="detail._id" class="order-item-row">

                        <div class="order-item-image">
                            <img :src="getBookImage(detail)" alt="" />
                        </div>

                        <div class="order-item-info">
                            <div class="order-item-name">{{ getBookTitle(detail) }}</div>
                            <div class="order-item-qty">x{{ getQuantity(detail) }}</div>
                        </div>

                        <div class="order-item-price">
                            {{ formatMoney(getRealPrice(detail)) }}
                        </div>

                    </div>


                    <div v-if="order._details.length === 0" class="order-item-empty">
                        Không có sản phẩm trong đơn hàng này
                    </div>

                </div>


                <!-- FOOTER: tổng tiền + hành động -->
                <div class="order-card-footer">

                    <div class="order-total">
                        Tổng số tiền:
                        <strong>{{ formatMoney(getOrderTotal(order)) }}</strong>
                    </div>

                    <div class="order-actions">

                        <button type="button" class="detail-btn" @click.stop="goToBookDetail(order._details[0])">
                            Xem chi tiết
                        </button>

                        <button v-if="canCancel(order.statusId)" type="button" class="cancel-btn"
                            :disabled="order._cancelling" @click.stop="cancelOrder(order)">
                            {{ order._cancelling ? 'Đang hủy...' : 'Hủy đơn' }}
                        </button>

                    </div>

                </div>

            </div>

        </div>

    </div>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '../../services/user.service.js'

const router = useRouter()

// =====================================================
// STATE
// =====================================================

const orders = ref([])
const loading = ref(true)
const loadError = ref('')
const searchKeyword = ref('')
const activeTab = ref('all')

// =====================================================
// TABS
// Chỉnh lại "value" cho khớp đúng giá trị statusId thật
// đang lưu trong DB nếu khác với quy ước dưới đây.
// =====================================================

const statusTabs = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
]

const statusLabelMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
}

const statusLabel = (statusId) => {
    return statusLabelMap[statusId] || statusId || 'Không rõ'
}

const statusClass = (statusId) => {
    return `status-${statusId || 'unknown'}`
}

// Chỉ cho hủy khi đơn còn ở trạng thái đầu (chưa giao/hoàn thành/đã hủy)
const canCancel = (statusId) => {
    return statusId === 'pending' || statusId === 'confirmed'
}

// =====================================================
// LOAD DANH SÁCH ĐƠN HÀNG
// =====================================================

const loadOrders = async () => {

    loading.value = true
    loadError.value = ''

    try {

        const response = await userService.getOrderBooks()

        const data = response?.data?.data || response?.data || []

        const list = Array.isArray(data)
            ? data
            : (data?.items || data?.orders || [])

        orders.value = list.map((order) => ({
            ...order,
            _details: Array.isArray(order.details) ? order.details : [],
            _loadingDetails: !Array.isArray(order.details),
            _cancelling: false,
        }))

        // Với đơn nào chưa có sẵn "details" trong response,
        // gọi thêm API lấy chi tiết sản phẩm của đơn đó
        await Promise.all(
            orders.value.map(async (order) => {
                if (Array.isArray(order.details)) {
                    return
                }
                try {
                    const detailRes = await userService.getOrderDetails(order._id)
                    const detailData =
                        detailRes?.data?.data ||
                        detailRes?.data ||
                        []

                    order._details =
                        Array.isArray(detailData)
                            ? detailData
                            : (
                                detailData?.items ||
                                detailData?.details ||
                                detailData?.orderDetails ||
                                []
                            )

                    console.log(
                        '========== ORDER DETAIL =========='
                    )

                    console.log(
                        'ORDER ID:',
                        order._id
                    )

                    console.log(
                        'DETAIL RAW:',
                        JSON.parse(JSON.stringify(order._details))
                    )

                    console.log(
                        'DETAIL 0:',
                        JSON.parse(
                            JSON.stringify(order._details?.[0] || null)
                        )
                    )

                    console.log(
                        'BOOK ID:',
                        order._details?.[0]?.bookId
                    )

                    console.log(
                        'BOOK:',
                        order._details?.[0]?.book
                    )

                    console.log(
                        'BOOK IMAGES:',
                        order._details?.[0]?.bookId?.images
                    )

                    console.log(
                        '================================='
                    )
                } catch (error) {
                    console.error('LỖI LẤY CHI TIẾT ĐƠN:', error)
                    order._details = []
                } finally {
                    order._loadingDetails = false
                }
            })
        )

    } catch (error) {
        console.error('LỖI LẤY DANH SÁCH ĐƠN HÀNG:', error)
        loadError.value =
            error?.response?.data?.message ||
            error?.message ||
            'Không thể tải danh sách đơn hàng'
        orders.value = []
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadOrders()
})

// =====================================================
// LỌC THEO TAB + TÌM KIẾM
// =====================================================

const filteredOrders = computed(() => {

    let list = orders.value

    if (activeTab.value !== 'all') {
        list = list.filter((order) => order.statusId === activeTab.value)
    }

    const keyword = searchKeyword.value.trim().toLowerCase()

    if (keyword) {
        list = list.filter((order) => {
            const matchId = String(order._id || '').toLowerCase().includes(keyword)
            const matchProduct = (order._details || []).some((detail) =>
                getBookTitle(detail).toLowerCase().includes(keyword)
            )
            return matchId || matchProduct
        })
    }

    return list
})

// =====================================================
// HELPERS SẢN PHẨM (giống pattern trong checkout.vue)
// =====================================================

const getBook = (detail) => {
    if (!detail) return {}
    if (detail.bookId && typeof detail.bookId === 'object') return detail.bookId
    if (detail.book && typeof detail.book === 'object') return detail.book
    return {}
}

const getBookTitle = (detail) => {
    const book = getBook(detail)
    return book.title || book.name || detail?.title || 'Sách'
}

const getBookImage = (detail) => {
    const book = getBook(detail)

    let image = null

    // ==========================================
    // LẤY ẢNH
    // ==========================================

    if (Array.isArray(book?.images) && book.images.length > 0) {
        image = book.images[0]
    }

    if (!image && book?.image) {
        image = book.image
    }

    if (!image && detail?.image) {
        image = detail.image
    }

    // Một số backend trả imageUrl
    if (!image && book?.imageUrl) {
        image = book.imageUrl
    }

    if (!image && detail?.imageUrl) {
        image = detail.imageUrl
    }

    // ==========================================
    // KHÔNG CÓ ẢNH
    // ==========================================

    if (!image) {
        return '/images/no-image.jpg'
    }

    // ==========================================
    // NẾU IMAGE LÀ OBJECT
    // ==========================================

    if (typeof image === 'object') {
        image =
            image.url ||
            image.path ||
            image.src ||
            image.imageUrl ||
            ''

        if (!image) {
            return '/images/no-image.jpg'
        }
    }

    image = String(image).trim()

    if (!image) {
        return '/images/no-image.jpg'
    }

    // ==========================================
    // ĐÃ LÀ URL ĐẦY ĐỦ
    // ==========================================

    if (
        image.startsWith('http://') ||
        image.startsWith('https://') ||
        image.startsWith('data:image/')
    ) {
        return image
    }

    // ==========================================
    // URL TƯƠNG ĐỐI FRONTEND
    // ==========================================

    if (image.startsWith('/')) {
        return image
    }

    // ==========================================
    // PATH BACKEND
    //
    // Ví dụ:
    // uploads/books/a.jpg
    // images/books/a.jpg
    // ==========================================

    const apiBaseURL =
        userService?.defaults?.baseURL ||
        ''

    if (apiBaseURL) {
        return `${apiBaseURL.replace(/\/$/, '')}/${image.replace(/^\//, '')}`
    }

    // ==========================================
    // FALLBACK
    // ==========================================

    return `/${image.replace(/^\//, '')}`
}

const getQuantity = (detail) => {
    return Number(detail?.quantity || detail?.qty || 1)
}

const getRealPrice = (detail) => {
    return Number(detail?.realPrice ?? detail?.price ?? 0)
}

const getOrderTotal = (order) => {
    // Ưu tiên tổng tiền backend đã tính sẵn nếu có, tránh lệch số làm tròn/phí ship/voucher
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
        return Number(order.totalAmount)
    }
    if (order.finalTotal !== undefined && order.finalTotal !== null) {
        return Number(order.finalTotal)
    }
    return (order._details || []).reduce(
        (total, detail) => total + getRealPrice(detail) * getQuantity(detail),
        0
    )
}

const shortId = (id) => {
    if (!id) return ''
    return String(id).slice(-8).toUpperCase()
}

// =====================================================
// HỦY ĐƠN
// =====================================================

const cancelOrder = async (order) => {

    const confirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này?')
    if (!confirmed) return

    order._cancelling = true

    try {
        await userService.updateOrderBook(order._id, { statusId: 'cancelled' })
        order.statusId = 'cancelled'
    } catch (error) {
        console.error('LỖI HỦY ĐƠN:', error)
        alert(
            error?.response?.data?.message ||
            error?.message ||
            'Không thể hủy đơn hàng'
        )
    } finally {
        order._cancelling = false
    }
}

// =====================================================
// ĐIỀU HƯỚNG
// =====================================================

const goToBookDetail = (detail) => {
    const book = getBook(detail)

    console.log("========== ĐI CHI TIẾT SÁCH ==========")
    console.log("DETAIL:", detail)
    console.log("BOOK:", book)
    console.log("BOOK ID:", book?._id)
    console.log("BOOK SLUG:", book?.slug)

    if (!book) {
        console.error("Không tìm thấy thông tin sách:", detail)
        return
    }

    // Ưu tiên slug nếu route chi tiết sách của m dùng slug
    if (book.slug) {
        router.push({
            name: "BookDetail",
            params: {
                slug: book.slug
            }
        })
        return
    }

    // Nếu route chi tiết sách dùng id
    if (book._id) {
        router.push({
            name: "BookDetail",
            params: {
                id: book._id
            }
        })
        return
    }

    console.error("Sách không có slug hoặc _id:", book)
}

// =====================================================
// FORMAT TIỀN
// =====================================================

const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + 'đ'
}
</script>


<style scoped>
* {
    box-sizing: border-box;
}

.order-history {
    font-family: Arial, Helvetica, sans-serif;
    color: #333;
}

/* =====================================================
   TABS
===================================================== */

.status-tabs {
    display: flex;
    background: white;
    border-bottom: 1px solid #eee;
}

.status-tab {
    flex: 1;
    padding: 14px 10px;
    border: none;
    background: transparent;
    font-size: 13px;
    color: #555;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: 0.15s;
}

.status-tab:hover {
    color: #f4512c;
}

.status-tab.active {
    color: #f4512c;
    border-bottom-color: #f4512c;
    font-weight: 600;
}

.shop-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 50%;
}

.shop-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

/* =====================================================
   SEARCH
===================================================== */

.search-bar {
    background: white;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
}

.search-bar input {
    width: 100%;
    padding: 9px 12px;
    border: 1px solid #ddd;
    font-size: 12px;
    outline: none;
}

.search-bar input:focus {
    border-color: #f4512c;
}

/* =====================================================
   STATE BOX
===================================================== */

.state-box {
    background: white;
    text-align: center;
    padding: 60px 20px;
    color: #999;
    font-size: 13px;
    margin-top: 12px;
}

.error-box {
    color: #f4512c;
}

.retry-btn {
    display: block;
    margin: 14px auto 0;
    border: 1px solid #f4512c;
    background: white;
    color: #f4512c;
    padding: 8px 16px;
    font-size: 12px;
    cursor: pointer;
}

.retry-btn:hover {
    background: #fff5f2;
}

.empty-icon {
    font-size: 40px;
    margin-bottom: 10px;
}

.shop-now-btn {
    display: inline-block;
    margin-top: 16px;
    background: #f4512c;
    color: white;
    padding: 10px 22px;
    font-size: 12px;
    text-decoration: none;
}

.shop-now-btn:hover {
    background: #df3f1d;
}

/* =====================================================
   ORDER LIST
===================================================== */

.order-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
}

.order-card {
    background: white;
}

/* HEADER */

.order-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
}

.order-shop {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #333;
}

.shop-icon {
    font-size: 13px;
}

.shop-name {
    font-weight: 600;
}

.order-code {
    color: #999;
    font-size: 11px;
}

.order-status {
    font-size: 12px;
    font-weight: 600;
}

.status-pending {
    color: #f4512c;
}

.status-confirmed {
    color: #1675d1;
}

.status-shipping {
    color: #f4a92c;
}

.status-completed {
    color: #55b400;
}

.status-cancelled {
    color: #999;
}

/* ITEMS */

.order-items {
    cursor: pointer;
}

.order-items-loading {
    padding: 16px;
    color: #999;
    font-size: 12px;
}

.order-item-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border-bottom: 1px solid #f7f7f7;
}

.order-item-row:last-child {
    border-bottom: none;
}

.order-item-image {
    width: 64px;
    height: 64px;
    border: 1px solid #eee;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.order-item-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.order-item-info {
    flex: 1;
    min-width: 0;
}

.order-item-name {
    font-size: 12px;
    color: #333;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.order-item-qty {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
}

.order-item-price {
    font-size: 12px;
    color: #555;
    white-space: nowrap;
}

.order-item-empty {
    padding: 16px;
    color: #999;
    font-size: 12px;
    text-align: center;
}

/* FOOTER */

.order-card-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
    flex-wrap: wrap;
}

.order-total {
    margin-right: auto;
    font-size: 13px;
    color: #555;
}

.order-total strong {
    color: #f4512c;
    font-size: 15px;
    margin-left: 4px;
}

.order-actions {
    display: flex;
    gap: 10px;
}

.detail-btn {
    border: 1px solid #ddd;
    background: white;
    color: #555;
    padding: 8px 16px;
    font-size: 12px;
    cursor: pointer;
}

.detail-btn:hover {
    border-color: #f4512c;
    color: #f4512c;
}

.cancel-btn {
    border: 1px solid #f4512c;
    background: white;
    color: #f4512c;
    padding: 8px 16px;
    font-size: 12px;
    cursor: pointer;
}

.cancel-btn:hover:not(:disabled) {
    background: #f4512c;
    color: white;
}

.cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 700px) {

    .status-tabs {
        overflow-x: auto;
    }

    .status-tab {
        white-space: nowrap;
    }

    .order-card-footer {
        justify-content: flex-start;
    }

    .order-total {
        margin-right: 0;
        width: 100%;
    }
}
</style>