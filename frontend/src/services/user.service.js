import axiosClient from './axiosClient'

const userService = {
    // =====================================================
    // USER
    // =====================================================

    getUsers(params = {}) {
        return axiosClient.get('/users', { params })
    },

    getUserById(id) {
        return axiosClient.get(`/users/${id}`)
    },

    createUser(data) {
        return axiosClient.post('/users', data)
    },

    updateUser(id, data) {
        return axiosClient.put(`/users/${id}`, data)
    },

    deleteUser(id) {
        return axiosClient.delete(`/users/${id}`)
    },

    exportExcel(params = {}) {
        return axiosClient.get('/users/export-excel', {
            params,
            responseType: 'blob',
        })
    },

    // =====================================================
    // AUTH
    // =====================================================

    loginWithGoogle(idToken) {
        console.log(
            "GOOGLE API URL:",
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`
        )

        console.log("GOOGLE TOKEN EXISTS:", !!idToken)

        return axiosClient.post("/auth/google", {
            idToken,
        })
    },

    login(data) {
        return axiosClient.post('/auth/login', data)
    },

    register(data) {
        return axiosClient.post('/auth/register', data)
    },

    sendOtp(email) {
        return axiosClient.post('/auth/send-otp', { email })
    },

    verifyOtp(email, otp) {
        return axiosClient.post('/auth/verify-otp', { email, otp })
    },

    // =====================================================
    // BANNER
    // =====================================================

    getAllBanner() {
        return axiosClient.get('/banners/active')
    },

    getAllBannersAdmin(params = {}) {
        return axiosClient.get('/banners', { params })
    },

    getBannerById(id) {
        return axiosClient.get(`/banners/${id}`)
    },

    createBanner(data) {
        const formData = new FormData()

        formData.append('name', data.name)
        formData.append('description', data.description || '')
        formData.append('statusId', data.statusId || 'active')

        if (data.image) {
            formData.append('image', data.image)
        }

        return axiosClient.post('/banners', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    updateBanner(id, data) {
        const formData = new FormData()

        if (data.name !== undefined) {
            formData.append('name', data.name)
        }

        if (data.description !== undefined) {
            formData.append('description', data.description)
        }

        if (data.statusId !== undefined) {
            formData.append('statusId', data.statusId)
        }

        if (data.image) {
            formData.append('image', data.image)
        }

        return axiosClient.put(`/banners/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    deleteBanner(id) {
        return axiosClient.delete(`/banners/${id}`)
    },

    // =====================================================
    // CATEGORY
    // =====================================================

    getCategories(params = {}) {
        return axiosClient.get('/categories', { params })
    },

    getCategoryById(id) {
        return axiosClient.get(`/categories/${id}`)
    },

    getCategoryBySlug(slug) {
        return axiosClient.get(`/categories/slug/${slug}`)
    },

    createCategory(data) {
        return axiosClient.post('/categories', data)
    },

    updateCategory(id, data) {
        return axiosClient.put(`/categories/${id}`, data)
    },

    deleteCategory(id) {
        return axiosClient.delete(`/categories/${id}`)
    },

    // =====================================================
    // BOOK
    // =====================================================

    getBooks(params = {}) {
        return axiosClient.get('/books', { params })
    },

    getBookById(id) {
        return axiosClient.get(`/books/${id}`)
    },

    getBookBySlug(slug) {
        return axiosClient.get(`/books/slug/${slug}`)
    },

    createBook(data) {
        return axiosClient.post('/books', data)
    },

    updateBook(id, data) {
        return axiosClient.put(`/books/${id}`, data)
    },

    deleteBook(id) {
        return axiosClient.delete(`/books/${id}`)
    },

    // =====================================================
    // PUBLISHER
    // =====================================================

    getPublishers(params = {}) {
        return axiosClient.get("/publishers", { params })
    },

    getPublisherById(id) {
        return axiosClient.get(`/publishers/${id}`)
    },

    getPublisherBySlug(slug) {
        return axiosClient.get(`/publishers/slug/${slug}`)
    },

    createPublisher(data) {
        return axiosClient.post("/publishers", data)
    },

    updatePublisher(id, data) {
        return axiosClient.put(`/publishers/${id}`, data)
    },

    deletePublisher(id) {
        return axiosClient.delete(`/publishers/${id}`)
    },

    // =====================================================
    // AUTHOR
    // =====================================================

    getAuthors(params = {}) {
        return axiosClient.get("/authors", { params })
    },

    getAuthorById(id) {
        return axiosClient.get(`/authors/${id}`)
    },

    getAuthorBySlug(slug) {
        return axiosClient.get(`/authors/slug/${slug}`)
    },

    createAuthor(data) {
        return axiosClient.post("/authors", data)
    },

    updateAuthor(id, data) {
        return axiosClient.put(`/authors/${id}`, data)
    },

    deleteAuthor(id) {
        return axiosClient.delete(`/authors/${id}`)
    },

    // =====================================================
    // SHIPPING TYPE
    // =====================================================

    getShippingTypes() {
        return axiosClient.get("/shipping-types")
    },

    getShippingTypeById(id) {
        return axiosClient.get(`/shipping-types/${id}`)
    },

    createShippingType(data) {
        return axiosClient.post("/shipping-types", data)
    },

    updateShippingType(id, data) {
        return axiosClient.put(`/shipping-types/${id}`, data)
    },

    deleteShippingType(id) {
        return axiosClient.delete(`/shipping-types/${id}`)
    },

    // =====================================================
    // VOUCHER
    // =====================================================

    // -------------------------
    // CUSTOMER
    // -------------------------

    // Lấy voucher đang hoạt động
    getActiveVouchers(params = {}) {
        return axiosClient.get("/vouchers/active", { params })
    },

    // Kiểm tra voucher khi đặt hàng
    validateVoucher(code, orderValue) {
        return axiosClient.post("/vouchers/validate", {
            code,
            orderValue,
        })
    },

    // User lưu voucher vào ví
    collectVoucher(voucherId) {
        return axiosClient.post("/vouchers/collect", {
            voucherId,
        })
    },

    // Lấy voucher của user hiện tại
    getMyVouchers(params = {}) {
        return axiosClient.get("/vouchers/my", { params })
    },

    // Đánh dấu voucher đã sử dụng
    markVoucherUsed(voucherId) {
        return axiosClient.put("/vouchers/use", {
            voucherId,
        })
    },

    // -------------------------
    // ADMIN
    // -------------------------

    // Lấy danh sách tất cả voucher
    getVouchers(params = {}) {
        return axiosClient.get("/vouchers", {
            params,
        })
    },

    // Lấy voucher theo ID
    getVoucherById(id) {
        return axiosClient.get(`/vouchers/${id}`)
    },

    // Tạo voucher
    createVoucher(data) {
        return axiosClient.post("/vouchers", data)
    },

    // Cập nhật voucher
    updateVoucher(id, data) {
        return axiosClient.put(`/vouchers/${id}`, data)
    },

    // Xóa voucher
    deleteVoucher(id) {
        return axiosClient.delete(`/vouchers/${id}`)
    },

    // Admin xem danh sách user đã lưu voucher
    getVoucherUsers(params = {}) {
        return axiosClient.get("/vouchers/users", {
            params,
        })
    },

    // =====================================================
    // ORDER BOOK - CUSTOMER
    // =====================================================

    // Lấy danh sách đơn hàng của user đang đăng nhập
    getOrderBooks(params = {}) {
        return axiosClient.get("/order-books", { params })
    },

    // Lấy một đơn hàng
    getOrderBookById(id) {
        return axiosClient.get(`/order-books/${id}`)
    },

    // Tạo đơn hàng
    createOrderBook(data) {
        return axiosClient.post("/order-books", data)
    },

    // Cập nhật đơn hàng của customer
    updateOrderBook(id, data) {
        return axiosClient.put(`/order-books/${id}`, data)
    },

    // Xóa đơn hàng
    deleteOrderBook(id) {
        return axiosClient.delete(`/order-books/${id}`)
    },

    // =====================================================
    // ORDER BOOK - ADMIN
    // =====================================================

    // Admin lấy toàn bộ đơn hàng
    getAllOrderBooksAdmin(params = {}) {
        return axiosClient.get("/order-books/admin/all", {
            params,
        })
    },

    // Admin xem một đơn hàng
    getOrderBookByIdAdmin(id) {
        return axiosClient.get(`/order-books/admin/${id}`)
    },

    // Admin lấy sản phẩm trong đơn hàng
    getOrderDetailsAdmin(orderId) {
        return axiosClient.get(
            `/order-books/admin/${orderId}/details`
        )
    },

    // Admin CHỈ cập nhật trạng thái đơn hàng
    updateOrderBookAdmin(id, statusId) {
        return axiosClient.put(
            `/order-books/admin/${id}/status`,
            {
                statusId,
            }
        )
    },

    // Admin xóa đơn hàng
    deleteOrderBookAdmin(id) {
        return axiosClient.delete(
            `/order-books/admin/${id}`
        )
    },

    // =====================================================
    // ORDER DETAIL - CUSTOMER
    // =====================================================

    // Lấy danh sách sách trong đơn hàng
    getOrderDetails(orderId) {
        return axiosClient.get(
            `/order-books/${orderId}/details`
        )
    },

    // Lấy một chi tiết đơn hàng
    getOrderDetailById(id) {
        return axiosClient.get(
            `/order-books/details/${id}`
        )
    },

    // Thêm sách vào đơn hàng
    createOrderDetail(orderId, data) {
        return axiosClient.post(
            `/order-books/${orderId}/details`,
            data
        )
    },

    // Cập nhật chi tiết đơn hàng
    updateOrderDetail(id, data) {
        return axiosClient.put(
            `/order-books/details/${id}`,
            data
        )
    },

    // Xóa sách khỏi đơn hàng
    deleteOrderDetail(id) {
        return axiosClient.delete(
            `/order-books/details/${id}`
        )
    },

    // =====================================================
    // DASHBOARD
    // =====================================================

    getDashboardStatistics(year) {
        return axiosClient.get("/dashboard/statistics", {
            params: {
                year,
            },
        })
    },

    // =====================================================
    // USER PROFILE
    // =====================================================

    getProfile() {
        return axiosClient.get("/users/profile")
    },

    updateProfile(data) {
        return axiosClient.put("/users/profile", data)
    },

    // =====================================================
    // USER ADDRESS
    // =====================================================

    getAddresses() {
        return axiosClient.get("/users/addresses")
    },

    addAddress(data) {
        return axiosClient.post("/users/addresses", data)
    },

    updateAddress(id, data) {
        return axiosClient.put(
            `/users/addresses/${id}`,
            data
        )
    },

    deleteAddress(id) {
        return axiosClient.delete(
            `/users/addresses/${id}`
        )
    },

    // =====================================================
    // CART
    // =====================================================

    getCartByUserId(userId) {
        return axiosClient.get(`/shopcart/${userId}`)
    },

    addToCart(data) {
        return axiosClient.post("/shopcart", data)
    },

    updateQuantity(id, data) {
        return axiosClient.put(
            `/shopcart/${id}`,
            data
        )
    },

    deleteCartItem(id, userId) {
        return axiosClient.delete(
            `/shopcart/${id}`,
            {
                data: {
                    userId,
                },
            }
        )
    },
    // =====================================================
    // CHATBOT
    // =====================================================

    getChatbotWelcome() {
        return axiosClient.get("/chatbot/welcome")
    },

    sendChatbotMessage(messages, userMessage) {
        return axiosClient.post("/chatbot/message", {
            messages,
            userMessage,
        })
    },
}



export default userService