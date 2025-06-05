import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './assets/router/vrindex.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化认证状态（在所有组件之前）
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.initialize()



app.mount('#app')


