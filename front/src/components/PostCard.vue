<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import axios from '@/plugins/axios'

const props = defineProps({
  post: { type: Object, required: true }
})

const emit = defineEmits(['delete-post'])
const userStore = useUserStore()

const isConfirmingDelete = ref(false)
const isDeleting = ref(false)


const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `http://localhost:8000${path}`
}

const formattedContent = computed(() => {
  let text = props.post.body
  const urlRegex = /(https?:\/\/[^\s]+)/g
  text = text.replace(urlRegex, '<a href="$1" target="_blank" class="text-emerald-600 hover:underline font-medium">$1</a>')
  const mentionRegex = /(@[a-zA-Z0-9àâäéèêëïîôöùûüç._-]+)/g
  text = text.replace(mentionRegex, '<span class="text-blue-500 font-bold cursor-pointer hover:bg-blue-50 px-1 rounded transition">$1</span>')
  const hashtagRegex = /(#[a-zA-Z0-9àâäéèêëïîôöùûüç_-]+)/g
  text = text.replace(hashtagRegex, '<span class="text-emerald-500 font-semibold cursor-pointer hover:text-emerald-700">$1</span>')
  return text
})

const canDelete = computed(() => {
  const currentUserName = userStore.user?.name
  return (
    props.post.user?.name === 'Toi' ||
    props.post.user?.name === 'Moi' ||
    props.post.user?.name === currentUserName
  )
})

const deletePost = async () => {
  if (isDeleting.value) return
  isDeleting.value = true
  try {
    await axios.delete(`/posts/${props.post.id}`)
    emit('delete-post', props.post.id)
    if (userStore.addSuccessAlert) userStore.addSuccessAlert("Publication supprimée")
  } catch (error) {
    console.error("Erreur suppression:", error)
    isConfirmingDelete.value = false
  } finally {
    isDeleting.value = false
  }
}

const newCommentText = ref('')
const isCommenting = ref(false)

const addComment = async () => {
  if (newCommentText.value.trim() === '' || isCommenting.value) return
  isCommenting.value = true
  try {
    const response = await axios.post(`/posts/${props.post.id}/comments`, {
      content: newCommentText.value
    })
    if (!props.post.comments) props.post.comments = []
    props.post.comments.push(response.data)
    props.post.comments_count++
    newCommentText.value = ''
  } catch (error) {
    console.error("Erreur commentaire:", error)
  } finally {
    isCommenting.value = false
  }
}

const isLiked = ref(false)
const localLikes = ref(props.post.likes_count)

const toggleLike = async () => {
  isLiked.value = !isLiked.value
  isLiked.value ? localLikes.value++ : localLikes.value--
  try {
    await axios.post(`/posts/${props.post.id}/like`)
  } catch (error) {
    isLiked.value = !isLiked.value
    isLiked.value ? localLikes.value++ : localLikes.value--
    console.error("Erreur like:", error)
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all relative group overflow-hidden">

    <div v-if="canDelete" class="absolute top-3 right-3 z-10 flex items-center gap-2">
      <div v-if="isConfirmingDelete" class="flex items-center gap-1 bg-red-50 border border-red-100 py-1 px-2 rounded-lg shadow-sm animate-in fade-in slide-in-from-right-2">
        <span class="text-[9px] font-black text-red-600 uppercase">{{ isDeleting ? '...' : 'Supprimer ?' }}</span>
        <button v-if="!isDeleting" @click="deletePost" class="text-[9px] font-black text-red-700 hover:underline px-1">OUI</button>
        <button v-if="!isDeleting" @click="isConfirmingDelete = false" class="text-[9px] font-black text-slate-400 hover:text-slate-600 px-1">NON</button>
      </div>
      <button
        v-else
        @click="isConfirmingDelete = true"
        class="text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-1"
        title="Supprimer la discussion"
      >
        <i class="fa-solid fa-trash-can text-xs"></i>
      </button>
    </div>

    <div class="p-5">
      <div class="flex items-start gap-3 mb-3">
        <img
          :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name)}&background=random`"
          class="h-10 w-10 rounded-lg shadow-sm"
        >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-slate-900 text-sm truncate">{{ post.user?.name }}</h3>
            <span class="text-[10px] font-bold text-slate-400 uppercase">{{ post.created_at }}</span>
          </div>

          <p
            class="text-slate-600 text-sm mt-1 leading-relaxed whitespace-pre-wrap"
            v-html="formattedContent"
          ></p>

          <div v-if="post.image" class="mt-3 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
            <img
              :src="getImageUrl(post.image)"
              class="w-full h-auto max-h-[400px] object-cover transition-transform duration-500 hover:scale-[1.02]"
              alt="Image du post"
            >
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 mt-4 ml-13">
        <button
          @click="toggleLike"
          :class="[isLiked ? 'text-emerald-600' : 'text-slate-400']"
          class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tighter hover:text-emerald-600 transition"
        >
          <i class="text-sm" :class="[isLiked ? 'fa-solid fa-thumbs-up' : 'fa-regular fa-thumbs-up']"></i>
          <span>{{ localLikes }} Utile</span>
        </button>

        <div class="flex items-center gap-1.5 text-slate-400 text-[11px] font-black uppercase tracking-tighter">
          <i class="fa-regular fa-comment text-sm"></i>
          <span>{{ post.comments_count }} Réponses</span>
        </div>
      </div>
    </div>

    <div class="bg-slate-50/50 border-t border-slate-100 p-4">
      <div v-if="post.comments && post.comments.length > 0" class="space-y-3 mb-4">
        <div v-for="comment in post.comments" :key="comment.id" class="flex gap-3 group/comment">
          <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=random`" class="h-6 w-6 rounded-md">
          <div class="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <p class="text-[11px] font-black text-slate-800">{{ comment.author }}</p>
            <p class="text-xs text-slate-600 leading-snug">{{ comment.content }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(userStore.user?.name || 'Moi')}&background=random`" class="h-6 w-6 rounded-md shadow-sm">
        <div class="relative flex-1">
          <input
            v-model="newCommentText"
            @keyup.enter="addComment"
            :disabled="isCommenting"
            type="text"
            placeholder="Répondre..."
            class="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
          >
          <button
            @click="addComment"
            :disabled="!newCommentText.trim() || isCommenting"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 disabled:text-slate-300 transition-colors"
          >
            <i v-if="isCommenting" class="fa-solid fa-circle-notch animate-spin text-[10px]"></i>
            <i v-else class="fa-solid fa-paper-plane text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ml-13 { margin-left: 3.25rem; }
</style>