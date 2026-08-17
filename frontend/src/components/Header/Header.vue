<template>
    <header class="header-area">

        <!-- =====================================================
             TOP MENU
        ====================================================== -->
        <TopMenu />

        <!-- =====================================================
             MAIN HEADER
        ====================================================== -->
        <div class="main-menu" :class="{ sticky: isSticky }">

            <div class="container">

                <nav class="navbar">

                    <!-- =====================================================
                         LOGO
                    ====================================================== -->
                    <router-link to="/home" class="logo">
                        <img :src="logo" alt="Logo" />
                    </router-link>


                    <!-- =====================================================
                         MOBILE BUTTON
                    ====================================================== -->
                    <button type="button" class="mobile-button" @click="mobileMenuOpen = !mobileMenuOpen">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>


                    <!-- =====================================================
                         NAVBAR CONTENT
                    ====================================================== -->
                    <div class="navbar-content" :class="{ open: mobileMenuOpen }">

                        <!-- =====================================================
                             MENU
                        ====================================================== -->
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


                        <!-- =====================================================
                             RIGHT NAV
                        ====================================================== -->
                        <ul class="right-nav">

                            <!-- =================================================
                                 MESSENGER
                            ================================================== -->
                            <li class="icon-item">

                                <router-link to="/user/messenger" class="icon-link" title="Tin nhắn">
                                    <i class="fa-brands fa-facebook-messenger"></i>
                                </router-link>

                                <span v-if="quantityMessage > 0" class="message-quantity">
                                    {{ quantityMessage }}
                                </span>

                            </li>


                            <!-- =================================================
                                 CART
                            ================================================== -->
                            <li class="icon-item">

                                <router-link to="/shopcart" class="icon-link" title="Giỏ hàng">
                                    🛒
                                </router-link>

                                <span v-if="cartQuantity > 0" class="cart-quantity">
                                    {{ cartQuantity }}
                                </span>

                            </li>


                            <!-- =================================================
                                 USER
                            ================================================== -->
                            <li class="icon-item">

                                <router-link :to="isLoggedIn ? '/user/profile' : '/login'" class="icon-link"
                                    title="Tài khoản" @click="handleUserClick">
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

import logo from "@/assets/logo.jpg";

import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
} from "vue";

import TopMenu from "./TopMenu.vue";

import userService from "@/services/user.service.js";


// =====================================================
// USER / AUTH
// =====================================================

const user = ref(null);


// =====================================================
// ĐỌC USER TỪ LOCAL STORAGE
// =====================================================

const loadCurrentUser = () => {

    try {

        const userData =
            localStorage.getItem("userData");

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        console.log(
            "========== HEADER AUTH =========="
        );

        console.log(
            "USER DATA:",
            userData
        );

        console.log(
            "TOKEN:",
            !!token
        );


        // -----------------------------------------------
        // Chưa đăng nhập
        // -----------------------------------------------

        if (!userData || !token) {

            console.log(
                "HEADER: CHƯA ĐĂNG NHẬP"
            );

            user.value = null;

            return;
        }


        // -----------------------------------------------
        // Parse user
        // -----------------------------------------------

        const parsedUser =
            JSON.parse(userData);


        console.log(
            "PARSED USER:",
            parsedUser
        );


        // -----------------------------------------------
        // Một số backend trả id
        // Một số backend trả _id
        // -----------------------------------------------

        const userId =
            parsedUser?.id ||
            parsedUser?._id;


        if (!userId) {

            console.warn(
                "HEADER: userData không có id hoặc _id"
            );

            user.value = null;

            return;
        }


        // -----------------------------------------------
        // Chuẩn hóa user
        // -----------------------------------------------

        user.value = {
            ...parsedUser,
            id: userId,
        };


        console.log(
            "HEADER USER:",
            user.value
        );

        console.log(
            "HEADER USER ID:",
            user.value.id
        );

        console.log(
            "HEADER USER ROLE:",
            user.value.role
        );

        console.log(
            "HEADER IS LOGGED:",
            true
        );

        console.log(
            "================================"
        );

    } catch (error) {

        console.error(
            "LỖI ĐỌC USER TỪ LOCAL STORAGE:",
            error
        );

        user.value = null;
    }
};


// =====================================================
// KIỂM TRA ĐĂNG NHẬP
// =====================================================

const isLoggedIn = computed(() => {

    return !!(
        user.value &&
        user.value.id
    );

});


// =====================================================
// CLICK ICON USER
// =====================================================

const handleUserClick = () => {
    const token = localStorage.getItem('token')

    if (token) {
        router.push('/user/profile')
    } else {
        router.push('/login')
    }
}


// =====================================================
// CART
// =====================================================

const cartQuantity = ref(0);


// =====================================================
// LẤY SỐ LƯỢNG GIỎ HÀNG
// =====================================================

const loadCartQuantity = async () => {

    // Chưa đăng nhập
    if (!user.value?.id) {

        cartQuantity.value = 0;

        return;
    }


    try {

        console.log(
            "ĐANG LẤY GIỎ HÀNG USER:",
            user.value.id
        );


        const response =
            await userService.getCartByUserId(
                user.value.id
            );


        console.log(
            "GIỎ HÀNG HEADER:",
            response
        );


        // =================================================
        // Chuẩn hóa response
        // =================================================

        const result =
            response?.data?.data ??
            response?.data ??
            [];


        // =================================================
        // Backend trả:
        // data: [...]
        // =================================================

        if (Array.isArray(result)) {

            cartQuantity.value =
                result.reduce(
                    (total, item) => {

                        return (
                            total +
                            Number(
                                item?.quantity || 0
                            )
                        );

                    },
                    0
                );

            return;
        }


        // =================================================
        // Backend trả:
        // data: {
        //     items: [...]
        // }
        // =================================================

        if (
            Array.isArray(
                result?.items
            )
        ) {

            cartQuantity.value =
                result.items.reduce(
                    (total, item) => {

                        return (
                            total +
                            Number(
                                item?.quantity || 0
                            )
                        );

                    },
                    0
                );

            return;
        }


        // Không có dữ liệu

        cartQuantity.value = 0;

    } catch (error) {

        console.error(
            "LỖI LẤY SỐ LƯỢNG GIỎ HÀNG:",
            error
        );

        cartQuantity.value = 0;
    }

};


// =====================================================
// MESSAGE
// =====================================================

const quantityMessage = ref(0);


// =====================================================
// MOBILE MENU
// =====================================================

const mobileMenuOpen = ref(false);


// =====================================================
// STICKY HEADER
// =====================================================

const isSticky = ref(false);


// =====================================================
// SCROLL
// =====================================================

const handleScroll = () => {

    isSticky.value =
        window.scrollY > 0;

};


// =====================================================
// CART UPDATED
// =====================================================

const handleCartUpdated = () => {

    console.log(
        "GIỎ HÀNG VỪA THAY ĐỔI"
    );

    loadCurrentUser();

    loadCartQuantity();

};


// =====================================================
// AUTH UPDATED
// =====================================================

const handleAuthUpdated = () => {

    console.log(
        "AUTH VỪA THAY ĐỔI -> LOAD LẠI USER"
    );

    loadCurrentUser();

    loadCartQuantity();

};


// =====================================================
// STORAGE EVENT
// =====================================================
//
// Nếu localStorage thay đổi từ tab khác
// thì Header cũng cập nhật.
//

const handleStorage = (event) => {

    if (
        event.key === "userData" ||
        event.key === "token" ||
        event.key === "accessToken"
    ) {

        console.log(
            "LOCAL STORAGE AUTH THAY ĐỔI"
        );

        loadCurrentUser();

        loadCartQuantity();
    }

};


// =====================================================
// MOUNT
// =====================================================

onMounted(() => {

    // -----------------------------------------------
    // QUAN TRỌNG:
    // Load user trước
    // -----------------------------------------------

    loadCurrentUser();


    // -----------------------------------------------
    // Load cart sau khi có user
    // -----------------------------------------------

    loadCartQuantity();


    // -----------------------------------------------
    // Sticky
    // -----------------------------------------------

    window.addEventListener(
        "scroll",
        handleScroll
    );


    // -----------------------------------------------
    // Cart
    // -----------------------------------------------

    window.addEventListener(
        "cart-updated",
        handleCartUpdated
    );


    // -----------------------------------------------
    // Auth
    // -----------------------------------------------

    window.addEventListener(
        "auth-updated",
        handleAuthUpdated
    );


    // -----------------------------------------------
    // Storage
    // -----------------------------------------------

    window.addEventListener(
        "storage",
        handleStorage
    );

});


// =====================================================
// UNMOUNT
// =====================================================

onBeforeUnmount(() => {

    window.removeEventListener(
        "scroll",
        handleScroll
    );


    window.removeEventListener(
        "cart-updated",
        handleCartUpdated
    );


    window.removeEventListener(
        "auth-updated",
        handleAuthUpdated
    );


    window.removeEventListener(
        "storage",
        handleStorage
    );

});

</script>


<style scoped>
/* =====================================================
   RESET
===================================================== */

* {
    box-sizing: border-box;
}


/* =====================================================
   HEADER
===================================================== */

.header-area {
    width: 100%;
    background: #fff;
}


/* =====================================================
   CONTAINER
===================================================== */

.container {
    width: 1200px;
    max-width: calc(100% - 30px);
    margin: 0 auto;
}


/* =====================================================
   MAIN MENU
===================================================== */

.main-menu {
    width: 100%;
    background: #fff;

    transition:
        transform 0.5s ease,
        box-shadow 0.5s ease;
}


/* =====================================================
   STICKY HEADER
===================================================== */

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


/* =====================================================
   NAVBAR
===================================================== */

.navbar {

    min-height: 80px;

    display: flex;

    align-items: center;
}


/* =====================================================
   LOGO
===================================================== */

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


/* =====================================================
   NAVBAR CONTENT
===================================================== */

.navbar-content {

    display: flex;

    align-items: center;

    justify-content: flex-end;

    flex: 1;
}


/* =====================================================
   MENU
===================================================== */

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


/* =====================================================
   RIGHT NAV
===================================================== */

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

    cursor: pointer;
}


.icon-link:hover {

    color: #71cd14;
}


/* =====================================================
   CART QUANTITY
===================================================== */

.cart-quantity {

    position: absolute;

    top: -2px;

    right: -2px;

    min-width: 17px;

    height: 17px;

    padding: 0 4px;

    background: #ee4266;

    color: white;

    border-radius: 50px;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 10px;

    font-weight: 600;
}


/* =====================================================
   MESSAGE QUANTITY
===================================================== */

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


/* =====================================================
   MOBILE BUTTON
===================================================== */

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


/* =====================================================
   RESPONSIVE
===================================================== */

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


/* =====================================================
   MOBILE
===================================================== */

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