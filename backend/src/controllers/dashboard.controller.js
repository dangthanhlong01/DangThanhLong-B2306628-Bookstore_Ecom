import dashboardService from "../services/dashboard.service.js";


/**
 * GET /api/dashboard/statistics
 *
 * Lấy toàn bộ thống kê Dashboard Admin
 */
const getDashboardStatistics = async (req, res) => {

    try {

        // Lấy năm từ query
        //
        // Ví dụ:
        // /api/dashboard/statistics?year=2026
        //
        const { year } = req.query;


        // Gọi service
        const data =
            await dashboardService.getDashboardStatistics({
                year,
            });


        // Trả kết quả thành công
        return res.status(200).json({

            success: true,

            message:
                "Lấy thống kê Dashboard thành công",

            data,

        });


    } catch (error) {

        console.error(
            "Lỗi lấy thống kê Dashboard:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Lỗi server khi lấy thống kê Dashboard",

            error:
                error.message,

        });

    }

};


export default {
    getDashboardStatistics,
};