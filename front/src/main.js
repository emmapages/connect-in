import { createApp } from "vue"
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const userStore = useUserStore()
try {
    userStore.initialize()
} catch (e) {
console.error("Erreur d'initialisation du store:", e)
}

app.use(router)
app.mount('#app')