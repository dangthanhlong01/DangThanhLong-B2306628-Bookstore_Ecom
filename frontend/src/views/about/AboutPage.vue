<script setup>
// Không cần gọi API nếu nội dung giới thiệu là nội dung tĩnh.
// Sau này nếu muốn lấy nội dung từ backend thì có thể thêm service ở đây.
</script>

<template>
    <div class="about-page">

        <!-- ================= BANNER ================= -->
        <section class="about-banner">
            <div class="about-banner__overlay">
                <div class="about-banner__content">
                    <h1>Giới thiệu</h1>
                    <p>
                        Khám phá thế giới sách cùng Bookstore
                    </p>
                </div>
            </div>
        </section>


        <!-- ================= GIỚI THIỆU ================= -->
        <section class="about-intro">
            <div class="about-container">

                <div class="about-intro__image">
                    <img src="@/assets/logo.jpg"
                        alt="Bookstore" />
                </div>

                <div class="about-intro__content">

                    <span class="section-label">
                        VỀ CHÚNG TÔI
                    </span>

                    <h2>
                        Chào mừng bạn đến với Bookstore
                    </h2>

                    <p>
                        Bookstore là cửa hàng sách trực tuyến mang đến cho
                        bạn những cuốn sách chất lượng và đa dạng thuộc nhiều
                        thể loại khác nhau.
                    </p>

                    <p>
                        Chúng tôi mong muốn xây dựng một không gian mua sắm
                        sách tiện lợi, nơi mọi người có thể dễ dàng tìm kiếm,
                        lựa chọn và sở hữu những cuốn sách phù hợp với nhu cầu
                        của mình.
                    </p>

                    <p>
                        Với giao diện thân thiện, sản phẩm đa dạng và dịch vụ
                        hỗ trợ tận tình, Bookstore luôn cố gắng mang đến trải
                        nghiệm tốt nhất cho khách hàng.
                    </p>

                </div>

            </div>
        </section>


        <!-- ================= GIÁ TRỊ ================= -->
        <section class="about-values">

            <div class="about-container">

                <div class="section-heading">
                    <span class="section-label">
                        GIÁ TRỊ CỦA CHÚNG TÔI
                    </span>

                    <h2>
                        Điều Bookstore hướng đến
                    </h2>

                    <p>
                        Chúng tôi luôn đặt trải nghiệm của khách hàng
                        làm ưu tiên hàng đầu.
                    </p>
                </div>


                <div class="values-grid">

                    <!-- Giá trị 1 -->
                    <div class="value-card">

                        <div class="value-icon">
                            📚
                        </div>

                        <h3>
                            Sách đa dạng
                        </h3>

                        <p>
                            Cung cấp nhiều thể loại sách khác nhau,
                            đáp ứng nhu cầu đọc và học tập của khách hàng.
                        </p>

                    </div>


                    <!-- Giá trị 2 -->
                    <div class="value-card">

                        <div class="value-icon">
                            ❤️
                        </div>

                        <h3>
                            Khách hàng là ưu tiên
                        </h3>

                        <p>
                            Luôn lắng nghe ý kiến và mong muốn của khách hàng
                            để cải thiện chất lượng dịch vụ.
                        </p>

                    </div>


                    <!-- Giá trị 3 -->
                    <div class="value-card">

                        <div class="value-icon">
                            🚚
                        </div>

                        <h3>
                            Giao hàng thuận tiện
                        </h3>

                        <p>
                            Hướng đến quy trình mua hàng và giao hàng
                            nhanh chóng, thuận tiện.
                        </p>

                    </div>


                    <!-- Giá trị 4 -->
                    <div class="value-card">

                        <div class="value-icon">
                            🛡️
                        </div>

                        <h3>
                            Thanh toán an toàn
                        </h3>

                        <p>
                            Bảo đảm thông tin và quá trình thanh toán
                            của khách hàng được an toàn.
                        </p>

                    </div>

                </div>

            </div>

        </section>


        <!-- ================= MỤC TIÊU ================= -->
        <section class="about-mission">

            <div class="about-container">

                <div class="mission-content">

                    <span class="section-label">
                        SỨ MỆNH
                    </span>

                    <h2>
                        Mang sách đến gần hơn với mọi người
                    </h2>

                    <p>
                        Bookstore hướng đến việc xây dựng một nền tảng
                        mua sách trực tuyến đơn giản và thuận tiện.
                    </p>

                    <p>
                        Chúng tôi mong muốn mỗi khách hàng đều có thể dễ dàng
                        tìm thấy những cuốn sách yêu thích và khám phá thêm
                        nhiều kiến thức mới thông qua việc đọc sách.
                    </p>

                    <div class="mission-list">

                        <div class="mission-item">
                            <span class="check">✓</span>
                            <span>Không ngừng cải thiện trải nghiệm mua sắm</span>
                        </div>

                        <div class="mission-item">
                            <span class="check">✓</span>
                            <span>Cung cấp sản phẩm chất lượng</span>
                        </div>

                        <div class="mission-item">
                            <span class="check">✓</span>
                            <span>Hỗ trợ khách hàng tận tình</span>
                        </div>

                        <div class="mission-item">
                            <span class="check">✓</span>
                            <span>Xây dựng cộng đồng yêu sách</span>
                        </div>

                    </div>

                </div>


                <div class="mission-image">

                    <div class="mission-image__box">
                        <div class="big-book-icon">
                            📖
                        </div>

                        <h3>
                            Bookstore
                        </h3>

                        <p>
                            Mở ra một thế giới tri thức
                        </p>
                    </div>

                </div>

            </div>

        </section>


        <!-- ================= THỐNG KÊ ================= -->
        <section class="about-statistics">

            <div class="about-container">

                <div class="statistics-grid">

                    <div class="stat-item">
                        <strong>1000+</strong>
                        <span>Sách đang bán</span>
                    </div>

                    <div class="stat-item">
                        <strong>500+</strong>
                        <span>Khách hàng</span>
                    </div>

                    <div class="stat-item">
                        <strong>20+</strong>
                        <span>Thể loại sách</span>
                    </div>

                    <div class="stat-item">
                        <strong>24/7</strong>
                        <span>Hỗ trợ khách hàng</span>
                    </div>

                </div>

            </div>

        </section>


        <!-- ================= CTA ================= -->
        <section class="about-cta">

            <div class="about-cta__content">

                <h2>
                    Bắt đầu hành trình khám phá tri thức
                </h2>

                <p>
                    Tìm kiếm những cuốn sách phù hợp với bạn ngay hôm nay.
                </p>

                <router-link to="/shop" class="about-cta__button">
                    Khám phá cửa hàng
                </router-link>

            </div>

        </section>

    </div>
</template>


<style scoped>
/* =====================================================
   COMMON
===================================================== */

.about-page {
    width: 100%;
    background: #ffffff;
    color: #333;
}

.about-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
    box-sizing: border-box;
}

.section-label {
    display: inline-block;

    color: #65b32e;

    font-size: 13px;
    font-weight: 600;

    letter-spacing: 1px;

    margin-bottom: 10px;
}


/* =====================================================
   BANNER
===================================================== */

.about-banner {
    width: 100%;
    height: 330px;

    background:
        linear-gradient(rgba(0, 0, 0, 0.55),
            rgba(0, 0, 0, 0.55)),
        url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80");

    background-size: cover;
    background-position: center;

    display: flex;
    align-items: center;
    justify-content: center;
}

.about-banner__overlay {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    text-align: center;
}

.about-banner__content h1 {
    margin: 0 0 12px;

    color: #ffffff;

    font-size: 42px;
    font-weight: 700;
}

.about-banner__content p {
    margin: 0;

    color: #ffffff;

    font-size: 17px;
}


/* =====================================================
   GIỚI THIỆU
===================================================== */

.about-intro {
    padding: 80px 0;
}

.about-container {
    display: flex;
    gap: 60px;
}

.about-intro__image {
    flex: 1;

    min-width: 0;
}

.about-intro__image img {
    width: 100%;
    height: 400px;

    object-fit: cover;

    border-radius: 8px;

    display: block;
}

.about-intro__content {
    flex: 1;

    display: flex;
    flex-direction: column;

    justify-content: center;
}

.about-intro__content h2 {
    margin: 0 0 20px;

    font-size: 32px;
    line-height: 1.3;

    color: #222;
}

.about-intro__content p {
    margin: 0 0 14px;

    color: #666;

    font-size: 15px;
    line-height: 1.8;
}


/* =====================================================
   GIÁ TRỊ
===================================================== */

.about-values {
    padding: 80px 0;

    background: #f8f9fa;
}

.section-heading {
    display: block;

    text-align: center;

    margin-bottom: 45px;
}

.section-heading h2 {
    margin: 0 0 10px;

    color: #222;

    font-size: 30px;
}

.section-heading p {
    margin: 0;

    color: #777;

    font-size: 15px;
}

.values-grid {
    display: grid;

    grid-template-columns: repeat(4, 1fr);

    gap: 24px;
}

.value-card {
    padding: 30px 22px;

    background: #ffffff;

    border: 1px solid #eeeeee;

    border-radius: 8px;

    text-align: center;

    transition: all 0.2s ease;
}

.value-card:hover {
    transform: translateY(-5px);

    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.08);
}

.value-icon {
    width: 65px;
    height: 65px;

    margin: 0 auto 18px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #f1f8eb;

    border-radius: 50%;

    font-size: 28px;
}

.value-card h3 {
    margin: 0 0 12px;

    color: #222;

    font-size: 18px;
}

.value-card p {
    margin: 0;

    color: #777;

    font-size: 14px;

    line-height: 1.7;
}


/* =====================================================
   SỨ MỆNH
===================================================== */

.about-mission {
    padding: 80px 0;
}

.about-mission .about-container {
    align-items: center;
}

.mission-content {
    flex: 1;
}

.mission-content h2 {
    margin: 0 0 20px;

    color: #222;

    font-size: 30px;
    line-height: 1.4;
}

.mission-content p {
    margin: 0 0 14px;

    color: #666;

    font-size: 15px;

    line-height: 1.8;
}

.mission-list {
    margin-top: 25px;

    display: flex;
    flex-direction: column;

    gap: 13px;
}

.mission-item {
    display: flex;
    align-items: center;

    gap: 10px;

    color: #555;

    font-size: 14px;
}

.check {
    width: 22px;
    height: 22px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background: #65b32e;

    color: #ffffff;

    font-size: 13px;
    font-weight: 600;
}

.mission-image {
    flex: 1;

    display: flex;
    justify-content: center;
}

.mission-image__box {
    width: 400px;
    height: 350px;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    background: #f1f8eb;

    border-radius: 10px;

    text-align: center;
}

.big-book-icon {
    font-size: 100px;

    margin-bottom: 15px;
}

.mission-image__box h3 {
    margin: 0 0 8px;

    color: #333;

    font-size: 28px;
}

.mission-image__box p {
    margin: 0;

    color: #777;

    font-size: 15px;
}


/* =====================================================
   THỐNG KÊ
===================================================== */

.about-statistics {
    padding: 55px 0;

    background: #65b32e;
}

.statistics-grid {
    width: 100%;

    display: grid;

    grid-template-columns: repeat(4, 1fr);

    gap: 20px;
}

.stat-item {
    text-align: center;

    color: #ffffff;
}

.stat-item strong {
    display: block;

    margin-bottom: 8px;

    font-size: 32px;
    font-weight: 700;
}

.stat-item span {
    font-size: 14px;
}


/* =====================================================
   CTA
===================================================== */

.about-cta {
    padding: 80px 20px;

    text-align: center;

    background: #ffffff;
}

.about-cta__content h2 {
    margin: 0 0 12px;

    color: #222;

    font-size: 30px;
}

.about-cta__content p {
    margin: 0 0 25px;

    color: #777;

    font-size: 15px;
}

.about-cta__button {
    display: inline-flex;

    align-items: center;
    justify-content: center;

    padding: 12px 25px;

    background: #65b32e;

    color: #ffffff;

    border-radius: 4px;

    text-decoration: none;

    font-size: 14px;
    font-weight: 500;

    transition: background 0.2s ease;
}

.about-cta__button:hover {
    background: #4f9421;
}


/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1000px) {

    .values-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .about-container {
        gap: 35px;
    }

}


@media (max-width: 700px) {

    .about-banner {
        height: 250px;
    }

    .about-banner__content h1 {
        font-size: 32px;
    }

    .about-intro,
    .about-values,
    .about-mission {
        padding: 55px 0;
    }

    .about-intro .about-container,
    .about-mission .about-container {
        flex-direction: column;
    }

    .about-intro__image img {
        height: 300px;
    }

    .mission-image__box {
        width: 100%;
        height: 280px;
    }

    .statistics-grid {
        grid-template-columns: repeat(2, 1fr);
    }

}


@media (max-width: 450px) {

    .about-container {
        padding: 0 18px;
    }

    .values-grid {
        grid-template-columns: 1fr;
    }

    .statistics-grid {
        grid-template-columns: 1fr 1fr;
    }

    .about-intro__content h2,
    .mission-content h2 {
        font-size: 26px;
    }

}
</style>