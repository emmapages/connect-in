<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'

const userStore = useUserStore()
const router = useRouter()

const activeTab = ref('login')
const isProcessing = ref(false)
const errorMessage = ref('')

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ first_name: '', last_name: '', password: '', password_confirmation: '' })

const handleAuth = async () => {
  isProcessing.value = true
  errorMessage.value = ''
  
  const isLogin = activeTab.value === 'login'
  const endpoint = isLogin ? '/login' : '/register'
  const payload = isLogin ? loginForm.value : registerForm.value

  try {
    const response = await axios.post(endpoint, payload)
    userStore.login(response.data.user, response.data.token)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Une erreur est survenue."
    console.error("Auth Error:", error)
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
    <div class="w-full max-w-sm">
      
      <div class="mb-10 text-center">
        <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Connect<span class="text-emerald-500">'</span>In
        </h1>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Espace Collaborateurs
        </p>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-[11px] font-bold animate-shake flex items-center rounded-r-lg">
        <i class="fa-solid fa-triangle-exclamation mr-3 text-sm"></i>
        {{ errorMessage }}
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        <div class="flex border-b border-slate-100 bg-slate-50/50">
          <button 
            @click="activeTab = 'login'"
            type="button"
            :class="activeTab === 'login' ? 'bg-white text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'"
            class="flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all">
            Connexion
          </button>
          <button 
            @click="activeTab = 'register'"
            type="button"
            :class="activeTab === 'register' ? 'bg-white text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'"
            class="flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all">
            Inscription
          </button>
        </div>

        <form @submit.prevent="handleAuth" class="p-8 space-y-6">
          
        <div v-if="activeTab === 'register'" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Prénom</label>
              <input v-model="registerForm.first_name" type="text" 
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                placeholder="Dylan" required>
            </div>
            
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nom</label>
              <input v-model="registerForm.last_name" type="text" 
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                placeholder="Abahoui" required>
            </div>
          </div>
        </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Pro</label>
            <input v-if="activeTab === 'login'" v-model="loginForm.email" type="email" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
              placeholder="nom@esn.fr" required>
            <input v-else v-model="registerForm.email" type="email" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
              placeholder="nom@esn.fr" required>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mot de passe</label>
            <input v-if="activeTab === 'login'" v-model="loginForm.password" type="password" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
              placeholder="••••••••" required>
            <input v-else v-model="registerForm.password" type="password" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
              placeholder="••••••••" required>
          </div>

          <div v-if="activeTab === 'register'" class="space-y-2">
            <label class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Confirmation</label>
            <input v-model="registerForm.password_confirmation" type="password" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
              placeholder="••••••••" required>
          </div>

          <button type="submit" :disabled="isProcessing" 
            class="w-full py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center">
            <span v-if="!isProcessing">{{ activeTab === 'login' ? 'Connexion' : 'Valider l\'inscription' }}</span>
            <i v-else class="fa-solid fa-circle-notch animate-spin text-lg"></i>
          </button>
        </form>
      </div>

      <p class="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        &copy; 2026 Connect'In Corporation
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
</style>