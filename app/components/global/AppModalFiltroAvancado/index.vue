<template>
  <div v-if="aberto" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-[#1a1c23] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-800 animate-fade-in flex flex-col">
      
      <div class="flex justify-between items-center p-5 border-b border-gray-800">
        <div class="flex items-center gap-3 text-emerald-400">
          <Icon name="fa7-solid:filter" class="w-5 h-5" />
          <h3 class="text-lg font-bold text-gray-100">Filtros Avançados</h3>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="fa7-solid:xmark" class="w-5 h-5" />
        </button>
      </div>
      
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <slot></slot>
        </div>
      </div>

      <div class="p-5 border-t border-gray-800 flex justify-between items-center bg-gray-900/30">
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
</template>

<script setup lang="ts">
defineProps({ aberto: Boolean })
defineEmits(['close', 'limpar', 'aplicar'])
</script>