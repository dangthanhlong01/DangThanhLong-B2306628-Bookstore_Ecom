<template>
  <div class="table-card">
    <div class="table-card-header">
      <div class="header-title">
        <span class="icon">▦</span>
        <span>Danh sách người dùng</span>
      </div>
    </div>

    <div class="table-toolbar">
      <div class="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm theo số điện thoại"
          v-model="searchModel"
        />
        <span class="search-icon">🔍</span>
      </div>

      <button class="btn-export" @click="$emit('export')">
        Xuất excel
        <span class="export-icon">⬇</span>
      </button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Email</th>
            <th>Họ và tên</th>
            <th>Số điện thoại</th>
            <th>Ngày sinh</th>
            <th>Quyền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="state-cell">Đang tải...</td>
          </tr>
          <tr v-else-if="!users.length">
            <td colspan="8" class="state-cell">Không có người dùng nào</td>
          </tr>
          <tr v-for="(user, index) in users" :key="user._id">
            <td>{{ startIndex + index }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ formatDate(user.dob) }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span class="status-badge" :class="user.status">
                {{ user.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động' }}
              </span>
            </td>
            <td class="actions">
              <a href="#" class="link-edit" @click.prevent="$emit('edit', user)">Edit</a>
              <a href="#" class="link-delete" @click.prevent="$emit('delete', user)">Delete</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page === 1" @click="$emit('go-to-page', page - 1)">
        Quay lại
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        class="page-num"
        :class="{ active: p === page }"
        @click="$emit('go-to-page', p)"
      >
        {{ p }}
      </button>
      <button class="page-btn" :disabled="page === totalPages" @click="$emit('go-to-page', page + 1)">
        Tiếp
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  limit: { type: Number, default: 6 },
  totalPages: { type: Number, default: 1 },
  search: { type: String, default: '' },
})

const emit = defineEmits(['edit', 'delete', 'go-to-page', 'export', 'update:search'])

const searchModel = computed({
  get: () => props.search,
  set: (val) => emit('update:search', val),
})

const startIndex = computed(() => (props.page - 1) * props.limit + 1)

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('vi-VN')
}
</script>

<style scoped>
.table-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.table-card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eef0f2;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}
.icon {
  color: #2563eb;
}
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  flex-wrap: wrap;
}
.search-box {
  position: relative;
  max-width: 320px;
  flex: 1;
  min-width: 220px;
}
.search-box input {
  width: 100%;
  padding: 8px 36px 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.search-box input:focus {
  border-color: #2563eb;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}
.btn-export {
  background: #16a34a;
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-export:hover {
  background: #15803d;
}
.table-wrapper {
  overflow-x: auto;
  padding: 0 4px 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
thead th {
  text-align: left;
  padding: 10px 16px;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #eef0f2;
  white-space: nowrap;
}
tbody td {
  padding: 12px 16px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}
tbody tr:hover {
  background: #f9fafb;
}
.state-cell {
  text-align: center;
  color: #9ca3af;
  padding: 24px !important;
}
.actions {
  display: flex;
  gap: 12px;
}
.link-edit {
  color: #2563eb;
  text-decoration: none;
  font-size: 13.5px;
}
.link-edit:hover {
  text-decoration: underline;
}
.link-delete {
  color: #dc2626;
  text-decoration: none;
  font-size: 13.5px;
}
.link-delete:hover {
  text-decoration: underline;
}
.status-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 500;
}
.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}
.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px;
}
.page-btn {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13.5px;
  cursor: pointer;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-btn:not(:disabled):hover {
  background: #f3f4f6;
}
.page-num {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  font-size: 13.5px;
  cursor: pointer;
}
.page-num:hover {
  background: #f3f4f6;
}
.page-num.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
</style>
