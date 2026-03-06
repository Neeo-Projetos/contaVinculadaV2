<template>
  <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex flex-col gap-5 mb-2">
    
    <div class="flex flex-col xl:flex-row items-center justify-between gap-4">
      
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-1/2">
        <slot name="entradas"></slot>
      </div>

      <div class="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto shrink-0">
        
        <div v-if="mostrarAlternadorVisao" class="flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
          <button @click="$emit('update:visaoAtual', 'lista')" :class="visaoAtual === 'lista' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-transparent'" class="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
            <Icon name="fa7-solid:list-ul" class="w-4 h-4" /> Lista
          </button>
          <button @click="$emit('update:visaoAtual', 'cards')" :class="visaoAtual === 'cards' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-transparent'" class="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
            <Icon name="fa7-solid:border-all" class="w-4 h-4" /> Cards
          </button>
        </div>

        <div v-if="mostrarAlternadorVisao" class="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1"></div>

        <slot name="acoes-secundarias"></slot>
      </div>
    </div>

    <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <slot name="acoes-principais"></slot>
    </div>
    
  </div>
</template>

<script setup lang="ts">
defineProps({
  visaoAtual: { type: String, default: 'lista' },
  mostrarAlternadorVisao: { type: Boolean, default: true }
})

defineEmits(['update:visaoAtual'])
</script>