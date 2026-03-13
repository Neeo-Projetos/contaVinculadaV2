<template>
  <div class="flex items-center justify-between max-w-4xl mx-auto mb-10 px-4">
    <div v-for="(passo, index) in passos" :key="index" class="flex items-center flex-1 last:flex-none">
      <!-- Círculo e Label -->
      <div class="flex flex-col items-center relative z-10">
        <div 
          class="w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-lg"
          :class="[
             index <= passoAtual 
               ? 'bg-emerald-600 border-emerald-100 dark:border-emerald-900/50 text-white scale-110' 
               : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
          ]"
        >
          <Icon v-if="index < passoAtual" name="fa7-solid:check" class="w-5 h-5" />
          <span v-else class="font-bold text-lg">{{ index + 1 }}</span>
        </div>
        <span 
          class="absolute -bottom-8 whitespace-nowrap text-sm font-bold transition-colors duration-300"
          :class="index <= passoAtual ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'"
        >
          {{ passo }}
        </span>
      </div>

      <!-- Linha Conectora -->
      <div 
        v-if="index < passos.length - 1" 
        class="h-1 flex-1 mx-2 rounded-full transition-colors duration-500"
        :class="index < passoAtual ? 'bg-emerald-600' : 'bg-gray-100 dark:bg-gray-800'"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  passos: {
    type: Array as () => string[],
    required: true
  },
  passoAtual: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
