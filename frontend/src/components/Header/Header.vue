<template>
    <header class="header-area">

        <!-- Thanh thông tin phía trên -->
        <TopMenu/>

        <!-- Header chính -->
        <div class="main-menu" :class="{ sticky: isSticky }">

            <div class="container">

                <nav class="navbar">

                    <!-- ================= LOGO ================= -->

                    <router-link to="/home" class="logo">
                        <img :src="logo" alt="Logo" />
                    </router-link>


                    <!-- ================= MOBILE BUTTON ================= -->

                    <button class="mobile-button" @click="mobileMenuOpen = !mobileMenuOpen">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>


                    <!-- ================= MENU ================= -->

                    <div class="navbar-content" :class="{ open: mobileMenuOpen }">

                        <ul class="nav-menu">

                            <li>
                                <router-link to="/home" class="nav-link" active-class="selected">
                                    Trang chủ
                                </router-link>
                            </li>

                            <li>
                                <router-link to="/shop" class="nav-link" active-class="selected">
                                    Cửa hàng
                                </router-link>
                            </li>

                            <li>
                                <router-link to="/blog" class="nav-link" active-class="selected">
                                    Tin tức
                                </router-link>
                            </li>

                            <li>
                                <router-link to="/voucher" class="nav-link" active-class="selected">
                                    Giảm giá
                                </router-link>
                            </li>

                            <li>
                                <router-link to="/about" class="nav-link" active-class="selected">
                                    Giới thiệu
                                </router-link>
                            </li>

                        </ul>


                        <!-- ================= ICONS ================= -->

                        <ul class="right-nav">

                            <!-- Messenger -->
                            <li class="icon-item">

                                <router-link to="/user/messenger" class="icon-link">
                                    <i class="fa-brands fa-facebook-messenger"></i>
                                </router-link>

                                <!-- Số tin nhắn chưa đọc -->
                                <span v-if="quantityMessage > 0" class="message-quantity">
                                    {{ quantityMessage }}
                                </span>

                            </li>


                            <!-- Giỏ hàng -->
                            <li class="icon-item">

                                <router-link to="/shopcart" class="icon-link">
                                    🛒
                                </router-link>

                                <!-- Số sản phẩm trong giỏ -->
                                <span class="cart-quantity">
                                    {{ cartQuantity }}
                                </span>

                            </li>


                            <!-- User -->
                            <li class="icon-item">

                                <router-link :to="user?.id
                                    ? `/user/detail/${user.id}`
                                    : '/login'" class="icon-link">
                                    👤
                                </router-link>

                            </li>

                        </ul>

                    </div>

                </nav>

            </div>

        </div>

    </header>
</template>


<script setup>
import logo from '@/assets/logo.jpg'

import {
    ref,
    onMounted,
    onBeforeUnmount
} from 'vue'

import TopMenu from './TopMenu.vue'


// ================= USER =================

// Lấy user từ localStorage
const user = ref(
    JSON.parse(
        localStorage.getItem('userData') || 'null'
    )
)


// ================= CART =================

// Số lượng sản phẩm trong giỏ hàng
const cartQuantity = ref(0)


// ================= MESSAGE =================

// Số tin nhắn chưa đọc
const quantityMessage = ref(0)


// ================= MOBILE MENU =================

// Trạng thái menu mobile
const mobileMenuOpen = ref(false)


// ================= STICKY HEADER =================

// Header có đang sticky hay không
const isSticky = ref(false)


// Xử lý scroll
const handleScroll = () => {
    isSticky.value = window.scrollY > 0
}


// ================= MOUNT =================

onMounted(() => {
    window.addEventListener(
        'scroll',
        handleScroll
    )
})


// ================= UNMOUNT =================

onBeforeUnmount(() => {
    window.removeEventListener(
        'scroll',
        handleScroll
    )
})
</script>


<style scoped>
/* ================= RESET ================= */

* {
    box-sizing: border-box;
}

.header-area {
    width: 100%;

    background: #fff;
}


/* ================= CONTAINER ================= */

.container {
    width: 1200px;

    max-width: calc(100% - 30px);

    margin: 0 auto;
}


/* ================= MAIN MENU ================= */

.main-menu {
    width: 100%;

    background: #fff;

    transition:
        transform 0.5s ease,
        box-shadow 0.5s ease;
}


/* Header khi scroll */

.main-menu.sticky {
    position: fixed;

    width: 100%;

    top: -70px;

    left: 0;

    transform: translateY(70px);

    box-shadow:
        0 3px 16px rgba(0, 0, 0, 0.1);

    z-index: 999;
}


/* ================= NAVBAR ================= */

.navbar {
    min-height: 80px;

    display: flex;

    align-items: center;
}


/* ================= LOGO ================= */

.logo {
    display: flex;

    align-items: center;

    text-decoration: none;

    margin-right: auto;
}

.logo img {
    width: 150px;

    max-height: 60px;

    object-fit: contain;
}


/* ================= CONTENT ================= */

.navbar-content {
    display: flex;

    align-items: center;

    justify-content: flex-end;

    flex: 1;
}


/* ================= MENU ================= */

.nav-menu {
    display: flex;

    align-items: center;

    list-style: none;

    margin: 0;
    padding: 0;
}

.nav-menu li {
    margin-left: 35px;
}

.nav-link {
    display: block;

    padding: 30px 0;

    color: #222;

    text-decoration: none;

    font-size: 14px;

    font-weight: 500;

    transition: color 0.2s;
}

.nav-link:hover,
.nav-link.selected,
.router-link-active {
    color: #71cd14;
}


/* ================= RIGHT ICONS ================= */

.right-nav {
    display: flex;

    align-items: center;

    list-style: none;

    margin: 0 0 0 35px;

    padding: 0;
}

.icon-item {
    position: relative;

    margin-left: 20px;
}

.icon-link {
    width: 35px;
    height: 35px;

    display: flex;

    align-items: center;
    justify-content: center;

    color: #222;

    text-decoration: none;

    font-size: 18px;

    transition: color 0.2s;
}

.icon-link:hover {
    color: #71cd14;
}


/* ================= CART QUANTITY ================= */

.cart-quantity {
    position: absolute;

    top: -2px;

    right: -2px;

    width: 15px;
    height: 15px;

    background: #ee4266;

    color: white;

    border-radius: 50%;

    display: flex;

    align-items: center;
    justify-content: center;

    font-size: 10px;
}


/* ================= MESSAGE QUANTITY ================= */

.message-quantity {
    position: absolute;

    top: -2px;

    right: -5px;

    min-width: 20px;
    height: 15px;

    padding: 0 4px;

    background: #ee4266;

    color: white;

    border-radius: 50px;

    display: flex;

    align-items: center;
    justify-content: center;

    font-size: 10px;
}


/* ================= MOBILE BUTTON ================= */

.mobile-button {
    display: none;

    width: 40px;
    height: 35px;

    border: 1px solid #ddd;

    background: white;

    cursor: pointer;

    padding: 7px;
}

.mobile-button span {
    display: block;

    width: 100%;
    height: 2px;

    margin: 4px 0;

    background: #333;
}


/* ================= RESPONSIVE ================= */

@media (max-width: 991px) {

    .mobile-button {
        display: block;

        margin-left: auto;
    }

    .navbar-content {
        display: none;

        position: absolute;

        top: 120px;

        left: 0;

        width: 100%;

        background: white;

        padding: 15px;

        box-shadow:
            0 3px 10px rgba(0, 0, 0, 0.1);
    }

    .navbar-content.open {
        display: block;
    }

    .nav-menu {
        flex-direction: column;

        align-items: flex-start;
    }

    .nav-menu li {
        margin: 0;

        width: 100%;
    }

    .nav-link {
        padding: 12px;
    }

    .right-nav {
        margin: 10px 0 0;

        justify-content: flex-start;
    }
}


@media (max-width: 600px) {

    .top-left {
        display: none;
    }

    .top-right {
        margin-left: auto;
    }

    .top-right ul {
        gap: 10px;

        font-size: 11px;
    }

    .logo img {
        width: 120px;
    }

}
</style>