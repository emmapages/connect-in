<script setup>
import { ref, reactive, onMounted } from "vue"
import { useUserStore } from "@/stores/user"
import axios from "@/plugins/axios"
import PostCard from "@/components/PostCard.vue"

const userStore = useUserStore()
const activeTab = ref('activite')
const isEditing = ref(false)
const isSaving = ref(false)
const sharedFiles = ref([])
const isLoadingFiles = ref(false)
const posts = ref([])
const isLoadingPosts = ref(false)

const avatarPreview = ref(null)
const avatarFile = ref(null)

const profileData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  location: '',
  bio: ''
})

const syncLocalData = () => {
  if (userStore.user) {
    profileData.first_name = userStore.user.first_name || ''
    profileData.last_name = userStore.user.last_name || ''
    profileData.email = userStore.user.email || ''
    profileData.location = userStore.user.location || ''
    profileData.bio = userStore.user.bio || ''
  }
}

const onAvatarSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)

  const formData = new FormData()
  formData.append('avatar', file)
  try {
    const response = await axios.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    userStore.user = { ...userStore.user, avatar: response.data.avatar }
  } catch (error) {
    console.error(error)
  }
}

const fetchUserPosts = async () => {
  isLoadingPosts.value = true
  try {
    const response = await axios.get('/posts')
    posts.value = response.data.filter(p => p.user_id === userStore.user?.id)
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingPosts.value = false
  }
}

const fetchFiles = async () => {
  isLoadingFiles.value = true
  try {
    const response = await axios.get('/user/files')
    sharedFiles.value = response.data
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingFiles.value = false
  }
}

const downloadFile = async (fileId, fileName) => {
  try {
    const response = await axios.get(`/files/download/${fileId}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
  }
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    const response = await axios.put('/profile', profileData)
    userStore.user = { ...userStore.user, ...response.data.user }
    isEditing.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'fichiers') fetchFiles()
}

const removePost = (postId) => {
  posts.value = posts.value.filter(p => p.id !== postId)
}

onMounted(() => {
  syncLocalData()
  fetchUserPosts()
})
</script>

<template>
  <div class="py-6 px-8 max-w-5xl mx-auto">
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div class="flex items-start p-8 gap-8">


        <div class="relative group">
          <img 
            :src="avatarPreview || userStore.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.first_name + ' ' + profileData.last_name)}&size=128&background=random`" 
            class="h-28 w-28 rounded-xl shadow-sm border border-slate-100 object-cover"
          >
          <label class="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition cursor-pointer flex items-center justify-center">
            <i class="fa-solid fa-camera text-white text-xl"></i>
            <input type="file" accept="image/*" class="hidden" @change="onAvatarSelected">
          </label>
          <div class="absolute -bottom-2 -right-2 h-6 w-6 bg-emerald-500 border-4 border-white rounded-full"></div>
        </div>

        <div class="flex-1">
          <div class="flex justify-between items-start">
            <div v-if="!isEditing" class="space-y-1">
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">
                {{ profileData.first_name }} {{ profileData.last_name }}
              </h1>
              <p class="text-slate-500 font-medium">{{ profileData.bio || 'Aucune bio' }}</p>
              <div class="flex items-center gap-4 mt-3 text-sm text-slate-400">
                <span class="flex items-center gap-1.5"><i class="fa-solid fa-location-dot"></i> {{ profileData.location || 'Non localisé' }}</span>
                <span class="flex items-center gap-1.5"><i class="fa-regular fa-envelope"></i> {{ profileData.email }}</span>
              </div>
            </div>

            <div v-else class="flex-1 grid grid-cols-2 gap-4 mr-6">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Prénom</label>
                <input v-model="profileData.first_name" type="text" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all">
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Nom</label>
                <input v-model="profileData.last_name" type="text" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all">
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Localisation</label>
                <input v-model="profileData.location" type="text" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all">
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
                <input v-model="profileData.email" type="email" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all">
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Bio / Poste</label>
                <input v-model="profileData.bio" type="text" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all">
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <button @click="isEditing ? saveProfile() : isEditing = true" :disabled="isSaving" class="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2" :class="isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-emerald-50'">
                <i v-if="isSaving" class="fa-solid fa-circle-notch animate-spin"></i>
                <i v-else :class="isEditing ? 'fa-solid fa-check' : 'fa-regular fa-pen-to-square'"></i>
                {{ isEditing ? (isSaving ? 'Envoi...' : 'Enregistrer') : 'Modifier' }}
              </button>
              <button v-if="isEditing" @click="isEditing = false" class="text-xs font-bold text-slate-400 hover:text-red-500 transition">Annuler</button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-1 border-t border-slate-100 bg-slate-50/50 px-4">
        <button v-for="tab in ['activite', 'fichiers', 'organisation']" :key="tab" @click="switchTab(tab)" class="px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-all" :class="activeTab === tab ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'">
          {{ tab }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div v-if="activeTab === 'activite'">
        <div v-if="isLoadingPosts" class="flex justify-center py-6">
          <i class="fa-solid fa-circle-notch animate-spin text-emerald-600 text-xl"></i>
        </div>
        <div v-else-if="!posts.length" class="py-16 bg-white rounded-xl border border-slate-200 border-dashed text-center">
          <h3 class="text-slate-900 font-bold">Aucune activité récente</h3>
        </div>
        <div v-else class="space-y-4">
          <PostCard v-for="post in posts" :key="post.id" :post="post" @delete-post="removePost" />
        </div>
      </div>

      <div v-if="activeTab === 'fichiers'" class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="font-bold text-slate-800 mb-4">Documents partagés</h3>
        <div v-if="isLoadingFiles" class="flex justify-center py-6">
          <i class="fa-solid fa-circle-notch animate-spin text-emerald-600 text-xl"></i>
        </div>
        <div v-else class="space-y-3">
          <div v-for="file in sharedFiles" :key="file.id" @click="downloadFile(file.id, file.name)" class="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-emerald-50 transition cursor-pointer group">
            <div class="flex items-center gap-4">
              <i class="fa-solid fa-file-pdf text-emerald-500 text-xl"></i>
              <div>
                <p class="text-sm font-bold text-slate-700">{{ file.name }}</p>
                <p class="text-xs text-slate-400">{{ file.size }}</p>
              </div>
            </div>
            <i class="fa-solid fa-download text-slate-300 group-hover:text-emerald-500"></i>
          </div>
          <div v-if="!sharedFiles.length" class="text-center py-4 text-slate-400 text-sm">Aucun fichier trouvé</div>
        </div>
      </div>
    </div>
  </div>
</template>