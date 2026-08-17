<script setup>
defineProps({
    image: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    ctaText: {
        type: String,
        default: 'Đến cửa hàng ngay'
    },
    ctaLink: {
        type: String,
        default: '/shop' // TODO: đổi sang route cửa hàng thật trong router của bạn
    }
})
</script>

<template>
    <div class="hero" :style="{ backgroundImage: `url(${image})` }">
        <div class="hero__overlay"></div>
        <div class="hero__content">
            <h1 v-if="name" class="hero__title">{{ name }}</h1>
            <p v-if="description" class="hero__desc">{{ description }}</p>
            <router-link :to="ctaLink" class="hero__cta">{{ ctaText }}</router-link>
        </div>
    </div>
</template>

<style scoped>
.hero {
    position: relative;
    width: 100%;
    height: 420px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    overflow: hidden;
}

.hero__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0) 75%);
}

.hero__content {
    position: relative;
    z-index: 1;
    max-width: 480px;
    padding: 0 64px;
    color: #fff;
}

.hero__title {
    font-size: 40px;
    font-weight: 800;
    line-height: 1.2;
    margin: 0 0 12px;
}

.hero__desc {
    font-size: 15px;
    color: #e5e7eb;
    margin: 0 0 24px;
}

.hero__cta {
    display: inline-block;
    background: #6fcf3d;
    color: #0f172a;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 13px 28px;
    border-radius: 2px;
    transition: background 0.2s ease;
}

.hero__cta:hover {
    background: #5cb32e;
}

@media (max-width: 640px) {
    .hero {
        height: 320px;
    }

    .hero__content {
        padding: 0 24px;
    }

    .hero__title {
        font-size: 28px;
    }
}
</style>