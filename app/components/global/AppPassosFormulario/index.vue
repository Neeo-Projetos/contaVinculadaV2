<template>
  <div class="w-full px-6 py-6 bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
    <div class="flex items-start justify-between relative px-4 sm:px-10">
      
      <!-- Linha Conectora de Fundo (Sutil como no padrão) -->
      <div class="absolute top-5 left-12 right-12 h-[1px] bg-gray-100 dark:bg-gray-800 z-0">
        <div 
          class="h-full bg-emerald-500 transition-all duration-700 ease-out"
          :style="{ width: (passoAtual / (passos.length - 1)) * 100 + '%' }"
        ></div>
      </div>

      <div v-for="(passo, index) in passos" :key="index" @click="mudar(index)" class="flex flex-col items-center flex-1 relative z-10 group cursor-pointer hover:opacity-80 transition-opacity select-none" :title="`Ir para: ${passo}`">
        
        <!-- Círculo do Passo (Fino e elegante) -->
        <div class="relative mb-3">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 relative bg-white dark:bg-[#1e2029]"
            :class="[
               index < passoAtual 
                 ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                 : index === passoAtual
                   ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 font-black'
                   : 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-700'
            ]"
          >
            <transition name="scale" mode="out-in">
              <Icon v-if="index < passoAtual" name="fa7-solid:check" class="w-4 h-4" key="check" />
              <span v-else class="text-sm font-bold" :key="index">{{ index + 1 }}</span>
            </transition>
          </div>
        </div>
        
        <!-- Label do Passo -->
        <div class="flex flex-col items-center gap-1">
          <span 
            class="text-[10px] sm:text-[11px] font-bold text-center transition-all duration-300 tracking-wider uppercase"
            :class="[
              index < passoAtual ? 'text-emerald-500/70' : 
              index === passoAtual ? 'text-gray-900 dark:text-white' : 
              'text-gray-300 dark:text-gray-700'
            ]"
          >
            {{ passo }}
          </span>
          
          <!-- Indicador de Status Sutil -->
          <div 
            class="h-0.5 rounded-full transition-all duration-500 overflow-hidden"
            :class="index === passoAtual ? 'w-4 bg-emerald-500' : 'w-0 bg-transparent'"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scale-enter-active, .scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  transform: scale(0);
  opacity: 0;
}
</style>

<script setup lang="ts">
const emit = defineEmits(['update:passoAtual', 'mudarPasso'])

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

const mudar = (index: number) => {
  emit('update:passoAtual', index)
  emit('mudarPasso', index)
}
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
