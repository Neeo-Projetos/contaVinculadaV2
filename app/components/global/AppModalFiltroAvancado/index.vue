<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div v-if="aberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
        <div class="relative bg-white dark:bg-[#1a1c23] rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 flex flex-col animate-fade-in">
          
          <div class="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Icon name="fa7-solid:filter" class="w-5 h-5" />
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Filtros Avançados</h3>
            </div>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <slot></slot>
            </div>
          </div>

          <div class="p-5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900/30 gap-4 rounded-b-2xl">
            <button @click="$emit('limpar')" class="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors">
              <Icon name="fa7-solid:trash-can" /> Limpar Filtros
            </button>
            <div class="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <AppBotao variacao="padrao" @click="$emit('close')">Cancelar</AppBotao>
              <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="$emit('aplicar')">Consultar</AppBotao>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({ aberto: Boolean })
defineEmits(['close', 'limpar', 'aplicar'])
</script>