<script setup>
defineProps({
    data: {
        type: Array,
        default: () => []
    }
})
</script>

<template>
    <section class="home-blog">
        <h2 class="home-blog__title">Bài viết mới</h2>

        <div v-if="data && data.length > 0" class="home-blog__list">
            <!-- TODO: thay bằng BlogCard.vue khi bạn có component thẻ blog -->
            <div v-for="(item, index) in data" :key="item.id || index" class="home-blog__item">
                {{ item.title }}
            </div>
        </div>

        <p v-else class="home-blog__empty">Chưa có bài viết</p>
    </section>
</template>

<style scoped>
.home-blog {
    padding: 24px 0;
}

.home-blog__list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}
</style>