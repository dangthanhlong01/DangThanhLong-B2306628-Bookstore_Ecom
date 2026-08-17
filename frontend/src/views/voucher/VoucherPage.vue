<script setup>
import { ref, onMounted } from "vue";
import userService from "../../services/user.service";

// =====================================================
// STATE
// =====================================================

// Danh sách voucher
const vouchers = ref([]);

// Trạng thái loading
const loading = ref(true);

// Thông báo lỗi
const error = ref("");

// ID voucher đang được lưu
const savingId = ref(null);

// Danh sách ID voucher user đã thu thập
const collectedVoucherIds = ref([]);

// =====================================================
// TOAST
// =====================================================

// Nội dung toast
const toastMessage = ref("");

// Loại toast: success / error
const toastType = ref("success");

// Trạng thái hiển thị toast
const showToast = ref(false);

// Timer để tự động ẩn toast
let toastTimer = null;


// =====================================================
// HIỂN THỊ TOAST
// =====================================================

const showToastMessage = (message, type = "success") => {

    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;

    // Nếu đang có timer cũ thì xóa
    clearTimeout(toastTimer);

    // Tự động ẩn sau 3 giây
    toastTimer = setTimeout(() => {
        showToast.value = false;
    }, 3000);
};


// =====================================================
// MAP VOUCHER
// =====================================================

const mapVoucher = (v) => {

    const isPercent = v.type === "percent";

    return {
        id: v._id,

        code: v.code,

        name: isPercent
            ? `Giảm ${v.value}%`
            : `Giảm ${Number(v.value).toLocaleString("vi-VN")}đ`,

        maxValue: v.maxDiscount
            ? `Giảm tối đa ${Number(v.maxDiscount).toLocaleString("vi-VN")}đ`
            : v.minOrderValue
                ? `Đơn tối thiểu ${Number(v.minOrderValue).toLocaleString("vi-VN")}đ`
                : "",

        usedPercent: v.quantity > 0
            ? Math.min(
                100,
                Math.round(
                    (v.usedCount / v.quantity) * 100
                )
            )
            : 0,
    };
};


// =====================================================
// LẤY DANH SÁCH VOUCHER ACTIVE
// =====================================================

const fetchVouchers = async () => {

    loading.value = true;
    error.value = "";

    try {

        const res =
            await userService.getActiveVouchers({
                limit: 20
            });

        console.log("========== ACTIVE VOUCHER API ==========");
        console.log("RESPONSE:", res);
        console.log("=========================================");

        // Backend:
        // {
        //   success: true,
        //   data: [...]
        // }
        //
        // Nếu backend trả data.vouchers thì lấy vouchers
        // Nếu data là array thì lấy trực tiếp data

        const list =
            Array.isArray(res?.data)
                ? res.data
                : res?.data?.vouchers || [];

        vouchers.value =
            list.map(mapVoucher);

    } catch (err) {

        console.error(
            "Lỗi lấy danh sách voucher:",
            err
        );

        error.value =
            err?.message ||
            "Không thể tải danh sách voucher";

    } finally {

        loading.value = false;

    }
};


// =====================================================
// LẤY VOUCHER USER ĐÃ THU THẬP
// =====================================================

const fetchMyVouchers = async () => {

    try {

        const res =
            await userService.getMyVouchers({
                limit: 100
            });

        console.log("========== MY VOUCHER API ==========");
        console.log("RESPONSE:", res);
        console.log("====================================");

        const list =
            Array.isArray(res?.data)
                ? res.data
                : res?.data?.vouchers || [];

        // Lưu ID các voucher user đã thu thập
        collectedVoucherIds.value =
            list.map(voucher => {

                // Tùy backend có thể trả voucherId
                // hoặc voucher._id
                return (
                    voucher.voucherId?._id ||
                    voucher.voucherId ||
                    voucher.voucher?._id ||
                    voucher._id
                );

            }).filter(Boolean);

    } catch (err) {

        console.error(
            "Lỗi lấy voucher của tôi:",
            err
        );

        // Không cần hiện lỗi ở đây
        // vì trang vẫn có thể hiển thị voucher active
        collectedVoucherIds.value = [];

    }

};


// =====================================================
// KIỂM TRA VOUCHER ĐÃ THU THẬP CHƯA
// =====================================================

const isCollected = (voucherId) => {

    return collectedVoucherIds.value.includes(
        voucherId
    );

};


// =====================================================
// THU THẬP VOUCHER
// =====================================================

const saveVoucher = async (voucher) => {

    // Nếu voucher đã được lưu
    if (isCollected(voucher.id)) {

        showToastMessage(
            `Voucher ${voucher.code} đã được lưu trước đó`,
            "error"
        );

        return;
    }


    // Nếu đang có voucher khác được lưu
    if (savingId.value) {
        return;
    }


    savingId.value = voucher.id;

    try {

        console.log(
            "Thu thập voucher:",
            voucher.id
        );

        const res =
            await userService.collectVoucher(
                voucher.id
            );

        console.log(
            "COLLECT VOUCHER RESPONSE:",
            res
        );


        // Thành công
        if (res?.success) {

            // Thêm ID vào danh sách đã thu thập
            collectedVoucherIds.value.push(
                voucher.id
            );

            showToastMessage(
                `Đã lưu voucher ${voucher.code} thành công!`,
                "success"
            );

        } else {

            showToastMessage(
                res?.message ||
                "Không thể lưu voucher",
                "error"
            );

        }

    } catch (err) {

        console.error(
            "Lỗi lưu voucher:",
            err
        );


        // Lấy message từ backend
        const message =
            err?.response?.data?.message ||
            err?.message ||
            "Không thể lưu voucher, vui lòng thử lại";


        showToastMessage(
            message,
            "error"
        );

    } finally {

        savingId.value = null;

    }

};


// =====================================================
// LIFECYCLE
// =====================================================

onMounted(async () => {

    // Lấy voucher active
    await fetchVouchers();

    // Lấy voucher user đã lưu
    await fetchMyVouchers();

});
</script>

<template>
    <div class="discount-page">

        <div class="voucher-header">
            <div class="voucher-title-main">
                <span class="voucher-icon">%</span>
                <span>VOUCHER HÔM NAY</span>
            </div>

            <div class="voucher-title-sub">
                VOUCHER TOÀN SÀN
            </div>

            <p class="voucher-note">
                Số lượng có hạn, chỉ áp dụng cho người dùng và đơn hàng thỏa mãn
                điều kiện chương trình
            </p>
        </div>

        <!-- Trạng thái loading -->
        <p v-if="loading">Đang tải voucher...</p>

        <!-- Trạng thái lỗi -->
        <p v-else-if="error" style="color:red">{{ error }}</p>

        <!-- Không có voucher nào -->
        <p v-else-if="vouchers.length === 0">Hiện chưa có voucher nào.</p>

        <!-- Danh sách voucher -->
        <div v-else class="voucher-list">
            <div v-for="voucher in vouchers" :key="voucher.id" class="box-voucher">

                <div class="content-left">
                    <div class="voucher-shop-icon">S</div>
                    <span>{{ voucher.code }}</span>
                </div>

                <div class="border-center"></div>

                <div class="content-right">
                    <div class="box-content-right">
                        <div class="name-voucher">{{ voucher.name }}</div>
                        <div class="max-value-voucher">{{ voucher.maxValue }}</div>

                        <div class="box-percent">
                            <div class="wrap-percent">
                                <div class="percent" :style="{ width: voucher.usedPercent + '%' }"></div>
                            </div>
                            <span class="used-percent">Đã dùng {{ voucher.usedPercent }}%</span>
                        </div>

                        <button type="button" class="btn-voucher" :class="{
                            collected: isCollected(voucher.id)
                        }" :disabled="savingId === voucher.id ||
                            isCollected(voucher.id)
                            " @click="saveVoucher(voucher)">
                            {{
                                savingId === voucher.id
                                    ? "Đang lưu..."
                                    : isCollected(voucher.id)
                                        ? "Đã lưu"
                                        : "Lưu"
                            }}
                        </button>
                    </div>
                </div>

            </div>
        </div>
       <!-- =====================================================
     TOAST
===================================================== -->

        <transition name="toast">

            <div v-if="showToast" class="toast" :class="{
                success: toastType === 'success',
                error: toastType === 'error'
            }">

                <div class="toast-icon">
                    {{ toastType === "success" ? "✓" : "!" }}
                </div>

                <div class="toast-message">
                    {{ toastMessage }}
                </div>

            </div>

        </transition>
    </div>
</template>


<style scoped>
/* =====================================================
   TRANG GIẢM GIÁ
===================================================== */

.discount-page {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 35px 30px 60px;
    box-sizing: border-box;

    /* Không cho nội dung làm tràn ngang */
    overflow-x: hidden;
}


/* =====================================================
   HEADER
===================================================== */

.voucher-header {
    margin-bottom: 25px;
}


/* Tiêu đề Voucher hôm nay */

.voucher-title-main {
    display: flex;
    align-items: center;

    width: fit-content;
    min-width: 500px;
    height: 58px;

    background: #f4512c;

    border: 2px solid #0057d9;
    border-radius: 8px;

    color: #fff;

    font-size: 32px;
    font-weight: 700;

    padding: 0 25px;

    box-sizing: border-box;

    position: relative;
}


/* Icon % */

.voucher-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 65px;
    height: 65px;

    background: #0759db;
    border: 3px solid #0759db;

    color: #ffd900;

    font-size: 35px;
    font-weight: 800;

    position: relative;

    margin-left: -10px;
    margin-right: 15px;

    transform: skewY(-5deg);

    box-shadow: 3px 3px 0 #003b9e;
}


/* =====================================================
   VOUCHER TOÀN SÀN
===================================================== */

.voucher-title-sub {
    width: fit-content;
    min-width: 310px;

    margin-top: 30px;

    padding: 7px 20px;

    background: #0759db;

    border-radius: 5px;
    border-bottom: 3px solid #ffb800;

    color: #fff;

    font-size: 26px;
    font-weight: 700;

    max-width: 100%;
    box-sizing: border-box;
}


/* =====================================================
   MÔ TẢ
===================================================== */

.voucher-note {
    margin: 25px 20px 0;

    color: #888;

    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.3px;
}


/* =====================================================
   DANH SÁCH VOUCHER
===================================================== */

.voucher-list {
    width: 100%;
    max-width: 100%;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    align-items: stretch;

    box-sizing: border-box;
}


/* =====================================================
   BOX VOUCHER
===================================================== */

.box-voucher {
    width: 100%;
    max-width: 100%;
    min-width: 0;

    color: rgb(238, 77, 45);

    border: 1px solid #c4c4c4;
    border-left: 0;
    border-radius: 2px;

    background-clip: padding-box;

    background:
        repeating-linear-gradient(#c4c4c4,
            #c4c4c4 10px,
            transparent 0,
            transparent 30px,
            #c4c4c4 0,
            #c4c4c4 42px) 0 / 1px 100% no-repeat,

        radial-gradient(circle at 0 20px,
            transparent,
            transparent 10px,
            #c4c4c4 0,
            #c4c4c4 11px,
            currentColor 0) 1px 0 / 100% 42px repeat-y;

    display: flex;

    min-height: 190px;

    overflow: hidden;
    box-sizing: border-box;
}


/* =====================================================
   BÊN TRÁI
===================================================== */

.content-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 150px;
    min-width: 150px;

    margin-top: -10px;

    padding: 15px;

    box-sizing: border-box;

    /* FIX: cần nền đặc để chữ/icon trắng hiển thị được */
    background-color: rgb(238, 77, 45);
}


/* Icon Shopee / Voucher */

.voucher-shop-icon {
    width: 70px;
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid #fff;

    background: rgb(238, 77, 45);

    color: #fff;

    font-size: 38px;
    font-weight: 600;

    margin-bottom: 8px;
}


/* Code voucher */

.content-left span {
    color: #fff;

    font-size: 15px;
    font-weight: 600;

    text-align: center;
    text-transform: uppercase;

    word-break: break-word;
}


/* =====================================================
   ĐƯỜNG NGĂN
===================================================== */

.border-center {
    width: 1px;
    min-width: 1px;

    background:
        repeating-linear-gradient(#e5e5e5,
            #e5e5e5 5px,
            transparent 0,
            transparent 10px);
}


/* =====================================================
   BÊN PHẢI
===================================================== */

.content-right {
    background-color: #fff;

    flex: 1;
    min-width: 0;
    width: 0;

    box-sizing: border-box;
}


/* Nội dung bên phải */

.box-content-right {
    display: flex;
    flex-direction: column;

    margin: 20px;

    height: calc(100% - 40px);

    min-width: 0;
    box-sizing: border-box;
}


/* Tên voucher */

.name-voucher {
    color: #212121;

    font-size: 24px;
    font-weight: 500;

    margin-bottom: 3px;

    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}


/* Giá trị tối đa */

.max-value-voucher {
    color: #595959;

    font-size: 14px;

    margin-bottom: 12px;

    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* =====================================================
   TOAST
===================================================== */

.toast {
    position: fixed;

    top: 80px;
    right: 30px;

    min-width: 300px;
    max-width: 400px;

    padding: 14px 18px;

    display: flex;
    align-items: center;

    gap: 12px;

    background: #ffffff;

    border-radius: 6px;

    box-shadow:
        0 5px 20px rgba(0, 0, 0, 0.15);

    z-index: 99999;

    font-size: 14px;
}


/* Toast thành công */

.toast.success {
    border-left: 4px solid #78c800;
}


/* Toast lỗi */

.toast.error {
    border-left: 4px solid #f44336;
}


/* Icon */

.toast-icon {
    width: 26px;
    height: 26px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    flex-shrink: 0;

    color: #ffffff;

    font-weight: 700;
}


.toast.success .toast-icon {
    background: #78c800;
}


.toast.error .toast-icon {
    background: #f44336;
}


/* Nội dung */

.toast-message {
    color: #333333;

    line-height: 1.4;
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
        translateX(30px);
}


/* =====================================================
   NÚT VOUCHER ĐÃ LƯU
===================================================== */

.btn-voucher.collected {
    background: #999999;

    cursor: not-allowed;
}


.btn-voucher.collected:hover {
    background: #999999;
}


/* =====================================================
   RESPONSIVE TOAST
===================================================== */

@media (max-width: 600px) {

    .toast {
        top: 70px;
        right: 15px;
        left: 15px;

        min-width: 0;
        max-width: none;

        width: auto;
    }

}


/* =====================================================
   PHẦN ĐÃ DÙNG
===================================================== */

.box-percent {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}


/* Thanh tiến trình */

.wrap-percent {
    height: 10px;

    border-radius: 25px;

    width: 150px;
    max-width: 100%;

    background: rgba(0, 0, 0, 0.09);

    overflow: hidden;
    flex-shrink: 0;
}


/* Phần đã sử dụng */

.percent {
    height: 100%;

    background:
        linear-gradient(270deg,
            rgb(238, 77, 45) 0%,
            rgb(238, 77, 45) 100%);

    transition: width 0.3s ease;
}


/* Text đã dùng */

.used-percent {
    color: rgb(255, 66, 79);

    font-size: 13px;
    line-height: 1.5rem;

    white-space: nowrap;

    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}


/* =====================================================
   NÚT LƯU
===================================================== */

.btn-voucher {
    width: 100%;
    height: 42px;

    border: 0;
    outline: none;

    border-radius: 6px;

    background-color: rgb(238, 77, 45);

    font-size: 16px;
    color: #fff;

    margin-top: auto;

    cursor: pointer;

    transition: background-color 0.2s ease;
}

.btn-voucher:hover {
    background-color: #da492c;
}


/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 900px) {

    .voucher-list {
        grid-template-columns: 1fr;
    }

    .voucher-title-main {
        min-width: 0;
        width: 100%;

        font-size: 26px;
    }
}


@media (max-width: 600px) {

    .discount-page {
        width: 100%;

        padding: 25px 15px 40px;

        box-sizing: border-box;
    }

    .voucher-title-main {
        width: 100%;
        min-width: 0;

        font-size: 20px;
        height: 50px;

        box-sizing: border-box;
    }

    .voucher-icon {
        width: 50px;
        height: 55px;

        font-size: 28px;
    }

    .voucher-title-sub {
        max-width: 100%;
        min-width: 0;
        width: 80%;

        font-size: 20px;

        box-sizing: border-box;
    }

    .voucher-note {
        margin-left: 0;

        font-size: 14px;
    }

    .box-voucher {
        width: 100%;
    }

    .content-left {
        width: 110px;
        min-width: 110px;

        box-sizing: border-box;
    }

    .voucher-shop-icon {
        width: 55px;
        height: 55px;

        font-size: 28px;
    }

    .content-right {
        width: 0;
        min-width: 0;
    }

    .name-voucher {
        font-size: 20px;
    }

    .box-percent {
        flex-direction: column;
        align-items: flex-start;

        max-width: 100%;
    }

    .wrap-percent {
        max-width: 100%;
    }
}
</style>