<template>
  <button
    :type="nativeType"
    :disabled="disabled || carregando"
    class="w-full sm:w-auto px-12 h-[46px] rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
  variacao: { type: String, default: 'padrao' }, // primario, acao, aviso, perigo, padrao
  nativeType: { type: String as () => 'button' | 'submit' | 'reset', default: 'button' },
  icone: { type: String, default: '' },
  carregando: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const classesVariacao = computed(() => {
  switch (props.variacao) {
    case 'primario':
      return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5'
    case 'acao':
      return 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5'
    case 'aviso':
      return 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 px-8'
    case 'perigo':
      return 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transform hover:-translate-y-0.5'
    case 'sucesso':
      return 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50'
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