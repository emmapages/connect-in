<script setup>
const props = defineProps({
  contact: { type: Object, required: true },
  isActive: { type: Boolean, default: false }
})
</script>

<template>
  <button 
    class="w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative"
    :class="[isActive ? 'bg-emerald-50' : 'hover:bg-slate-50']"
  >
    <div v-if="isActive" class="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-full"></div>

    <div class="relative shrink-0">
      <img 
        :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`" 
        class="h-12 w-12 rounded-lg object-cover shadow-sm"
        :alt="contact.name"
      >
      <div 
        v-if="contact.status === 'online' || contact.online" 
        class="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"
      ></div>
    </div>

    <div class="flex-1 text-left min-w-0">
      <div class="flex justify-between items-baseline mb-0.5">
        <h4 
          class="text-sm font-bold truncate transition-colors"
          :class="[isActive ? 'text-emerald-900' : 'text-slate-900']"
        >
          {{ contact.name }}
        </h4>
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
          {{ contact.time || '12:00' }}
        </span>
      </div>
      
      <p 
        class="text-xs truncate"
        :class="[contact.unread ? 'font-black text-slate-900' : 'text-slate-500 group-hover:text-slate-600']"
      >
        {{ contact.lastMessage || 'Aucun message' }}
      </p>
    </div>

    <div v-if="contact.unread" class="flex flex-col items-end gap-1">
      <div class="h-2 w-2 bg-emerald-600 rounded-full shadow-sm shadow-emerald-200"></div>
    </div>
  </button>
</template>