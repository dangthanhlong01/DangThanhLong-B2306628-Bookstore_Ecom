<script setup>
// Không cần import useRouter nữa.
// Dùng router-link trực tiếp trong template để chuyển trang.
</script>

<template>
    <div class="user-homepage">

        <div class="user-container">

            <!-- ================= PAGE CONTENT ================= -->
            <main class="user-content">

                <!--
                    Nội dung các trang con sẽ hiển thị ở đây.
                    Ví dụ:
                    /user/profile -> DetailUserPage.vue
                    /user/orders -> OrderPage.vue
                -->
                <router-view />

            </main>

            <!-- ================= SIDEBAR ================= -->
            <aside class="sidebar">

                <h3>Danh mục</h3>

                <router-link to="/user/profile" class="sidebar-item">
                    <i class="fas fa-user"></i>
                    <span>Tài khoản của tôi</span>
                </router-link>

                <router-link to="/user/address" class="sidebar-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Địa chỉ giao hàng</span>
                </router-link>
                
                <router-link to="/user/orders" class="sidebar-item">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Đơn hàng</span>
                </router-link>
                
                <router-link to="/user/vouchers" class="sidebar-item">
                    <i class="fas fa-ticket-alt"></i>
                    <span>Kho voucher</span>
                </router-link>

                

            </aside>

        </div>

    </div>
</template>

<style scoped>
.user-homepage {
    width: 100%;
}

/* ================= CONTENT ================= */

.user-container {
    display: flex;
    max-width: 1200px;
    margin: 40px auto;
    min-height: 600px;
}

/* ================= SIDEBAR ================= */

.sidebar {
    width: 220px;
    min-width: 220px;
    border-right: 1px solid #eee;
    padding: 20px;
    box-sizing: border-box;
    
}

.sidebar h3 {
    font-size: 16px;
    margin-bottom: 20px;
    color: #000000;
}

.sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;

    padding: 12px 5px;

    font-size: 14px;
    cursor: pointer;

    text-decoration: none;
    color: #333;
}

.sidebar-item:hover {
    color: #5fae32;
}

.sidebar-item i {
    width: 20px;
}

/* Mục đang được chọn */
.sidebar-item.router-link-active {
    color: #5fae32;
    font-weight: 600;
}

/* ================= PAGE CONTENT ================= */

.user-content {
    flex: 1;
    padding: 0 30px;
    min-width: 0;
}
</style>