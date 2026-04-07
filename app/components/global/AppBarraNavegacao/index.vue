<template>
  <div class="flex items-center gap-2 bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:px-6 shadow-sm text-gray-500 dark:text-gray-400 font-medium text-sm">
    <Icon v-if="icone" :name="icone" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
    <span v-if="icone" class="mx-1">/</span>
    
    <template v-for="(link, index) in links" :key="index">
      <NuxtLink :to="link.to" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap">
        {{ link.label }}
      </NuxtLink>
      <span class="mx-1">/</span>
    </template>

    <span class="text-gray-800 dark:text-gray-200 font-bold px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md truncate">
      {{ paginaAtual }}
    </span>

    <div class="flex-1"></div>
    <slot name="acoes" />
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'

defineProps({
  icone: { type: String, default: '' },
  links: { type: Array as PropType<{label: string, to: string}[]>, default: () => [] },
  paginaAtual: { type: String, required: true }
})
</script>
