<template>
  <div>
    <Header v-if="!route.meta.hideHeader" />
    <router-view />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Header from './components/Header/Header.vue'

const route = useRoute()
</script>