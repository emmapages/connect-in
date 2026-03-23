<script setup>
defineProps({
  message: { type: Object, required: true },
  isMe: { type: Boolean, default: false }
})
</script>

<template>
  <div 
    class="flex w-full mb-3 px-2 transition-all animate-in fade-in slide-in-from-bottom-1" 
    :class="isMe ? 'justify-end' : 'justify-start'"
  >
    <div 
      class="max-w-[80%] p-3.5 shadow-sm relative group"
      :class="isMe 
        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none' 
        : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none'"
    >
      <p class="text-[13px] leading-relaxed break-words">
        {{ message.text || message.content }}
      </p>

      <div 
        class="text-[9px] mt-1.5 font-black uppercase tracking-tighter flex items-center justify-end gap-1"
        :class="isMe ? 'text-emerald-100/80' : 'text-slate-400'"
      >
        <span>{{ message.time || 'Maintenant' }}</span>
        
        <i v-if="isMe" class="fa-solid fa-check-double text-[8px]"></i>
      </div>

      <div 
        v-if="isMe" 
        class="absolute -right-1 top-0 w-2 h-2 bg-emerald-600"
        style="clip-path: polygon(0 0, 0% 100%, 100% 0);"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: message-appear 0.3s ease-out forwards;
}

@keyframes message-appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>