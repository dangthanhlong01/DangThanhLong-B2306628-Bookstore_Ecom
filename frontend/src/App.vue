<template>
  <div class="app">
    <Header v-if="!route.meta.hideHeader" />

    <main class="main-content">
      <router-view />
    </main>

    <Footer v-if="!route.meta.hideFooter" />
    <Chatbot />
  </div>

</template>

<script setup>
import { useRoute } from 'vue-router'

import Header from './components/Header/Header.vue'
import Footer from './components/footer/Footer.vue'
import Chatbot from './views/chatbot/ChatbotPage.vue'
const route = useRoute()
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
