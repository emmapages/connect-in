<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from '@/plugins/axios'

const props = defineProps(['friend'])
const router = useRouter()
const userStore = useUserStore()

const isSending = ref(false)

const openChat = (id) => {
  router.push({
    path: '/messages',
    query: { contactId: id }
  })
}

const handleAddFriend = async () => {
  if (isSending.value) return
  
  isSending.value = true
  try {
    await axios.post(`/friends/request/${props.friend.id}`)
    
    userStore.addFriendRequests({
      id: props.friend.id,
      name: props.friend.name,
      role: props.friend.role
    })
    
    userStore.addSuccessAlert(`Demande envoyée à ${props.friend.name}`)
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande:", error)
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
    
    <div class="flex items-center gap-4 min-w-0">
      <div class="relative flex-shrink-0">
        <img 
          :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random`" 
          class="h-12 w-12 rounded-xl object-cover border border-slate-100"
          :alt="friend.name"
        >
        <div 
          v-if="friend.status === 'online'" 
          class="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"
        ></div>
      </div>
      
      <div class="min-w-0">
        <h3 class="font-bold text-slate-900 truncate text-base leading-tight">
          {{ friend.name }}
        </h3>
        <p class="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">
          {{ friend.role || 'Collaborateur' }}
        </p>
      </div>
    </div>

    <div class="flex gap-2 flex-shrink-0">
      <button 
        v-if="!userStore.notifications.friendRequests.some(r => r.id === friend.id)"
        @click="handleAddFriend"
        :disabled="isSending"
        class="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100 disabled:opacity-50"
      >
        <i v-if="isSending" class="fa-solid fa-circle-notch animate-spin"></i>
        <i v-else class="fa-solid fa-user-plus"></i>
      </button>

      <div 
        v-else 
        class="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100"
      >
        <i class="fa-solid fa-clock"></i>
      </div>

      <button 
        @click="openChat(friend.id)"
        class="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all group-hover:text-emerald-600"
      >
        <i class="fa-solid fa-comment-dots"></i>
      </button>
    </div>

  </div>
</template>