import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import router from './router'
import App from './App.vue'
import { useAuthStore } from '@/stores/auth'
import 'ant-design-vue/dist/reset.css'
import './styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

// 初始化认证状态
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')