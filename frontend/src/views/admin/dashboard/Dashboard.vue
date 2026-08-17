<template>
    <div class="dashboard">

        <!-- ==================== TIÊU ĐỀ ==================== -->
        <h1 class="page-title">THỐNG KÊ</h1>

        <div class="breadcrumb">
            Trang thống kê
        </div>


        <!-- ==================== 4 Ô THỐNG KÊ ==================== -->
        <div class="statistics-cards">

            <!-- Tổng số đơn hàng -->
            <div class="stat-card stat-blue">
                <div class="stat-title">
                    TỔNG SỐ ĐƠN HÀNG ({{ statistics.orders }})
                </div>

                <button class="detail-btn">
                    Chi tiết
                    <span>›</span>
                </button>
            </div>


            <!-- Tổng doanh thu -->
            <div class="stat-card stat-yellow">
                <div class="stat-title">
                    DOANH THU ({{ formatPrice(statistics.revenue) }})
                </div>

                <button class="detail-btn">
                    Chi tiết
                    <span>›</span>
                </button>
            </div>


            <!-- Tổng số sách -->
            <div class="stat-card stat-green">
                <div class="stat-title">
                    SÁCH ({{ statistics.products }})
                </div>

                <button class="detail-btn">
                    Chi tiết
                    <span>›</span>
                </button>
            </div>


            <!-- Tổng số thành viên -->
            <div class="stat-card stat-red">
                <div class="stat-title">
                    THÀNH VIÊN ({{ statistics.members }})
                </div>

                <button class="detail-btn">
                    Chi tiết
                    <span>›</span>
                </button>
            </div>

        </div>


        <!-- ==================== KHU VỰC BIỂU ĐỒ ==================== -->
        <div class="dashboard-content">

            <!-- ==================== BIỂU ĐỒ DOANH THU ==================== -->
            <div class="revenue-section">

                <div class="revenue-header">

                    <div class="year-filter">
                        <label>Chọn năm</label>

                        <select v-model="selectedYear" @change="loadDashboardStatistics">
                            <option v-for="year in years" :key="year" :value="year">
                                {{ year }}
                            </option>
                        </select>
                    </div>

                </div>


                <div class="chart-title">
                    Biểu đồ doanh thu theo từng tháng trong năm {{ selectedYear }}
                </div>


                <div class="chart-container">
                    <canvas ref="revenueChart"></canvas>
                </div>

            </div>


            <!-- ==================== BIỂU ĐỒ TRẠNG THÁI ĐƠN ==================== -->
            <div class="order-section">

                <div class="order-chart-title">
                    Thống kê trạng thái đơn hàng
                </div>


                <div class="legend">

                    <div>
                        <span class="legend-color pending"></span>
                        Chờ xác nhận
                    </div>

                    <div>
                        <span class="legend-color confirmed"></span>
                        Đã xác nhận
                    </div>

                    <div>
                        <span class="legend-color shipping"></span>
                        Đang giao hàng
                    </div>

                    <div>
                        <span class="legend-color delivered"></span>
                        Đã giao hàng
                    </div>

                    <div>
                        <span class="legend-color cancelled"></span>
                        Hủy đơn
                    </div>

                </div>


                <div class="pie-container">
                    <canvas ref="orderChart"></canvas>
                </div>

            </div>

        </div>

    </div>
</template>


<script setup>

// ==================== IMPORT ====================

import {
    ref,
    onMounted,
    onBeforeUnmount
} from "vue";

import Chart from "chart.js/auto";

import userService from "@/services/user.service";


// ==================== STATE ====================

// 4 số liệu thống kê tổng quan
const statistics = ref({
    orders: 0,
    revenue: 0,
    products: 0,
    members: 0,
});


// ==================== NĂM ====================

const currentYear = new Date().getFullYear();

const selectedYear = ref(currentYear);

const years = ref([
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
]);


// ==================== CHART ====================

const revenueChart = ref(null);

const orderChart = ref(null);


// Lưu instance Chart.js
let revenueChartInstance = null;
let orderChartInstance = null;


// ==================== DATA ====================

// Doanh thu 12 tháng
const revenueData = ref(Array(12).fill(0));


// Trạng thái đơn hàng
const orderStatusData = ref([0, 0, 0, 0, 0]);


// =====================================================
// QUAN TRỌNG
// =====================================================
// Phải khớp với statusId đang lưu trong OrderBook.
//
// Ví dụ:
// 1 = Chờ xác nhận
// 2 = Đã xác nhận
// 3 = Đang giao hàng
// 4 = Đã giao hàng
// 5 = Hủy đơn
//
// Nếu DB của m dùng ID khác thì sửa mảng này.
// =====================================================

const ORDER_STATUS_IDS = [1, 2, 3, 4, 5];


// ==================== FORMAT TIỀN ====================

const formatPrice = (value) => {

    return Number(value || 0)
        .toLocaleString("vi-VN") + "đ";

};


// ==================== TẠO BIỂU ĐỒ DOANH THU ====================

const createRevenueChart = () => {

    if (!revenueChart.value) return;


    // Nếu chart cũ tồn tại thì hủy
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }


    revenueChartInstance = new Chart(
        revenueChart.value,
        {
            type: "line",

            data: {

                labels: [
                    "Th1",
                    "Th2",
                    "Th3",
                    "Th4",
                    "Th5",
                    "Th6",
                    "Th7",
                    "Th8",
                    "Th9",
                    "Th10",
                    "Th11",
                    "Th12",
                ],

                datasets: [
                    {
                        label: "Doanh thu",

                        data: revenueData.value,

                        borderWidth: 2,

                        tension: 0,

                        fill: false,

                        pointRadius: 3,
                    },
                ],
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true,
                        position: "top",
                    },

                    tooltip: {

                        callbacks: {

                            label: (context) => {

                                return (
                                    " " +
                                    formatPrice(context.raw)
                                );

                            },

                        },

                    },

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: (value) => {

                                return formatPrice(value);

                            },

                        },

                    },

                    x: {

                        grid: {
                            display: true,
                        },

                    },

                },

            },

        }
    );

};


// ==================== TẠO BIỂU ĐỒ TRẠNG THÁI ====================

const createOrderChart = () => {

    if (!orderChart.value) return;


    // Hủy chart cũ
    if (orderChartInstance) {
        orderChartInstance.destroy();
    }


    orderChartInstance = new Chart(
        orderChart.value,
        {
            type: "pie",

            data: {

                labels: [
                    "Chờ xác nhận",
                    "Đã xác nhận",
                    "Đang giao hàng",
                    "Đã giao hàng",
                    "Hủy đơn",
                ],

                datasets: [
                    {
                        data: orderStatusData.value,

                        borderWidth: 1,
                    },
                ],

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false,
                    },

                },

            },

        }
    );

};


// =====================================================
// API DASHBOARD
// =====================================================
//
// Backend:
//
// GET /api/dashboard/statistics?year=2026
//
// Backend trả:
//
// {
//     year,
//     summary: {
//         totalOrders,
//         totalRevenue,
//         totalBooks,
//         totalUsers
//     },
//     monthlyRevenue: [
//         { month, revenue }
//     ],
//     orderStatusStatistics: [
//         { _id, count }
//     ]
// }
//
// =====================================================

const loadDashboardStatistics = async () => {
    try {
        const res = await userService.getDashboardStatistics(
            selectedYear.value
        );

        // Backend hiện tại trả trực tiếp:
        // {
        //     year,
        //     summary,
        //     monthlyRevenue,
        //     orderStatusStatistics,
        //     topBooks
        // }
        //
        // Không có res.data.success và res.data.data

        const data = res.data;

        console.log("Dữ liệu Dashboard:", data);

        // ==============================
        // 1. SUMMARY
        // ==============================

        const summary = data.summary || {};

        statistics.value = {
            orders: Number(summary.totalOrders || 0),
            revenue: Number(summary.totalRevenue || 0),
            products: Number(summary.totalBooks || 0),
            members: Number(summary.totalUsers || 0),
        };


        // ==============================
        // 2. DOANH THU 12 THÁNG
        // ==============================

        const monthlyRevenue = data.monthlyRevenue || [];

        // Luôn tạo đủ 12 tháng
        revenueData.value = Array(12).fill(0);

        monthlyRevenue.forEach((item) => {
            const month = Number(item.month);

            if (month >= 1 && month <= 12) {
                revenueData.value[month - 1] =
                    Number(item.revenue || 0);
            }
        });


        // ==============================
        // 3. TRẠNG THÁI ĐƠN HÀNG
        // ==============================

        const rawStatus =
            data.orderStatusStatistics || [];

        orderStatusData.value = ORDER_STATUS_IDS.map(
            (statusId) => {

                const found = rawStatus.find(
                    (item) =>
                        Number(item._id) ===
                        Number(statusId)
                );

                return found
                    ? Number(found.count || 0)
                    : 0;
            }
        );


        // ==============================
        // 4. VẼ LẠI BIỂU ĐỒ
        // ==============================

        createRevenueChart();
        createOrderChart();

    } catch (error) {

        console.error(
            "Lỗi lấy thống kê Dashboard:",
            error
        );

        // Reset dữ liệu nếu API lỗi
        statistics.value = {
            orders: 0,
            revenue: 0,
            products: 0,
            members: 0,
        };

        revenueData.value =
            Array(12).fill(0);

        orderStatusData.value =
            [0, 0, 0, 0, 0];

        createRevenueChart();
        createOrderChart();
    }
};


// ==================== LIFECYCLE ====================

onMounted(async () => {

    // Tạo chart rỗng trước
    createRevenueChart();

    createOrderChart();


    // Sau đó lấy dữ liệu từ backend
    await loadDashboardStatistics();

});


// ==================== HỦY CHART ====================

onBeforeUnmount(() => {

    if (revenueChartInstance) {

        revenueChartInstance.destroy();

        revenueChartInstance = null;

    }


    if (orderChartInstance) {

        orderChartInstance.destroy();

        orderChartInstance = null;

    }

});

</script>


<style scoped>
/* ==================== PAGE ==================== */

.dashboard {
    padding: 15px;
    background: #ffffff;
    min-height: calc(100vh - 60px);
    color: #333;
}


/* ==================== TITLE ==================== */

.page-title {
    font-size: 25px;
    font-weight: 500;
    margin: 0 0 8px;
    color: #222;
}


.breadcrumb {
    background: #e9ecef;
    border-radius: 3px;
    padding: 5px 8px;
    font-size: 13px;
    color: #666;
    margin-bottom: 12px;
}


/* ==================== STATISTICS CARDS ==================== */

.statistics-cards {
    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    gap: 13px;

    margin-bottom: 18px;
}


.stat-card {
    height: 54px;

    padding: 10px;

    border-radius: 3px;

    color: white;

    display: flex;

    flex-direction: column;

    justify-content: space-between;
}


.stat-blue {
    background: #1677ed;
}


.stat-yellow {
    background: #ffbd00;
}


.stat-green {
    background: #168b57;
}


.stat-red {
    background: #dc3545;
}


.stat-title {
    font-size: 12px;
    font-weight: 500;
}


.detail-btn {
    background: transparent;

    border: none;

    color: white;

    padding: 0;

    display: flex;

    justify-content: space-between;

    font-size: 11px;

    cursor: pointer;
}


/* ==================== CONTENT ==================== */

.dashboard-content {
    display: grid;

    grid-template-columns:
        minmax(0, 2fr) minmax(280px, 1fr);

    gap: 25px;
}


.revenue-section {
    min-width: 0;
}


.revenue-header {
    display: flex;

    justify-content: flex-start;

    margin-bottom: 10px;
}


.year-filter {
    display: flex;

    align-items: center;

    gap: 7px;

    font-size: 12px;
}


.year-filter select {
    width: 80px;

    padding: 4px;

    border: 1px solid #ddd;

    border-radius: 3px;
}


.chart-title {
    text-align: center;

    font-size: 11px;

    font-weight: 600;

    margin-bottom: 5px;
}


.chart-container {
    position: relative;

    height: 300px;

    width: 100%;
}


/* ==================== ORDER ==================== */

.order-section {
    min-width: 0;
}


.order-chart-title {
    text-align: center;

    font-size: 10px;

    font-weight: 600;

    margin-bottom: 10px;
}


/* ==================== LEGEND ==================== */

.legend {
    display: flex;

    flex-wrap: wrap;

    justify-content: center;

    gap: 7px;

    font-size: 8px;

    margin-bottom: 5px;
}


.legend>div {
    display: flex;

    align-items: center;

    gap: 3px;
}


.legend-color {
    width: 20px;

    height: 5px;

    display: inline-block;

    border: 1px solid #ddd;
}


.pending {
    background: #ffdddd;
}


.confirmed {
    background: #cdeaff;
}


.shipping {
    background: #fff0c7;
}


.delivered {
    background: #c9eeee;
}


.cancelled {
    background: #e6d9ff;
}


/* ==================== PIE CHART ==================== */

.pie-container {
    position: relative;

    height: 300px;

    width: 100%;
}


/* ==================== RESPONSIVE ==================== */

@media (max-width: 1000px) {

    .statistics-cards {
        grid-template-columns:
            repeat(2, 1fr);
    }


    .dashboard-content {
        grid-template-columns: 1fr;
    }

}


@media (max-width: 600px) {

    .statistics-cards {
        grid-template-columns: 1fr;
    }


    .chart-container {
        height: 250px;
    }


    .pie-container {
        height: 250px;
    }

}
</style>