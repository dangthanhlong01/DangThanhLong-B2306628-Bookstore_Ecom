import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { hideHeader: true, hideFooter: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/admin/dashboard/Dashboard.vue'),
        meta: { title: 'Thống kê' },
      },
      {
        path: 'users',
        name: 'admin-user-list',
        component: () => import('../views/admin/user/UserManagement.vue'),
        meta: { title: 'Quản lý người dùng' },
      },
      {
        path: 'banners',
        name: 'admin-banner-list',
        component: () => import('../views/admin/Banner/BannerManagement.vue'),
        meta: { title: 'Quản lý banner' },
      },
      {
        path: 'books',
        name: 'admin-book-list',
        component: () => import('../views/admin/book/BookManagement.vue'),
        meta: { title: 'Quản lý sách' },
      },
      {
        path: 'categories',
        name: 'admin-category-list',
        component: () => import('../views/admin/category/CategoryManagement.vue'),
        meta: { title: 'Quản lý danh mục' },
      },
      {
        path: 'publishers',
        name: 'admin-publisher-list',
        component: () => import('../views/admin/publisher/PublisherManagement.vue'),
        meta: { title: 'Quản lý nhà xuất bản' },
      },
      {
        path: 'authors',
        name: 'admin-author-list',
        component: () => import('../views/admin/author/AuthorManagement.vue'),
        meta: { title: 'Quản lý tác giả' },
      },
      {
        path: 'vouchers',
        name: 'admin-voucher-list',
        component: () => import('../views/admin/voucher/VoucherManagement.vue'),
        meta: { title: 'Quản lý voucher' },
      },
      {
        path: 'shipping-types',
        name: 'admin-shipping-type-list',
        component: () => import('../views/admin/ShippingType/ShippingType.vue'),
        meta: { title: 'Quản lý loại ship' },
      },
      {
        path: 'orders',
        name: 'admin-order-list',
        component: () => import('../views/admin/order/OrderManagement.vue'),
        meta: { title: 'Quản lý đơn hàng' },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/AuthView.vue'),
    meta: {
      title: 'Đăng nhập',
      mode: 'login',
      hideFooter: true,
    },
  },

  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/AuthView.vue'),
    meta: {
      title: 'Đăng ký',
      mode: 'register',
      hideFooter: true,
    },
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/HomePage.vue'),
    meta: { title: 'Trang chủ' },
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('../views/shop/ShopPage.vue'),
    meta: { title: 'Cửa hàng' },
  },
  // {
  //   path: '/book/:slug',
  //   name: 'BookDetail',
  //   component: () => import('../views/bookdetail/BookDetail.vue'),
  //   meta: { title: 'Chi tiết sách' },
  // },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/about/AboutPage.vue'),
    meta: { title: 'Giới thiệu' },
  },
  {
    path: '/voucher',
    name: 'Voucher',
    component: () => import('../views/voucher/VoucherPage.vue'),
    meta: { title: 'Giảm giá' },
    requiresAuth: true,
  },
  {
    path: '/bookdetail/:id',
    name: 'BookDetail',
    component: () => import('../views/bookdetail/BookDetail.vue'),
    meta: { title: 'Chi tiết sách' },
  },
  {
    path: '/shopcart',
    name: 'Cart',
    component: () => import('../views/Cart/CartPage.vue'),
    meta: { title: 'Giỏ hàng' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/order/OrderPage.vue'),
    meta: { title: 'Thanh toán' },
  },
  {
    path: "/user",
    component: () => import("@/views/user/UserHomepage.vue"),

    children: [

      {
        path: "",
        redirect: "/user/profile",
      },

      {
        path: "profile",
        name: "user-profile",
        component: () => import("@/views/user/DetailUserPage.vue"),
        meta: {
          title: "Thông tin cá nhân",
        },
      },

      {
        path: "orders",
        name: "user-orders",
        component: () => import("@/views/user/OrderHistory.vue"),
        meta: {
          title: "Đơn hàng",
        },
      },
      {
        path: "vouchers",
        name: "user-vouchers",
        component: () => import("@/views/user/VoucherPage.vue"),
        meta: {
          title: "Kho voucher",
        },
      },
      {
        path: 'address',
        name: 'user-address',
        component: () => import('@/views/user/AddressUserPage.vue'),
        meta: {
          title: 'Địa chỉ giao hàng',
        }
      }
    ],
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title
})
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')

    if (!token) {
      next({
        name: 'login',
        query: {
          redirect: to.fullPath
        }
      })
      return
    }
  }

  next()
})
export default router