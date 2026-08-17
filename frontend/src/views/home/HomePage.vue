<script setup>
import { ref, onMounted } from 'vue'
import HomeBanner from '../../components/HomeFeature/HomeBanner.vue'
import MainFeature from '../../components/HomeFeature/MainFeature.vue'
import ProductFeature from '../../components/HomeFeature/ProductFeature.vue'
import NewProductFeature from '../../components/HomeFeature/NewProductFeature.vue'
import HomeBlog from '../../components/HomeFeature/HomeBlog.vue'
import userService from '../../services/user.service'

// Swiper (thay thế react-slick)
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

const dataProductFeature = ref([])
const dataNewProductFeature = ref([])
const dataBanner = ref([])
const dataProductRecommend = ref([])

// Cấu hình tương đương "settings" bên react-slick
const swiperModules = [Autoplay]
const swiperOptions = {
    slidesPerView: 1,
    speed: 500,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false
    },
    loop: true
}

const fetchDataBrand = async () => {
    const res = await userService.getAllBanner()
    if (res && res.success) {
        dataBanner.value = res.data
    }
}

const fetchProductNew = async () => {
    try {
        const res = await userService.getBooks({
            page: 1,
            limit: 8,
            sort: "-createdAt",
        });

        if (res.success) {
            const books = res.data?.books || [];

            
            dataNewProductFeature.value = books;
        }

    } catch (error) {
        console.error("Lỗi lấy sách mới:", error);
        dataNewProductFeature.value = [];
    }
};

onMounted(() => {
    fetchDataBrand()
    fetchProductNew()

    window.scrollTo(0, 0)
})
</script>

<template>
    <div>   
        <Swiper v-if="dataBanner.length > 0" :modules="swiperModules" v-bind="swiperOptions">
            <SwiperSlide v-for="(item, index) in dataBanner" :key="item.id || index">
                <HomeBanner :image="item.image" :name="item.name" :description="item.description" />
            </SwiperSlide>
        </Swiper>

        <MainFeature />
        <NewProductFeature title="Sản phẩm mới" description="Những sản phẩm vừa ra mắt mới lạ cuốn hút người xem"
            :data="dataNewProductFeature" />
    </div>
</template>