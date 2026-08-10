<template>
  <div class="user-list-view">
    <h1 class="page-title">Quản lý người dùng</h1>

    <p v-if="error" class="error-banner">{{ error }}</p>

    <UserTable
      :users="users"
      :loading="loading"
      :page="pagination.page"
      :limit="pagination.limit"
      :total-pages="pagination.totalPages"
      :search="searchPhone"
      @update:search="searchPhone = $event"
      @go-to-page="goToPage"
      @export="exportExcel"
      @edit="openEditModal"
      @delete="deleteUser"
    />

    <UserEditModal
      v-if="isEditModalOpen && editingUser"
      :user="editingUser"
      :saving="loading"
      @close="closeEditModal"
      @save="saveUser"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import UserTable from '@/components/admin/UserTable.vue'
import UserEditModal from '@/components/admin/UserEditModal.vue'
import { useUserManagement } from '@/composables/useUserManagement'

const {
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
} = useUserManagement()

onMounted(fetchUsers)
</script>

<style scoped>
.user-list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.error-banner {
  background: #fee2e2;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 14px;
  margin: 0;
}
</style>
