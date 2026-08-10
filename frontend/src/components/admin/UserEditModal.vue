<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h3>Chỉnh sửa người dùng</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="form-row">
          <label>Email</label>
          <input type="email" v-model="form.email" required />
        </div>
        <div class="form-row">
          <label>Họ và tên</label>
          <input type="text" v-model="form.fullName" required />
        </div>
        <div class="form-row">
          <label>Số điện thoại</label>
          <input type="text" v-model="form.phone" required />
        </div>
        <div class="form-row">
          <label>Ngày sinh</label>
          <input type="date" v-model="form.dob" />
        </div>
        <div class="form-row">
          <label>Quyền</label>
          <select v-model="form.role">
            <option value="admin">admin</option>
            <option value="customer">customer</option>
          </select>
        </div>
        <div class="form-row">
          <label>Trạng thái</label>
          <select v-model="form.status">
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="$emit('close')">Huỷ</button>
          <button type="submit" class="btn-save" :disabled="saving">
            {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  user: { type: Object, required: true },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  _id: '',
  email: '',
  fullName: '',
  phone: '',
  dob: '',
  role: 'customer',
  status: 'active',
})

watch(
  () => props.user,
  (u) => {
    if (!u) return
    form._id = u._id
    form.email = u.email
    form.fullName = u.fullName
    form.phone = u.phone
    form.dob = u.dob ? u.dob.substring(0, 10) : ''
    form.role = u.role || 'customer'
    form.status = u.status || 'active'
  },
  { immediate: true }
)

function handleSubmit() {
  emit('save', { ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}
.modal-box {
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eef0f2;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
}
.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-row label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}
.form-row input,
.form-row select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.form-row input:focus,
.form-row select:focus {
  border-color: #2563eb;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
.btn-cancel {
  padding: 9px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
}
.btn-cancel:hover {
  background: #f3f4f6;
}
.btn-save {
  padding: 9px 18px;
  border-radius: 6px;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}
.btn-save:hover {
  background: #1d4ed8;
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
