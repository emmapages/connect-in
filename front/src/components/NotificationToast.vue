<script setup>
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
</script>

<template>
  <div class="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
    <TransitionGroup name="toast">
      <div 
        v-for="alert in userStore.notifications.statusAlerts"
        :key="alert.id"
        class="bg-white border border-slate-100 p-3 rounded-xl shadow-xl flex items-center gap-3 pointer-events-auto overflow-hidden relative"
      >
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>

        <div class="bg-emerald-50 text-emerald-600 h-9 w-9 shrink-0 rounded-lg flex items-center justify-center">
          <i class="fa-solid fa-check-circle text-lg"></i>
        </div>

        <div class="flex-1">
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Notification</p>
          <p class="text-sm font-bold text-slate-700 leading-tight">
            {{ alert.message }}
          </p>
        </div>

        <button class="text-slate-300 hover:text-slate-500 transition-colors">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Animation fluide avec rebond (elastic) */
.toast-enter-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.toast-leave-active {
  transition: all 0.4s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.5);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.9);
}

/* Évite les sauts brutaux quand une notif disparaît au milieu de la liste */
.toast-move {
  transition: transform 0.4s ease;
}
</style>