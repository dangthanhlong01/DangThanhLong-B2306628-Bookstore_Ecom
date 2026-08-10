import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css' // hoặc './assets/main.css'
import { createPinia } from 'pinia'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')