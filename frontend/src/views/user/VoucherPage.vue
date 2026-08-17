<template>
    <section class="voucher-wallet">

        <!-- ==================== TITLE ==================== -->
        <div class="voucher-title">
            <h2>Ví Voucher</h2>
        </div>

        <!-- ==================== FILTER ==================== -->
        <div class="voucher-filter">

            <button type="button" :class="{
                active: currentFilter === 'all'
            }" @click="currentFilter = 'all'">
                Tất cả
            </button>

            <button type="button" :class="{
                active: currentFilter === 'unused'
            }" @click="currentFilter = 'unused'">
                Chưa dùng
            </button>

            <button type="button" :class="{
                active: currentFilter === 'used'
            }" @click="currentFilter = 'used'">
                Đã dùng
            </button>

        </div>

        <!-- ==================== LOADING ==================== -->
        <div v-if="loading" class="voucher-loading">
            <div class="loading-spinner"></div>
            <span>Đang tải voucher...</span>
        </div>

        <!-- ==================== ERROR ==================== -->
        <div v-else-if="errorMessage" class="voucher-error">
            {{ errorMessage }}
        </div>

        <!-- ==================== EMPTY ==================== -->
        <div v-else-if="filteredVouchers.length === 0" class="voucher-empty">
            <div class="empty-icon">
                🎟️
            </div>

            <h3>
                {{
                    currentFilter === 'used'
                        ? 'Chưa có voucher đã dùng'
                        : currentFilter === 'unused'
                            ? 'Bạn chưa có voucher chưa dùng'
                            : 'Bạn chưa có voucher nào'
                }}
            </h3>

            <p>
                Hãy thu thập voucher để nhận được nhiều ưu đãi hơn.
            </p>
        </div>

        <!-- ==================== VOUCHER LIST ==================== -->
        <div v-else class="voucher-list">

            <div v-for="item in filteredVouchers" :key="item._id" class="voucher-card" :class="{
                'voucher-used': item.status === 1,
                'voucher-expired': isExpired(item)
            }">

                <!-- LEFT -->
                <div class="voucher-ticket">

                    <div class="ticket-icon">
                        <span>S</span>
                    </div>

                    <div class="ticket-code">
                        {{ item.voucher.code }}
                    </div>

                </div>

                <!-- RIGHT -->
                <div class="voucher-info">

                    <!-- TOP -->
                    <div class="voucher-info-top">

                        <div class="voucher-discount">
                            {{ getDiscountText(item.voucher) }}
                        </div>

                        <button v-if="
                            item.status === 0 &&
                            !isExpired(item)
                        " type="button" class="use-voucher-btn" @click="useVoucher(item)">
                            Dùng ngay
                            <span>›</span>
                        </button>

                        <span v-else-if="item.status === 1" class="voucher-status used">
                            Đã dùng
                        </span>

                        <span v-else class="voucher-status expired">
                            Hết hạn
                        </span>

                    </div>

                    <!-- DESCRIPTION -->
                    <div v-if="item.voucher.description" class="voucher-description">
                        {{ item.voucher.description }}
                    </div>

                    <!-- CONDITION -->
                    <div class="voucher-condition">

                        <span>
                            Giảm tối đa
                            {{
                                item.voucher.maxDiscount
                                    ? formatMoney(
                                        item.voucher.maxDiscount
                                    )
                                    : 'Không giới hạn'
                            }}
                        </span>

                        <span>
                            Đơn tối thiểu
                            {{
                                formatMoney(
                                    item.voucher.minOrderValue
                                )
                            }}
                        </span>

                    </div>

                    <!-- PROGRESS -->
                    <div class="voucher-progress">

                        <div class="progress-bar">
                            <div class="progress-value" :style="{
                                width:
                                    getUsedPercent(
                                        item.voucher
                                    ) + '%'
                            }"></div>
                        </div>

                        <span>
                            Đã dùng
                            {{ getUsedPercent(item.voucher) }}%
                        </span>

                    </div>

                    <!-- FOOTER -->
                    <div class="voucher-footer">

                        <span>
                            Mã:
                            <strong>
                                {{ item.voucher.code }}
                            </strong>
                        </span>

                        <span>
                            HSD:
                            {{ formatDate(item.voucher.endDate) }}
                        </span>

                    </div>

                </div>

            </div>

        </div>

    </section>
</template>

<script setup>
import {
    computed,
    onMounted,
    ref
} from "vue";

import userService from "@/services/user.service.js";

// ============================================================
// STATE
// ============================================================

const vouchers = ref([]);

const loading = ref(false);

const errorMessage = ref("");

const currentFilter = ref("all");

// ============================================================
// API RESULT
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
// FORMAT VOUCHER
// ============================================================

const normalizeVouchers = (data) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item) => {

            /*
             * Backend của m:
             *
             * {
             *   _id: "VoucherUser ID",
             *   voucherId: {
             *      _id,
             *      code,
             *      description,
             *      type,
             *      value,
             *      maxDiscount,
             *      minOrderValue,
             *      quantity,
             *      usedCount,
             *      startDate,
             *      endDate,
             *      status
             *   },
             *   userId,
             *   status
             * }
             */

            if (
                !item?.voucherId ||
                typeof item.voucherId !== "object"
            ) {
                return null;
            }

            return {
                _id: item._id,

                status: Number(
                    item.status ?? 0
                ),

                voucher: item.voucherId
            };
        })
        .filter(Boolean);
};

// ============================================================
// GET VOUCHERS
// ============================================================

const fetchVouchers = async () => {

    try {

        loading.value = true;

        errorMessage.value = "";

        const response =
            await userService.getMyVouchers();

        console.log(
            "VOUCHER WALLET RESPONSE:",
            response
        );

        const result =
            getApiResult(response);

        if (!result?.success) {

            errorMessage.value =
                result?.message ||
                "Không thể lấy danh sách voucher";

            vouchers.value = [];

            return;
        }

        vouchers.value =
            normalizeVouchers(
                result.data
            );

        console.log(
            "VOUCHERS:",
            vouchers.value
        );

    } catch (error) {

        console.error(
            "Lỗi lấy voucher:",
            error
        );

        errorMessage.value =
            error?.response?.data?.message ||
            error?.message ||
            "Không thể lấy danh sách voucher";

        vouchers.value = [];

    } finally {

        loading.value = false;

    }
};

// ============================================================
// FILTER
// ============================================================

const filteredVouchers = computed(() => {

    if (currentFilter.value === "unused") {

        return vouchers.value.filter(
            item =>
                item.status === 0 &&
                !isExpired(item)
        );

    }

    if (currentFilter.value === "used") {

        return vouchers.value.filter(
            item =>
                item.status === 1
        );

    }

    return vouchers.value;

});

// ============================================================
// DISCOUNT TEXT
// ============================================================

const getDiscountText = (voucher) => {

    if (!voucher) {
        return "";
    }

    if (voucher.type === "percent") {

        return `Giảm ${voucher.value}%`;

    }

    return `Giảm ${formatMoney(voucher.value)}`;
};

// ============================================================
// FORMAT MONEY
// ============================================================

const formatMoney = (value) => {

    const number =
        Number(value || 0);

    return (
        number.toLocaleString("vi-VN") +
        "đ"
    );
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {

    if (!date) {
        return "";
    }

    return new Date(date).toLocaleDateString(
        "vi-VN"
    );
};

// ============================================================
// CHECK EXPIRED
// ============================================================

const isExpired = (item) => {

    if (!item?.voucher?.endDate) {
        return false;
    }

    return (
        new Date(
            item.voucher.endDate
        ) < new Date()
    );
};

// ============================================================
// USED PERCENT
// ============================================================

const getUsedPercent = (voucher) => {

    if (!voucher) {
        return 0;
    }

    const quantity =
        Number(voucher.quantity || 0);

    const used =
        Number(voucher.usedCount || 0);

    if (quantity <= 0) {
        return 0;
    }

    return Math.min(
        100,
        Math.round(
            (used / quantity) * 100
        )
    );
};

// ============================================================
// USE VOUCHER
// ============================================================

const useVoucher = (item) => {

    if (!item) {
        return;
    }

    if (item.status === 1) {
        return;
    }

    if (isExpired(item)) {
        return;
    }

    /*
     * Voucher này đã được lưu trong ví.
     *
     * Chưa chuyển sang status = 1 ở đây.
     *
     * status = 1 chỉ nên được backend cập nhật
     * sau khi user đặt hàng thành công.
     */

    console.log(
        "USER CHỌN VOUCHER:",
        item
    );

    /*
     * Nếu trang checkout của m có route,
     * đổi dòng dưới thành route thật.
     *
     * Ví dụ:
     *
     * router.push({
     *     name: "Checkout",
     *     query: {
     *         voucher: item.voucher.code
     *     }
     * });
     */

    alert(
        `Đã chọn voucher ${item.voucher.code}`
    );
};

// ============================================================
// MOUNT
// ============================================================

onMounted(() => {
    fetchVouchers();
});
</script>

<style scoped>
/* ============================================================
   CONTAINER
   ============================================================ */

.voucher-wallet {
    width: 100%;
    box-sizing: border-box;
}

/* ============================================================
   TITLE
   ============================================================ */

.voucher-title {
    height: 46px;

    display: flex;
    align-items: center;

    border-bottom: 1px solid #e5e5e5;

    margin-bottom: 14px;
}

.voucher-title h2 {
    margin: 0;

    font-size: 16px;
    font-weight: 500;

    color: #222;
}

/* ============================================================
   FILTER
   ============================================================ */

.voucher-filter {
    display: flex;
    align-items: center;

    gap: 8px;

    margin-bottom: 15px;
}

.voucher-filter button {
    border: 1px solid #ddd;

    background: #fff;

    color: #555;

    padding: 7px 16px;

    font-size: 13px;

    cursor: pointer;

    transition: all 0.2s ease;
}

.voucher-filter button:hover {
    border-color: #f45132;
    color: #f45132;
}

.voucher-filter button.active {
    background: #f45132;

    border-color: #f45132;

    color: #fff;
}

/* ============================================================
   LIST
   ============================================================ */

.voucher-list {
    display: grid;

    grid-template-columns:
        repeat(2, minmax(0, 1fr));

    gap: 14px;
}

/* ============================================================
   CARD
   ============================================================ */

.voucher-card {
    position: relative;

    display: flex;

    min-height: 130px;

    background: #fff;

    border: 1px solid #ddd;

    overflow: hidden;

    transition:
        box-shadow 0.2s ease,
        transform 0.2s ease;
}

.voucher-card:hover {
    box-shadow:
        0 3px 12px rgba(0, 0, 0, 0.08);

    transform: translateY(-1px);
}

/* ============================================================
   TICKET LEFT
   ============================================================ */

.voucher-ticket {
    position: relative;

    flex: 0 0 112px;

    min-height: 130px;

    background: #f45132;

    color: #fff;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 7px;
}

/*
 * Hai lỗ khuyết giống vé trong screenshot
 */

.voucher-ticket::before,
.voucher-ticket::after {
    content: "";

    position: absolute;

    right: -9px;

    width: 18px;
    height: 18px;

    border-radius: 50%;

    background: #fff;
}

.voucher-ticket::before {
    top: 26px;
}

.voucher-ticket::after {
    bottom: 26px;
}

/* ============================================================
   ICON
   ============================================================ */

.ticket-icon {
    width: 34px;
    height: 34px;

    border: 2px solid #fff;

    display: flex;

    align-items: center;
    justify-content: center;

    font-size: 20px;

    font-weight: 500;
}

.ticket-icon span {
    line-height: 1;
}

/* ============================================================
   CODE
   ============================================================ */

.ticket-code {
    max-width: 100px;

    padding: 0 5px;

    text-align: center;

    font-size: 11px;

    font-weight: 500;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;
}

/* ============================================================
   INFO
   ============================================================ */

.voucher-info {
    flex: 1;

    min-width: 0;

    padding: 12px 12px 9px 14px;

    display: flex;

    flex-direction: column;
}

/* ============================================================
   TOP
   ============================================================ */

.voucher-info-top {
    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 8px;
}

.voucher-discount {
    font-size: 14px;

    font-weight: 500;

    color: #333;

    line-height: 20px;
}

.use-voucher-btn {
    flex-shrink: 0;

    border: none;

    background: transparent;

    color: #f45132;

    font-size: 11px;

    cursor: pointer;

    padding: 0;

    white-space: nowrap;
}

.use-voucher-btn span {
    font-size: 18px;

    vertical-align: -1px;

    margin-left: 2px;
}

.use-voucher-btn:hover {
    text-decoration: underline;
}

/* ============================================================
   DESCRIPTION
   ============================================================ */

.voucher-description {
    margin-top: 2px;

    color: #888;

    font-size: 11px;

    line-height: 17px;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;
}

/* ============================================================
   CONDITION
   ============================================================ */

.voucher-condition {
    display: flex;

    flex-direction: column;

    gap: 1px;

    margin-top: 4px;

    color: #777;

    font-size: 10px;

    line-height: 15px;
}

/* ============================================================
   PROGRESS
   ============================================================ */

.voucher-progress {
    display: flex;

    align-items: center;

    gap: 6px;

    margin-top: auto;

    padding-top: 6px;
}

.progress-bar {
    width: 88px;
    height: 5px;

    background: #e9e9e9;

    border-radius: 10px;

    overflow: hidden;
}

.progress-value {
    height: 100%;

    background: #f45132;

    border-radius: 10px;

    transition: width 0.3s ease;
}

.voucher-progress span {
    color: #f45132;

    font-size: 9px;

    white-space: nowrap;
}

/* ============================================================
   FOOTER
   ============================================================ */

.voucher-footer {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 8px;

    margin-top: 4px;

    padding-top: 5px;

    border-top: 1px solid #f0f0f0;

    color: #999;

    font-size: 9px;
}

.voucher-footer strong {
    color: #555;

    font-weight: 500;
}

/* ============================================================
   STATUS
   ============================================================ */

.voucher-status {
    flex-shrink: 0;

    font-size: 10px;

    padding: 2px 6px;

    border-radius: 2px;
}

.voucher-status.used {
    color: #888;

    background: #f2f2f2;
}

.voucher-status.expired {
    color: #999;

    background: #f2f2f2;
}

/* ============================================================
   USED
   ============================================================ */

.voucher-card.voucher-used {
    opacity: 0.72;
}

.voucher-card.voucher-used .voucher-ticket {
    background: #999;
}

.voucher-card.voucher-used .progress-value {
    background: #999;
}

/* ============================================================
   EXPIRED
   ============================================================ */

.voucher-card.voucher-expired {
    opacity: 0.65;
}

.voucher-card.voucher-expired .voucher-ticket {
    background: #999;
}

/* ============================================================
   LOADING
   ============================================================ */

.voucher-loading {
    min-height: 250px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 10px;

    color: #999;

    font-size: 13px;
}

.loading-spinner {
    width: 24px;
    height: 24px;

    border: 2px solid #eee;

    border-top-color: #f45132;

    border-radius: 50%;

    animation:
        voucher-spin 0.7s linear infinite;
}

@keyframes voucher-spin {
    to {
        transform: rotate(360deg);
    }
}

/* ============================================================
   ERROR
   ============================================================ */

.voucher-error {
    padding: 30px;

    text-align: center;

    color: #f45132;

    font-size: 13px;
}

/* ============================================================
   EMPTY
   ============================================================ */

.voucher-empty {
    min-height: 280px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;

    color: #888;
}

.empty-icon {
    font-size: 42px;

    margin-bottom: 10px;

    opacity: 0.7;
}

.voucher-empty h3 {
    margin: 0 0 6px;

    color: #555;

    font-size: 15px;

    font-weight: 500;
}

.voucher-empty p {
    margin: 0;

    font-size: 12px;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */

@media (max-width: 900px) {

    .voucher-list {
        grid-template-columns: 1fr;
    }

}

@media (max-width: 600px) {

    .voucher-ticket {
        flex: 0 0 95px;
    }

    .voucher-info {
        padding-left: 11px;
    }

    .voucher-condition {
        font-size: 9px;
    }

}
</style>