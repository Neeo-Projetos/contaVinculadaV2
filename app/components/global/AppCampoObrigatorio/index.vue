<template>
  <div class="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider animate-fade-in shadow-sm">
    <Icon name="fa7-solid:circle-info" class="w-5 h-5 shrink-0" />
    <span>
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
// Componente de Alerta de Campo Obrigatório - Padrão Ouro
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
