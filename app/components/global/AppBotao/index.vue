<template>
  <button
    :type="nativeType"
    :disabled="disabled || carregando"
    class="w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
    :class="classesVariacao"
  >
    <Icon v-if="carregando" name="fa7-solid:spinner" class="animate-spin w-4 h-4" />
    <Icon v-else-if="icone" :name="icone" class="w-4 h-4" :class="iconeClass" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  variacao: { type: String, default: 'padrao' }, // primario, perigo, padrao
  nativeType: { type: String, default: 'button' as 'button' | 'submit' | 'reset' },
  icone: { type: String, default: '' },
  carregando: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const classesVariacao = computed(() => {
  switch (props.variacao) {
    case 'primario':
      return 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 px-8'
    case 'perigo':
      return 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/50'
    case 'padrao':
      return 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
    default:
      return 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
  }
})

// Deixa o ícone cinza sutil só nos botões secundários
const iconeClass = computed(() => {
  if (props.variacao === 'padrao') return 'text-gray-400'
  return ''
})
</script>