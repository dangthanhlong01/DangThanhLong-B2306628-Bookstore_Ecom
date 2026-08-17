<template>
  <footer class="footer-area">
    <div class="container">
      <div class="row">

        <!-- Top Products -->
        <div class="col-lg-3 col-md-6 single-footer-widget">
          <h4>Top Products</h4>

          <ul>
            <li>
              <a href="#">Managed Website</a>
            </li>

            <li>
              <a href="#">Manage Reputation</a>
            </li>

            <li>
              <a href="#">Power Tools</a>
            </li>

            <li>
              <a href="#">Marketing Service</a>
            </li>
          </ul>
        </div>

        <!-- Quick Links -->
        <div class="col-lg-3 col-md-6 single-footer-widget">
          <h4>Quick Links</h4>

          <ul>
            <li>
              <a href="#">Jobs</a>
            </li>

            <li>
              <a href="#">Brand Assets</a>
            </li>

            <li>
              <a href="#">Investor Relations</a>
            </li>

            <li>
              <a href="#">Terms of Service</a>
            </li>
          </ul>
        </div>

        <!-- Features -->
        <div class="col-lg-3 col-md-6 single-footer-widget">
          <h4>Features</h4>

          <ul>
            <li>
              <a href="#">Jobs</a>
            </li>

            <li>
              <a href="#">Brand Assets</a>
            </li>

            <li>
              <a href="#">Investor Relations</a>
            </li>

            <li>
              <a href="#">Terms of Service</a>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div class="col-lg-3 col-md-6 single-footer-widget">
          <h4>Resources</h4>

          <ul>
            <li>
              <a href="#">Guides</a>
            </li>

            <li>
              <a href="#">Research</a>
            </li>

            <li>
              <a href="#">Experts</a>
            </li>

            <li>
              <a href="#">Agencies</a>
            </li>
          </ul>
        </div>

      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">

          <p class="footer-text">
            <i class="fa fa-heart-o" aria-hidden="true"></i>

            © 2026 Bookstore. All rights reserved.
          </p>

          <div class="footer-social">
            <a href="#" aria-label="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>

            <a href="#" aria-label="Instagram">
              <i class="fab fa-instagram"></i>
            </a>

            <a href="#" aria-label="TikTok">
              <i class="fab fa-tiktok"></i>
            </a>

            <a href="#" aria-label="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
          </div>

        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
// Footer không cần logic
</script>

<style scoped>
/* ========================================
   FOOTER
======================================== */

.footer-area {
    width: 100%;
    background: #f8f9fa;
    padding: 70px 0 0;
    border-top: 1px solid #e8e8e8;
}

.footer-area .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

/* ========================================
   FOOTER COLUMN
======================================== */

.single-footer-widget {
    margin-bottom: 40px;
}

.single-footer-widget h4 {
    position: relative;
    margin: 0 0 25px;
    padding-bottom: 12px;

    color: #222;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
}

.single-footer-widget h4::after {
    content: "";

    position: absolute;
    left: 0;
    bottom: 0;

    width: 35px;
    height: 2px;

    background: #007bff;
}

/* ========================================
   FOOTER LIST
======================================== */

.single-footer-widget ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.single-footer-widget ul li {
    margin-bottom: 12px;
}

.single-footer-widget ul li:last-child {
    margin-bottom: 0;
}

.single-footer-widget ul li a {
    display: inline-block;

    color: #777;
    font-size: 14px;
    line-height: 1.6;

    text-decoration: none;

    transition:
        color 0.3s ease,
        padding-left 0.3s ease;
}

.single-footer-widget ul li a:hover {
    color: #007bff;
    padding-left: 5px;
}

/* ========================================
   FOOTER BOTTOM
======================================== */

.footer-bottom {
    margin-top: 20px;
    padding: 25px 0;

    border-top: 1px solid #e5e5e5;
}

.footer-bottom-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

/* ========================================
   COPYRIGHT
======================================== */

.footer-text {
    margin: 0;

    color: #777;
    font-size: 14px;
    line-height: 1.6;
}

.footer-text i {
    margin-right: 5px;
    color: #007bff;
}

/* ========================================
   SOCIAL
======================================== */

.footer-social {
    display: flex;
    align-items: center;
    gap: 10px;
}

.footer-social a {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    border: 1px solid #ddd;
    border-radius: 50%;

    color: #666;
    background: #fff;

    text-decoration: none;

    transition:
        all 0.3s ease;
}

.footer-social a:hover {
    color: #fff;
    background: #007bff;
    border-color: #007bff;
    transform: translateY(-3px);
}

/* ========================================
   RESPONSIVE - TABLET
======================================== */

@media (max-width: 991px) {
    .footer-area {
        padding-top: 50px;
    }

    .single-footer-widget {
        margin-bottom: 35px;
    }

    .single-footer-widget h4 {
        font-size: 17px;
    }
}

/* ========================================
   RESPONSIVE - MOBILE
======================================== */

@media (max-width: 767px) {
    .footer-area {
        padding: 45px 15px 0;
    }

    .single-footer-widget {
        margin-bottom: 30px;
    }

    .footer-bottom {
        margin-top: 10px;
        padding: 20px 0;
    }

    .footer-bottom-content {
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }

    .footer-social {
        justify-content: center;
    }
}

.footer-area .row {
    display: flex;
    flex-wrap: wrap;
    padding: 50px;
}

.single-footer-widget {
    flex: 0 0 25%;
    max-width: 25%;
    margin-bottom: 40px;
}

@media (max-width: 991px) {
    .single-footer-widget {
        flex: 0 0 50%;
        max-width: 50%;
    }
}

@media (max-width: 576px) {
    .single-footer-widget {
        flex: 0 0 100%;
        max-width: 100%;
    }
}
/* ========================================
   SMALL MOBILE
======================================== */

@media (max-width: 480px) {
    .footer-area {
        padding-top: 35px;
    }

    .single-footer-widget h4 {
        font-size: 16px;
    }

    .single-footer-widget ul li a {
        font-size: 13px;
    }

    .footer-text {
        font-size: 13px;
    }

    .footer-social a {
        width: 34px;
        height: 34px;
    }
}
</style>


