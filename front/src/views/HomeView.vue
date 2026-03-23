<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import PostCard from '@/components/PostCard.vue'
import axios from '@/plugins/axios'

const isSubmitting = ref(false)
const userStore = useUserStore()
const newPostContent = ref('')
const textareaRef = ref(null)
const posts = ref([])
const fileInput = ref(null)
const selectedImage = ref(null)

const triggerFileInput = () => fileInput.value.click()

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (selectedImage.value) URL.revokeObjectURL(selectedImage.value)
    selectedImage.value = URL.createObjectURL(file)
  }
}

const removeSelectedImage = () => {
  if (selectedImage.value) URL.revokeObjectURL(selectedImage.value)
  selectedImage.value = null
  if (fileInput.value) fileInput.value.value = ''
}

onUnmounted(() => {
  if (selectedImage.value) URL.revokeObjectURL(selectedImage.value)
})

const insertAtCursor = (symbol) => {
  const el = textareaRef.value
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = newPostContent.value
  newPostContent.value = text.substring(0, start) + symbol + text.substring(end)
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start + 1, start + 1)
  }, 0)
}

const insertLink = () => {
  const url = prompt("URL :", "https://")
  if (url) {
    newPostContent.value += ` ${url} `
    textareaRef.value.focus()
  }
}

const fetchPosts = async () => {
  try {
    const response = await axios.get('/posts')
    posts.value = response.data
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchPosts)

const submitPost = async () => {
  if ((!newPostContent.value.trim() && !selectedImage.value) || isSubmitting.value) return
  
  isSubmitting.value = true
  const formData = new FormData()
  formData.append('body', newPostContent.value)
  
  if (fileInput.value?.files[0]) {
    formData.append('image', fileInput.value.files[0])
  }

  try {
    const response = await axios.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    posts.value.unshift(response.data)
    newPostContent.value = ''
    removeSelectedImage()
    if (userStore.addSuccessAlert) userStore.addSuccessAlert("Publié !")
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}

const removePost = (postId) => {
  posts.value = posts.value.filter(p => p.id !== postId)
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-6 px-4">
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10 transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/5">
      <div class="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest">
        <i class="fa-solid fa-pen-to-square text-emerald-600"></i>
        Exprimez-vous
      </div>
      
      <div class="p-4">
        <div class="flex gap-4">
          <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(userStore.user?.name || 'U')}&background=random`" class="h-10 w-10 rounded-lg object-cover bg-slate-100">
          <div class="flex-1">
            <textarea ref="textareaRef" v-model="newPostContent" placeholder="Partagez quelque chose..." class="w-full border-none focus:ring-0 text-base resize-none placeholder:text-slate-400 bg-transparent min-h-[80px]" rows="3"></textarea>

            <div v-if="selectedImage" class="relative mb-4">
              <img :src="selectedImage" class="rounded-xl max-h-80 w-full object-cover border border-slate-100 shadow-sm">
              <button @click="removeSelectedImage" class="absolute top-2 right-2 bg-slate-900/60 hover:bg-red-500 text-white h-8 w-8 rounded-full transition-all flex items-center justify-center backdrop-blur-sm">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div class="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
              <div class="flex gap-1">
                <input type="file" ref="fileInput" @change="onFileSelected" accept="image/*" class="hidden">
                <button @click="triggerFileInput" class="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition flex items-center justify-center" :class="{'text-emerald-600 bg-emerald-50': selectedImage}">
                  <i class="fa-regular fa-image"></i>
                </button>
                <button @click="insertLink" class="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition flex items-center justify-center">
                  <i class="fa-solid fa-link text-xs"></i>
                </button>
                <button @click="insertAtCursor('@')" class="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition flex items-center justify-center">
                  <i class="fa-solid fa-at text-xs"></i>
                </button>
                <button @click="insertAtCursor('#')" class="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition flex items-center justify-center">
                  <i class="fa-solid fa-hashtag text-xs"></i>
                </button>
              </div>
              
              <button @click="submitPost" :disabled="(!newPostContent.trim() && !selectedImage) || isSubmitting" class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 text-sm shadow-md shadow-emerald-100 active:scale-95">
                <i v-if="isSubmitting" class="fa-solid fa-circle-notch animate-spin"></i>
                <span>{{ isSubmitting ? 'Envoi...' : 'Publier' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div v-if="posts.length" class="flex items-center gap-4 mb-6 opacity-60">
        <div class="h-[1px] flex-1 bg-slate-200"></div>
        <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Récent</h2>
        <div class="h-[1px] flex-1 bg-slate-200"></div>
      </div>

      <TransitionGroup name="list">
        <PostCard v-for="item in posts" :key="item.id" :post="item" @delete-post="removePost" />
      </TransitionGroup>

      <div v-if="!posts.length && !isSubmitting" class="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-100 text-slate-400">
        <p class="text-sm font-medium">Aucune publication pour le moment.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateY(-20px); }
.list-leave-to { opacity: 0; transform: translateX(30px); }
</style>