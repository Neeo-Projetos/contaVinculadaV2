<template>
  <Transition name="fade-blur">
    <div v-if="carregando" 
      class="absolute inset-0 z-[100] flex flex-col items-center justify-center rounded-[inherit] overflow-hidden"
    >
      <!-- Fundo Glassmorphism Premium -->
      <div class="absolute inset-0 bg-white/60 dark:bg-[#1e2029]/80 backdrop-blur-md transition-all duration-500"></div>
      
      <!-- Container de Conteúdo -->
      <div class="relative flex flex-col items-center gap-5 scale-95 animate-in fade-in zoom-in duration-500">
        
        <!-- Spinner Customizado com Camadas -->
        <div class="relative w-16 h-16 flex items-center justify-center">
          <!-- Brilho de fundo (glow) -->
          <div class="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/10 rounded-full blur-xl animate-pulse"></div>
          
          <!-- Aro Externo (track) -->
          <div class="absolute inset-0 border-[3px] border-emerald-500/10 dark:border-emerald-400/5 rounded-full"></div>
          
          <!-- Aro de Progresso Animado -->
          <div class="absolute inset-0 border-[3px] border-transparent border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin-slow"></div>
          
          <!-- Ícone Central -->
          <Icon name="fa7-solid:spinner" class="animate-spin w-6 h-6 text-emerald-600 dark:text-emerald-400 opacity-60" />
        </div>

        <!-- Texto com Tipografia Refinada -->
        <div class="flex flex-col items-center gap-1">
          <span class="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase opacity-90">
            {{ mensagem }}
          </span>
          <div class="w-12 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-full overflow-hidden">
            <div class="w-full h-full bg-emerald-500 animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  carregando: { type: Boolean, default: false },
  mensagem: { type: String, default: 'Carregando dados...' }
})
</script>

<style scoped>
.fade-blur-enter-active, .fade-blur-leave-active { 
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.4s ease; 
}
.fade-blur-enter-from, .fade-blur-leave-to { 
  opacity: 0;
  backdrop-filter: blur(0px);
}

.animate-spin-slow {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite ease-in-out;
}
</style>
