<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from '@/plugins/axios'

const route = useRoute()
const userStore = useUserStore()

const messageContainer = ref(null)
const newMessage = ref('')
const selectedContactId = ref(null)
const allMessages = ref({})
const isLoadingMessages = ref(false)
const contacts = ref([])

const fetchContacts = async () => {
  try {
    const response = await axios.get('/conversations')
    contacts.value = response.data
    handleInitialSelection()
  } catch (error) {
    console.error(error)
  }
}

const fetchMessages = async (contactId) => {
  isLoadingMessages.value = true
  try {
    const response = await axios.get(`/messages/${contactId}`)
    allMessages.value[contactId] = response.data
    await scrollToBottom()
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingMessages.value = false
  }
}

const handleInitialSelection = () => {
  const idFromUrl = route.query.contactId
  if (idFromUrl) {
    const parsedId = Number(idFromUrl)
    if (contacts.value.some(c => c.id === parsedId)) {
      selectContact(parsedId)
      return
    }
  }
  if (contacts.value.length > 0) {
    selectContact(contacts.value[0].id)
  }
}

onMounted(() => {
  fetchContacts()
})

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

const selectContact = (id) => {
  selectedContactId.value = id
  fetchMessages(id)
}

const selectedContact = computed(() =>
  contacts.value.find(c => c.id === selectedContactId.value)
)

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedContactId.value) return
  const currentId = selectedContactId.value
  const textToSend = newMessage.value
  newMessage.value = ''

  try {
    const response = await axios.post('/messages', {
      receiver_id: currentId,
      content: textToSend
    })
    if (!allMessages.value[currentId]) allMessages.value[currentId] = []
    allMessages.value[currentId].push(response.data)
    await scrollToBottom()
  } catch (error) {
    console.error("Erreur d'envoi", error)
  }
}

const getMessageText = (m) => m.content || m.text || ''
const isMyMessage = (m) => m.sender_id === userStore.user?.id
const getMessageTime = (m) => {
  if (!m.created_at) return ''
  return new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex h-full w-full bg-white overflow-hidden">
    <div class="w-80 border-r border-slate-100 flex flex-col flex-shrink-0 bg-slate-50/20">
      <div class="p-6 border-b border-slate-100 bg-white">
        <h2 class="text-xl font-black text-slate-900">Discussions</h2>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div v-if="contacts.length === 0" class="text-center text-slate-400 text-sm py-8">
          Aucune conversation
        </div>
        <button
          v-for="c in contacts"
          :key="c.id"
          @click="selectContact(c.id)"
          class="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group relative"
          :class="selectedContactId === c.id ? 'bg-emerald-600 shadow-lg shadow-emerald-100' : 'hover:bg-white'"
        >
          <div class="relative flex-shrink-0">
            <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`" class="h-12 w-12 rounded-xl shadow-sm">
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-sm font-bold truncate block" :class="selectedContactId === c.id ? 'text-white' : 'text-slate-800'">
              {{ c.name }}
            </span>
            <span class="text-[10px] truncate block" :class="selectedContactId === c.id ? 'text-emerald-100' : 'text-slate-400'">
              {{ c.email }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col min-w-0 bg-slate-50/30">
      <div v-if="selectedContact" class="h-full flex flex-col">
        <div class="h-16 border-b border-slate-100 flex items-center px-6 justify-between flex-shrink-0 bg-white">
          <div class="flex items-center gap-3">
            <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.name)}&background=random`" class="h-10 w-10 rounded-lg">
            <div>
              <h3 class="font-bold text-slate-800 text-sm">{{ selectedContact.name }}</h3>
              <p class="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                {{ selectedContact.email }}
              </p>
            </div>
          </div>
        </div>

        <div ref="messageContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="isLoadingMessages" class="flex justify-center py-10">
            <i class="fa-solid fa-circle-notch animate-spin text-emerald-600 text-2xl"></i>
          </div>
          <template v-else-if="allMessages[selectedContactId]">
            <div
              v-for="(m, i) in allMessages[selectedContactId]"
              :key="i"
              class="flex"
              :class="isMyMessage(m) ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[70%] p-4 text-sm shadow-sm transition-all"
                :class="isMyMessage(m) ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none'"
              >
                {{ getMessageText(m) }}
                <div class="text-[9px] mt-1 text-right opacity-70">{{ getMessageTime(m) }}</div>
              </div>
            </div>
          </template>
        </div>

        <div class="p-4 border-t border-slate-100 bg-white">
          <div class="flex gap-2">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              :placeholder="`Répondre à ${selectedContact.name}...`"
              class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
            >
            <button
              @click="sendMessage"
              class="bg-emerald-600 text-white px-6 rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
            >
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-400">
        <i class="fa-regular fa-comments text-4xl mb-4 opacity-20"></i>
        <p>Sélectionnez une discussion pour commencer</p>
      </div>
    </div>
  </div>
</template>