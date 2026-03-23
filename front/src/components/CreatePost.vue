<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import axios from '@/plugins/axios'

const userStore = useUserStore()
const content = ref('')
const isSubmitting = ref(false)
const selectedImage = ref(null)
const imagePreview = ref(null)
const emit = defineEmits(['created'])

const onImageSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return
  selectedImage.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const removeImage = () => {
  selectedImage.value = null
  imagePreview.value = null
}

const submitPost = async () => {
  if (content.value.trim().length === 0 || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('body', content.value)
    if (selectedImage.value) {
      formData.append('image', selectedImage.value)
    }
    const response = await axios.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    emit('created', response.data)
    content.value = ''
    removeImage()
    if (userStore.addSuccessAlert) {
      userStore.addSuccessAlert("Votre message a été publié")
    }
  } catch (error) {
    console.error("Erreur lors de la création du post:", error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8 transition-all focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-100">
    <div class="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
      <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <i class="fa-solid fa-plus text-emerald-500"></i>
        Nouvelle discussion
      </span>
      <span class="text-[10px] text-slate-300 font-medium italic">Formatage auto activé</span>
    </div>
    <div class="p-5">
      <div class="flex gap-4">
        <img 
          :src="userStore.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userStore.user?.name || 'Moi')}&background=random`" 
          class="h-10 w-10 rounded-lg shadow-sm object-cover"
          alt="Mon avatar"
        >
        <div class="flex-1">
          <textarea 
            v-model="content"
            @keyup.ctrl.enter="submitPost"
            :disabled="isSubmitting"
            placeholder="Échangez avec vos collaborateurs..."
            class="w-full border-none focus:ring-0 text-slate-700 placeholder:text-slate-300 resize-none min-h-[80px] text-base outline-none bg-transparent disabled:opacity-50"
          ></textarea>

          <!-- Preview image -->
          <div v-if="imagePreview" class="mt-3 relative inline-block">
            <img :src="imagePreview" class="max-h-40 rounded-lg border border-slate-200 object-cover">
            <button @click="removeImage" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="flex justify-between items-center pt-3 mt-2">
            <div class="flex gap-1">
              <label class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition cursor-pointer" title="Ajouter une image">
                <i class="fa-regular fa-image text-base"></i>
                <input type="file" accept="image/*" class="hidden" @change="onImageSelected">
              </label>
              <button class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition" title="Joindre un fichier">
                <i class="fa-solid fa-paperclip text-base"></i>
              </button>
            </div>
            <button 
              @click="submitPost"
              :disabled="!content.trim() || isSubmitting"
              class="bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-tight hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2 shadow-sm shadow-emerald-100"
            >
              <i v-if="isSubmitting" class="fa-solid fa-circle-notch animate-spin text-[10px]"></i>
              <i v-else class="fa-solid fa-paper-plane text-[10px]"></i>
              {{ isSubmitting ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>