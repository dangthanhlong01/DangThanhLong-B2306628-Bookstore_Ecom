import axiosClient from './axiosClient'

const userService = {
  /**
   * Lấy danh sách người dùng có phân trang + tìm kiếm theo SĐT
   * @param {{page:number, limit:number, phone?:string}} params
   */
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
  // ============ AUTH ============
  loginWithGoogle(idToken) {
    return axiosClient.post('/auth/google', { idToken })
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
}

export default userService
