<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <span class="sidebar-title" v-show="!isCollapsed">Trang quản trị</span>
        <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" exact-active-class="active">
          <span v-show="!isCollapsed">Trang chủ</span>
        </router-link>

        <div class="nav-section-label" v-show="!isCollapsed">QUẢN LÝ</div>

        <div class="nav-group">
          <button class="nav-item nav-group-toggle" @click="toggleGroup('users')">
            <span v-show="!isCollapsed">Quản lý người dùng</span>
            <span class="chevron" v-show="!isCollapsed" :class="{ open: openGroups.users }">›</span>
          </button>
          <div class="nav-subitems" v-show="openGroups.users && !isCollapsed">
            <router-link to="/admin/users" class="nav-subitem" active-class="active">
              Danh sách người dùng
            </router-link>
          </div>
        </div>

        <router-link to="/admin/categories" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý danh mục</span>
        </router-link>
        <router-link to="/admin/restaurants" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý nhà hàng</span>
        </router-link>
        <router-link to="/admin/products" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý sản phẩm</span>
        </router-link>
        <router-link to="/admin/banners" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý băng rôn</span>
        </router-link>
        <router-link to="/admin/topics" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý chủ đề</span>
        </router-link>
        <router-link to="/admin/posts" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý bài đăng</span>
        </router-link>
        <router-link to="/admin/shipping-types" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý loại ship</span>
        </router-link>
        <router-link to="/admin/vouchers" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý voucher</span>
        </router-link>
        <router-link to="/admin/suppliers" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý NCC</span>
        </router-link>
        <router-link to="/admin/imports" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý nhập hàng</span>
        </router-link>
        <router-link to="/admin/orders" class="nav-item" active-class="active">
          <span v-show="!isCollapsed">Quản lý đơn hàng</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="main-wrapper">
      <header class="topbar">
        <button class="topbar-menu-btn" @click="isCollapsed = !isCollapsed">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <div class="topbar-right">
          <div class="user-menu" @click="userMenuOpen = !userMenuOpen">
            <span class="avatar-icon">Admin</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" />
            </svg>
            <div class="user-dropdown" v-if="userMenuOpen">
              <a href="#" @click.prevent="logout">Đăng xuất</a>
            </div>
          </div>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const router = useRouter()
const isCollapsed = ref(false)
const userMenuOpen = ref(false)
const openGroups = reactive({ users: true })

function toggleGroup(key) {
  openGroups[key] = !openGroups[key]
}

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #f4f5f7;
  margin: 0;
  padding: 0;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: #1f2937;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.2s ease;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid #2d3748;
}

.sidebar-title {
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  white-space: nowrap;
}

.toggle-btn {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.nav-section-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
  padding: 16px 16px 6px;
}

.nav-item,
.nav-group-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.nav-item:hover,
.nav-group-toggle:hover {
  background: #2a3441;
  color: #fff;
}

.nav-item.active {
  background: #2563eb22;
  color: #60a5fa;
  border-right: 3px solid #60a5fa;
}

.nav-icon {
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.chevron {
  margin-left: auto;
  transform: rotate(90deg);
  transition: transform 0.15s ease;
}

.chevron.open {
  transform: rotate(-90deg);
}

.nav-subitems {
  display: flex;
  flex-direction: column;
  background: #171f2b;
}

.nav-subitem {
  padding: 9px 16px 9px 44px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 13.5px;
}

.nav-subitem:hover {
  color: #fff;
  background: #232d3b;
}

.nav-subitem.active {
  color: #60a5fa;
  font-weight: 500;
}

/* Main */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 56px;
  background: #1f2937;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: #fff;
  flex-shrink: 0;
}

.topbar-menu-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: none;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
}

.user-menu:hover {
  background: #2a3441;
}

.avatar-icon {
  font-size: 18px;
}

.user-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  background: #fff;
  color: #1f2937;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 130px;
  overflow: hidden;
  z-index: 20;
}

.user-dropdown a {
  display: block;
  padding: 10px 14px;
  text-decoration: none;
  color: #1f2937;
  font-size: 14px;
}

.user-dropdown a:hover {
  background: #f1f5f9;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 30;
    height: 100vh;
  }

  .sidebar.collapsed {
    width: 0;
    overflow: hidden;
  }
}
</style>