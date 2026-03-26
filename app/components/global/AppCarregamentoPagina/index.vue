<template>
  <Transition name="fade">
    <div v-if="carregando" 
      class="fixed inset-0 z-[99999] flex flex-col items-center justify-start pt-[30vh] overflow-hidden"
    >
      <!-- Fundo Glassmorphism Minimalista Ultra-Blur -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-[20px] transition-all duration-700"></div>
      
      <!-- Luzes de fundo extremamente sutis -->
      <div class="absolute inset-0 opacity-30 pointer-events-none">
        <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <!-- Conteúdo Minimalista -->
      <div class="relative flex flex-col items-center gap-10 px-6">
        
        <div class="flex flex-col items-center gap-4 text-center">
          <!-- Logo de Texto Refinada -->
          <h2 class="text-4xl md:text-5xl font-black text-white tracking-[0.2em] uppercase opacity-90 drop-shadow-2xl">
            Conta<span class="text-emerald-400 font-light">Vinculada</span>
          </h2>
          
          <!-- Mensagem de Status Discreta -->
          <div class="flex items-center gap-4 text-emerald-400/60 font-medium text-[10px] tracking-[0.4em] uppercase">
            <span class="inline-block w-8 h-[1px] bg-emerald-500/30"></span>
            {{ mensagem }}
            <span class="inline-block w-8 h-[1px] bg-emerald-500/30"></span>
          </div>
        </div>

        <!-- Barra de progresso ultra-fina -->
        <div class="w-64 h-[1px] bg-white/10 rounded-full overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-full animate-shimmer"></div>
        </div>
      </div>

      <!-- Rodapé Minimalista -->
      <div class="absolute bottom-12 flex flex-col items-center gap-3 opacity-30">
        <div class="text-[9px] font-bold text-white uppercase tracking-[0.5em] text-center px-4">
          Sistema de Gestão de Contas Vinculadas - V2
        </div>
        <div class="flex items-center gap-1">
          <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
          <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" style="animation-delay: 0.2s"></div>
          <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  carregando: { type: Boolean, default: false },
  mensagem: { type: String, default: 'Sincronizando dados...' }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-reverse-slow {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0) rotate(3deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
}

@keyframes shimmer {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(150%); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

.animate-spin-reverse-slow {
  animation: spin-reverse-slow 12s linear infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animate-shimmer {
  animation: shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
