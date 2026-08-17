<template>
  <div class="top-menu">
    <div class="container">
      <div class="top-left">
        <p>Điện thoại:</p>
        <p>Email: longthanhlong789@gmail.com</p>
      </div>

      <div class="top-right">
        <ul>
          <li v-if="userStore.isLoggedIn">
            <router-link :to="`/user/profile/`">
              {{ userStore.user.fullName }}
            </router-link>
          </li>

          <li v-else>
            <router-link to="/login">
              Đăng nhập
            </router-link>
          </li>

          <li v-if="userStore.isLoggedIn">
            <a href="#" @click.prevent="handleLogout">
              Đăng xuất
            </a>
          </li>

          <li v-else>
            <router-link to="/register">
              Đăng ký
            </router-link>
          </li>

          <li>
            <a href="#">VI</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.top-menu {
  width: 100%;
  height: 40px;

  background: #f8f8f8;

  border-bottom: 1px solid #eeeeee;

  font-size: 13px;
}

.container {
  width: 1200px;
  max-width: calc(100% - 30px);

  margin: 0 auto;

  height: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-left {
  display: flex;
  gap: 25px;

  color: #777;
}

.top-left p {
  margin: 0;
}

.top-right ul {
  display: flex;

  list-style: none;

  margin: 0;
  padding: 0;

  gap: 22px;
}

.top-right a {
  text-decoration: none;

  color: #555;

  transition: color 0.2s;
}

.top-right a:hover {
  color: #71cd14;
}
</style>