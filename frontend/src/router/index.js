import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { hideHeader: true },   // ← thêm dòng này, áp dụng cho tất cả route con
    children: [
      {
        path: 'users',
        name: 'admin-user-list',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { title: 'Quản lý người dùng' },
        // không cần thêm hideHeader ở đây, tự động kế thừa từ cha
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/AuthView.vue'),
    meta: { title: 'Đăng nhập', mode: 'login' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/AuthView.vue'),
    meta: { title: 'Đăng ký', mode: 'register' },
  },
  {
    path: '/',
    redirect: '/admin/users',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title
})

export default router