import { ref, reactive } from 'vue'
import userService from '@/services/user.service'

export function useBannerManagement() {
    const banners = ref([])
    const loading = ref(false)
    const error = ref('')
    const searchName = ref('')

    const pagination = reactive({
        page: 1,
        limit: 10,
        totalPages: 1,
    })

    // banner = null -> modal đang ở chế độ Thêm mới
    // banner = object -> modal đang ở chế độ Sửa
    const editingBanner = ref(null)
    const isModalOpen = ref(false)

    async function fetchBanners() {
        loading.value = true
        error.value = ''
        try {
            const res = await userService.getAllBannersAdmin({
                page: pagination.page,
                limit: pagination.limit,
                name: searchName.value || undefined,
            })
            if (res && res.success) {
                banners.value = res.data
                pagination.totalPages = res.totalPages || 1
            } else {
                error.value = res?.message || 'Không lấy được danh sách banner'
            }
        } catch (err) {
            error.value = err?.message || 'Lỗi khi lấy danh sách banner'
        } finally {
            loading.value = false
        }
    }

    function goToPage(p) {
        pagination.page = p
        fetchBanners()
    }

    function openAddModal() {
        editingBanner.value = null
        isModalOpen.value = true
    }

    function openEditModal(banner) {
        editingBanner.value = banner
        isModalOpen.value = true
    }

    function closeModal() {
        isModalOpen.value = false
        editingBanner.value = null
    }

    async function saveBanner(formData) {
        loading.value = true
        error.value = ''
        try {
            const res = editingBanner.value
                ? await userService.updateBanner(editingBanner.value._id, formData)
                : await userService.createBanner(formData)

            if (res && res.success) {
                closeModal()
                await fetchBanners()
            } else {
                error.value = res?.message || 'Lưu banner thất bại'
            }
        } catch (err) {
            error.value = err?.message || 'Lỗi khi lưu banner'
        } finally {
            loading.value = false
        }
    }

    async function deleteBanner(banner) {
        if (!confirm(`Xoá banner "${banner.name}"?`)) return
        loading.value = true
        error.value = ''
        try {
            const res = await userService.deleteBanner(banner._id)
            if (res && res.success) {
                await fetchBanners()
            } else {
                error.value = res?.message || 'Xoá banner thất bại'
            }
        } catch (err) {
            error.value = err?.message || 'Lỗi khi xoá banner'
        } finally {
            loading.value = false
        }
    }

    return {
        banners,
        loading,
        error,
        searchName,
        pagination,
        editingBanner,
        isModalOpen,
        fetchBanners,
        goToPage,
        openAddModal,
        openEditModal,
        closeModal,
        saveBanner,
        deleteBanner,
    }
}