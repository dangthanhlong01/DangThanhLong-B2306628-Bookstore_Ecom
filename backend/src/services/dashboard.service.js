import OrderBook from "../models/OrderBook.js";
import OrderDetail from "../models/OrderDetail.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

/**
 * Lấy toàn bộ thống kê cho Dashboard Admin
 *
 * @param {Object} params
 * @param {number|string} params.year - Năm cần thống kê
 */
const getDashboardStatistics = async ({ year }) => {
    // Nếu frontend không truyền year
    // thì lấy năm hiện tại
    const selectedYear =
        Number(year) || new Date().getFullYear();


    // =====================================================
    // 1. TỔNG SỐ ĐƠN HÀNG
    // =====================================================

    const totalOrders =
        await OrderBook.countDocuments();


    // =====================================================
    // 2. TỔNG SỐ THÀNH VIÊN
    // =====================================================

    const totalUsers =
        await User.countDocuments();


    // =====================================================
    // 3. TỔNG SỐ SÁCH
    // =====================================================

    const totalBooks =
        await Book.countDocuments();


    // =====================================================
    // 4. DOANH THU THEO TỪNG THÁNG
    // =====================================================

    const startDate =
        new Date(
            `${selectedYear}-01-01T00:00:00.000Z`
        );

    const endDate =
        new Date(
            `${selectedYear + 1}-01-01T00:00:00.000Z`
        );


    const revenueByMonth =
        await OrderDetail.aggregate([

            // Lấy thông tin OrderBook
            {
                $lookup: {
                    from: "orderbooks",
                    localField: "orderId",
                    foreignField: "_id",
                    as: "order",
                },
            },


            // Chuyển order từ array thành object
            {
                $unwind: "$order",
            },


            // Chỉ lấy đơn hàng trong năm được chọn
            {
                $match: {
                    "order.createdAt": {
                        $gte: startDate,
                        $lt: endDate,
                    },
                },
            },


            // Gom doanh thu theo tháng
            {
                $group: {
                    _id: {
                        $month: "$order.createdAt",
                    },

                    revenue: {
                        $sum: {
                            $multiply: [
                                "$quantity",
                                "$realPrice",
                            ],
                        },
                    },
                },
            },


            // Sắp xếp tháng tăng dần
            {
                $sort: {
                    "_id": 1,
                },
            },

        ]);


    // =====================================================
    // 5. TẠO ĐỦ 12 THÁNG
    // =====================================================

    const monthlyRevenue =
        Array.from(
            { length: 12 },
            (_, index) => {

                const month =
                    index + 1;


                const found =
                    revenueByMonth.find(
                        (item) =>
                            item._id === month
                    );


                return {
                    month,

                    revenue:
                        found
                            ? found.revenue
                            : 0,
                };

            }
        );


    // =====================================================
    // 6. TỔNG DOANH THU
    // =====================================================

    const totalRevenue =
        monthlyRevenue.reduce(
            (total, item) =>
                total + item.revenue,
            0
        );


    // =====================================================
    // 7. THỐNG KÊ TRẠNG THÁI ĐƠN HÀNG
    // =====================================================

    const orderStatusStatistics =
        await OrderBook.aggregate([

            {
                $group: {

                    _id: "$statusId",

                    count: {
                        $sum: 1,
                    },

                },
            },

        ]);


    // =====================================================
    // 8. TOP 10 SÁCH BÁN CHẠY
    // =====================================================

    const topBooks =
        await OrderDetail.aggregate([

            // Gom theo sách
            {
                $group: {

                    _id: "$productId",

                    totalQuantity: {
                        $sum: "$quantity",
                    },

                    totalRevenue: {
                        $sum: {
                            $multiply: [
                                "$quantity",
                                "$realPrice",
                            ],
                        },
                    },

                },
            },


            // Sắp xếp số lượng bán giảm dần
            {
                $sort: {
                    totalQuantity: -1,
                },
            },


            // Chỉ lấy 10 sách
            {
                $limit: 10,
            },


            // Join với Book
            {
                $lookup: {

                    from: "books",

                    localField: "_id",

                    foreignField: "_id",

                    as: "book",

                },
            },


            // Chuyển book array thành object
            {
                $unwind: {

                    path: "$book",

                    preserveNullAndEmptyArrays: true,

                },
            },


            // Chọn dữ liệu trả về
            {
                $project: {

                    _id: 1,

                    totalQuantity: 1,

                    totalRevenue: 1,

                    book: {

                        _id: "$book._id",

                        title: "$book.title",

                        price: "$book.price",

                        image: "$book.image",

                    },

                },
            },

        ]);


    // =====================================================
    // 9. TRẢ KẾT QUẢ
    // =====================================================

    return {

        year: selectedYear,

        summary: {

            totalOrders,

            totalRevenue,

            totalBooks,

            totalUsers,

        },

        monthlyRevenue,

        orderStatusStatistics,

        topBooks,

    };
};


export default {
    getDashboardStatistics,
};