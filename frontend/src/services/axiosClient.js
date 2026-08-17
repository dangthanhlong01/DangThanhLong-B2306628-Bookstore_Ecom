import axios from "axios";

const axiosClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json",
    },
});

// Gắn token vào mỗi request nếu có
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu gửi FormData thì xóa Content-Type JSON
    // để Axios tự tạo multipart/form-data + boundary
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }

    return config;
});

// Xử lý lỗi chung
axiosClient.interceptors.response.use(
    (response) => response.data,

    (error) => {
        const isAuthEndpoint =
            error.config?.url?.includes("/auth/login") ||
            error.config?.url?.includes("/auth/register") ||
            error.config?.url?.includes("/auth/google");

        // 401 thì đăng xuất, trừ các API đăng nhập/đăng ký
        if (
            error.response?.status === 401 &&
            !isAuthEndpoint
        ) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(
            error.response?.data || error
        );
    }
);

export default axiosClient;