<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'

const periods = ['Jour', 'Semaine', 'Mois']
const activePeriod = ref('Semaine')
const isLoading = ref(false)

const topPosts = ref([])
const topCommenters = ref([])

const fetchStats = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/stats', {
      params: { period: activePeriod.value }
    })
    
    topPosts.value = response.data.top_posts
    topCommenters.value = response.data.top_users
  } catch (error) {
    console.error("Erreur stats:", error)
  } finally {
    isLoading.value = false
  }
}

watch(activePeriod, () => {
  fetchStats()
})

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <aside class="hidden xl:flex flex-col gap-6 w-80 h-full p-6 bg-slate-50/50 border-l border-slate-200 overflow-y-auto">
    
    <div class="flex bg-slate-200/50 p-1 rounded-lg">
      <button 
        v-for="period in periods" 
        :key="period"
        @click="activePeriod = period"
        :class="[activePeriod === period ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700']"
        class="flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded transition-all"
      >
        {{ period }}
      </button>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm min-h-[200px] relative">
      <div v-if="isLoading" class="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
        <i class="fa-solid fa-circle-notch animate-spin text-emerald-500"></i>
      </div>

      <div class="flex items-center justify-between mb-5">
        <h2 class="font-black text-slate-800 uppercase text-[10px] tracking-[0.15em]">Top Publications</h2>
        <i class="fa-solid fa-chart-line text-emerald-500 text-sm"></i>
      </div>
      
      <div class="space-y-5">
        <div v-for="(post, index) in topPosts" :key="post.id" class="group cursor-pointer">
          <div class="flex gap-4">
            <span class="text-xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors">0{{ index + 1 }}</span>
            <div class="flex-1 border-b border-slate-50 pb-3 group-last:border-none">
              <p class="text-xs text-slate-600 line-clamp-2 font-semibold leading-relaxed group-hover:text-emerald-700 transition-colors">
                {{ post.content }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded uppercase tracking-tighter">
                   {{ post.likes_count || post.likes }} Mentions
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <p v-if="!isLoading && topPosts.length === 0" class="text-[10px] text-center text-slate-400 italic">
          Aucune donnée pour cette période
        </p>
      </div>
    </div>

    <div class="bg-slate-900 rounded-xl p-5 text-white shadow-lg shadow-slate-200 relative overflow-hidden">
      <div class="flex items-center gap-2 mb-5">
        <div class="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <h2 class="font-black uppercase text-[10px] tracking-[0.15em] text-slate-400">Collaborateurs Actifs</h2>
      </div>
      
      <div class="space-y-4">
        <div v-for="user in topCommenters" :key="user.id" class="flex items-center justify-between group">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`" class="h-8 w-8 rounded-lg border border-slate-700">
              <div class="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <span class="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{{ user.name }}</span>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black text-emerald-400">{{ user.comments_count || user.comments }}</p>
            <p class="text-[8px] text-slate-500 uppercase font-bold">Actions</p>
          </div>
        </div>
      </div>
      
      <button class="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded transition uppercase">
        Voir le classement complet
      </button>
    </div>

    <div class="p-5 rounded-xl border border-slate-200 bg-white border-dashed text-center">
      <div class="text-slate-400 mb-2">
        <i class="fa-solid fa-circle-question text-xl"></i>
      </div>
      <p class="text-[11px] text-slate-600 font-bold">Besoin d'assistance ?</p>
      <p class="text-[10px] text-slate-400 mt-1">Contactez le support IT de l'ESN</p>
    </div>

  </aside>
</template>