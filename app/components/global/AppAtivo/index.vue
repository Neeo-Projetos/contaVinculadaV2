<template>
  <span v-if="ativo" class="shrink-0 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full text-xs font-bold">
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativo
  </span>
  <span v-else class="shrink-0 inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-2.5 py-1 rounded-full text-xs font-bold">
    <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inativo
  </span>
</template>

<script setup lang="ts">
defineProps({
  ativo: { type: Boolean, required: true }
})
</script>