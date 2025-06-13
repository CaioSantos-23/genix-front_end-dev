import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/global.css' // Import global CSS
import router from './router'


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')