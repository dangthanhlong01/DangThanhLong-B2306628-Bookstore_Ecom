<template>
    <section class="feature-area">
        <div class="container">
            <div class="feature-row">

                <!-- Mua nhiều giảm nhiều -->
                <div class="feature-col">
                    <div class="single-feature">
                        <div class="title">
                            <i class="flaticon-money"></i>
                            <h3>Mua nhiều giảm nhiều</h3>
                        </div>

                        <p>Giảm giá lên tận 50%</p>
                    </div>
                </div>

                <!-- Miễn phí vận chuyển -->
                <div class="feature-col">
                    <div class="single-feature">
                        <div class="title">
                            <i class="flaticon-truck"></i>
                            <h3>Miễn phí vận chuyển</h3>
                        </div>

                        <p>Phạm vi trong khoảng 5km</p>
                    </div>
                </div>

                <!-- Sẵn sàng hỗ trợ -->
                <div class="feature-col">
                    <div class="single-feature">
                        <div class="title">
                            <i class="flaticon-support"></i>
                            <h3>Sẵn sàng hỗ trợ</h3>
                        </div>

                        <p>Chỉ cần liên hệ với chúng tôi</p>
                    </div>
                </div>

                <!-- An toàn thanh toán -->
                <div class="feature-col">
                    <div class="single-feature">
                        <div class="title">
                            <i class="flaticon-blockchain"></i>
                            <h3>An toàn thanh toán</h3>
                        </div>

                        <p>Các cổng thanh toán uy tín</p>
                    </div>
                </div>

            </div>
        </div>
    </section>
</template>

<style scoped>
/* ================================
   KHU VỰC MAIN FEATURE
================================ */

.feature-area {
    width: 100%;
    padding: 50px 0;
    background: #ffffff;
}

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    box-sizing: border-box;
}


/* ================================
   DANH SÁCH FEATURE
================================ */

.feature-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}


/* ================================
   FEATURE
================================ */

.single-feature {
    padding: 30px 20px;
    border: 1px solid #eeeeee;
    background: #ffffff;
    transition: all 0.3s ease;
}


/* Hiệu ứng khi rê chuột */

.single-feature:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}


/* ================================
   TITLE
================================ */

.title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}


/* Icon */

.title i {
    font-size: 32px;
    color: #ef3030;
    flex-shrink: 0;
}


/* Tiêu đề */

.title h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: #222222;
}


/* ================================
   DESCRIPTION
================================ */

.single-feature p {
    margin: 0;
    padding-left: 44px;

    font-size: 14px;
    color: #777777;
    line-height: 1.6;
}


/* ================================
   RESPONSIVE
================================ */

/* Tablet */

@media (max-width: 992px) {
    .feature-row {
        grid-template-columns: repeat(2, 1fr);
    }
}


/* Mobile */

@media (max-width: 576px) {
    .feature-row {
        grid-template-columns: 1fr;
    }

    .feature-area {
        padding: 30px 0;
    }

    .single-feature {
        padding: 25px 18px;
    }
}
</style>