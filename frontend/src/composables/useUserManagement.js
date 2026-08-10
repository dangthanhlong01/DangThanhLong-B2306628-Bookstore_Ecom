import { ref, reactive, watch } from 'vue'
import userService from '@/services/user.service'

export function useUserManagement() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const searchPhone = ref('')

  const pagination = reactive({
    page: 1,
    limit: 6,
    totalPages: 1,
    totalItems: 0,
  })

  const editingUser = ref(null)
  const isEditModalOpen = ref(false)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const res = await userService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        phone: searchPhone.value || undefined,
      })
      users.value = res.data
      pagination.totalPages = res.totalPages || 1
      pagination.totalItems = res.totalItems || res.data.length
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách người dùng'
    } finally {
      loading.value = false
    }
  }

  function goToPage(page) {
    if (page < 1 || page > pagination.totalPages) return
    pagination.page = page
  }

  function openEditModal(user) {
    editingUser.value = { ...user }
    isEditModalOpen.value = true
  }

  function closeEditModal() {
    editingUser.value = null
    isEditModalOpen.value = false
  }

  async function saveUser(payload) {
    loading.value = true
    try {
      await userService.updateUser(payload._id, payload)
      closeEditModal()
      await fetchUsers()
    } catch (err) {
      error.value = err.message || 'Cập nhật người dùng thất bại'
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(user) {
    const confirmed = window.confirm(`Bạn có chắc muốn xoá người dùng "${user.fullName}"?`)
    if (!confirmed) return
    loading.value = true
    try {
      await userService.deleteUser(user._id)
      // Nếu xoá phần tử cuối cùng của trang cuối thì lùi về trang trước
      if (users.value.length === 1 && pagination.page > 1) {
        pagination.page -= 1
      } else {
        await fetchUsers()
      }
    } catch (err) {
      error.value = err.message || 'Xoá người dùng thất bại'
    } finally {
      loading.value = false
    }
  }

  async function exportExcel() {
    try {
      const blob = await userService.exportExcel({ phone: searchPhone.value || undefined })
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `danh-sach-nguoi-dung-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      error.value = err.message || 'Xuất Excel thất bại'
    }
  }

  // Reset về trang 1 khi tìm kiếm thay đổi
  watch(searchPhone, () => {
    pagination.page = 1
    fetchUsers()
  })

  watch(() => pagination.page, () => {
    fetchUsers()
  })

  return {
    users,
    loading,
    error,
    searchPhone,
    pagination,
    editingUser,
    isEditModalOpen,
    fetchUsers,
    goToPage,
    openEditModal,
    closeEditModal,
    saveUser,
    deleteUser,
    exportExcel,
  }
}
