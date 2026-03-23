<script setup>
import { RouterView, useRoute } from 'vue-router'
import SideBar from '@/components/SideBar.vue'
import RightBar from '@/components/RightBar.vue'
import NotificationToast from '@/components/NotificationToast.vue'

const route = useRoute()
</script>

<template>
  <template v-if="route.name">
    
    <div v-if="route.name === 'login'" class="h-screen w-full bg-white">
      <RouterView />
    </div>

    <div v-else class="h-screen flex bg-slate-50 overflow-hidden font-sans">
      <SideBar class="w-64 border-r border-slate-200 bg-white flex-shrink-0" />
      
      <main class="flex-1 flex flex-col min-w-0 bg-white">
        <header class="h-14 border-b border-slate-100 flex items-center px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
          <h1 class="font-black text-slate-800 text-xs uppercase tracking-widest">
            {{ route.meta?.title || route.name }}
          </h1>
        </header>

        <div class="flex-1 overflow-y-auto bg-slate-50/30">
          <div :class="route.name === 'messages' ? 'w-full h-full' : 'max-w-4xl mx-auto p-6 lg:p-10'">
            <RouterView />
          </div>
        </div>
      </main>

      <RightBar v-if="route.name !== 'messages'" class="hidden xl:block w-80 border-l border-slate-200 bg-slate-50/50 flex-shrink-0" />
    </div>

  </template>

  <div v-else class="h-screen w-full flex items-center justify-center bg-slate-50">
     <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
  </div>

  <NotificationToast />
</template>

<style>
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>