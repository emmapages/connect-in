<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import FriendCard from '@/components/FriendCard.vue'
import axios from '@/plugins/axios'

const userStore = useUserStore()
const isLoading = ref(true)
const searchQuery = ref('')

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/users')
    userStore.contacts = response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des collaborateurs:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  userStore.clearFriendNotifications()
  fetchUsers()
})

const filteredFriends = computed(() => {
  return userStore.contacts.filter(friend => {
    return friend.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
           friend.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})
</script>

<template>
  <div class="max-w-6xl mx-auto py-6 px-8">
    <div class="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 border-b border-slate-100 pb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <i class="fa-solid fa-address-book text-emerald-600"></i>
          Annuaire des collaborateurs
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Retrouvez vos collègues et membres de l'organisation ({{ filteredFriends.length }} actifs)
        </p>
      </div>

      <div class="relative w-full md:w-80">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Filtrer par nom ou pseudo..."
          class="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        >
      </div>
    </div>

    <div v-if="userStore.notifications.friendRequests.length > 0" class="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <p class="text-blue-700 text-sm font-bold flex items-center gap-2 mb-2">
            <i class="fa-solid fa-circle-info"></i> 
            Demandes envoyées :
        </p>
        <div class="flex flex-wrap gap-2">
            <span v-for="req in userStore.notifications.friendRequests" :key="req.id" class="bg-white px-3 py-1 rounded-full text-[10px] border border-blue-200 shadow-sm">
                {{ req.name }}
            </span>
        </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="n in 8" :key="n" class="h-40 bg-slate-100 animate-pulse rounded-xl border border-slate-200"></div>
    </div>

    <div v-else-if="filteredFriends.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <FriendCard 
        v-for="friend in filteredFriends" 
        :key="friend.id" 
        :friend="friend" 
      />
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
      <div class="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
        <i class="fa-solid fa-user-magnifying-glass text-2xl"></i>
      </div>
      <h3 class="text-slate-900 font-bold text-lg">Aucun résultat</h3>
      <p class="text-slate-500 text-sm mt-1">Nous n'avons trouvé personne pour "{{ searchQuery }}"</p>
      <button @click="searchQuery = ''" class="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold hover:bg-emerald-100 transition">
        Réinitialiser les filtres
      </button>
    </div>
  </div>
</template>