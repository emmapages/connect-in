<script setup>
import { useUserStore } from '@/stores/user'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import axios from '@/plugins/axios'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const handleLogout = async () => {
  try {
    await axios.post('/logout')
  } catch (error) {
    console.error("Erreur lors de la déconnexion locale/serveur", error)
  } finally {
    userStore.logout()
    router.push('/login')
  }
}

const linkClasses = (path) => {
  const isActive = route.path === path
  return [
    'flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium group',
    isActive 
      ? 'bg-emerald-50 text-emerald-600 font-bold shadow-sm shadow-emerald-100/50' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
  ]
}
</script>

<template>
  <aside class="w-64 bg-white border-r border-slate-200 flex flex-col p-6 h-screen sticky top-0 z-50">
    
    <div class="flex items-center gap-3 mb-10 px-2">
      <div class="bg-emerald-600 p-2 rounded-lg text-white shadow-lg shadow-emerald-100">
        <i class="fa-solid fa-users-viewfinder"></i>
      </div>
      <h1 class="font-black text-xl tracking-tighter text-slate-900 uppercase">Connect'In</h1>
    </div>

    <nav class="flex-1 space-y-2">
      <RouterLink to="/" :class="linkClasses('/')">
        <i class="fa-solid fa-house w-5 text-lg"></i>
        <span>Fil d'actualité</span>
      </RouterLink>

      <RouterLink to="/collaborateurs" :class="linkClasses('/collaborateurs')">
        <i class="fa-solid fa-user-group w-5 text-lg"></i>
        <span>Collaborateurs</span>
        <span
          v-if="userStore.notifications.friendRequests.length > 0"
          class="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse"
        >
          {{ userStore.notifications.friendRequests.length }}
        </span>
      </RouterLink>

      <RouterLink to="/messages" :class="linkClasses('/messages')">
        <i class="fa-solid fa-comment-dots w-5 text-lg"></i>
        <span>Messages</span>
        <span 
          v-if="userStore.notifications.messages.length > 0"
          class="ml-auto bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black"
        >
          {{ userStore.notifications.messages.length }}
        </span>
      </RouterLink>

      <RouterLink v-if="userStore.isAuthenticated" to="/profil" :class="linkClasses('/profil')">
        <i class="fa-solid fa-circle-user w-5 text-lg"></i>
        <span>Mon Profil</span>
      </RouterLink>
    </nav>

    <div v-if="userStore.isAuthenticated" class="pt-6 border-t border-slate-100">
      <div class="flex items-center gap-3 mb-4 px-2">
        <div class="relative">
          <img 
            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(userStore.user?.name || 'User')}&background=random`" 
            class="h-10 w-10 rounded-lg shadow-sm border border-slate-100"
          >
          <div class="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-bold text-slate-700 truncate">{{ userStore.user?.name }}</span>
          <span class="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Session active</span>
        </div>
      </div>
      
      <button 
        @click="handleLogout" 
        class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest group"
      >
        <i class="fa-solid fa-power-off group-hover:rotate-90 transition-transform duration-300"></i> 
        <span>Déconnexion</span>
      </button>
    </div>
  </aside>
</template>