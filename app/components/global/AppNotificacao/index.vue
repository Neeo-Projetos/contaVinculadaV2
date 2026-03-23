<template>
  <div class="fixed top-8 right-8 z-[9999] pointer-events-none flex flex-col gap-4 max-w-md w-full">
    <Transition
      enter-active-class="transition duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      enter-from-class="transform translate-x-[110%] opacity-0 scale-95"
      enter-to-class="transform translate-x-0 opacity-100 scale-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-20 opacity-0"
    >
      <div v-if="notificacaoAtiva && notificacaoAtiva.visivel" 
           class="pointer-events-auto relative flex items-stretch bg-[#111827]/98 backdrop-blur-3xl rounded-[28px] shadow-[0_45px_100px_rgba(0,0,0,0.6)] border border-white/10 group overflow-hidden">
        
        <div class="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[28px]">
          <svg class="w-full h-full" viewBox="0 0 500 110" preserveAspectRatio="none">
            
            <path id="progressPathL" 
                  d="M 2 0 L 2 82 A 26 26 0 0 0 28 108 L 500 108" 
                  vector-effect="non-scaling-stroke"
                  fill="none" 
                  :class="[
                    'stroke-current',
                    notificacaoAtiva.tipo === 'success' ? 'text-emerald-500' :
                    notificacaoAtiva.tipo === 'error' ? 'text-rose-500' :
                    notificacaoAtiva.tipo === 'warning' ? 'text-amber-500' : 
                    'text-blue-500'
                  ]"
                  stroke-width="4"
                  stroke-linecap="butt"
                  stroke-linejoin="round"
                  pathLength="1000"
                  stroke-dasharray="1000"
                  class="animate-l-full-fill"
            />
          </svg>
        </div>

        <div class="flex-1 p-6 pr-10 z-20">
          <div class="flex items-center gap-5">
            <div :class="[
              'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 border border-white/10 shadow-lg',
              notificacaoAtiva.tipo === 'success' ? 'text-emerald-400' :
              notificacaoAtiva.tipo === 'error' ? 'text-rose-400' :
              notificacaoAtiva.tipo === 'warning' ? 'text-amber-400' : 'text-blue-400'
            ]">
              <Icon :name="iconePorTipo" class="w-7 h-7" />
            </div>
            
            <div class="flex flex-col gap-1">
              <h4 class="text-base font-black text-white uppercase tracking-wider">
                {{ notificacaoAtiva.titulo }}
              </h4>
              <p class="text-[14px] leading-snug text-gray-300 font-bold italic opacity-95">
                {{ notificacaoAtiva.mensagem }}
              </p>
            </div>
          </div>
        </div>

        <button @click="fecharNotificacao" 
                class="absolute top-5 right-5 p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all z-30">
          <Icon name="fa7-solid:xmark" class="w-3.5 h-3.5" />
        </button>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { notificacaoAtiva, fecharNotificacao } = useAppNotificacao()

const iconePorTipo = computed(() => {
  if (!notificacaoAtiva.value) return 'fa7-solid:info-circle'
  switch (notificacaoAtiva.value.tipo) {
    case 'success': return 'fa7-solid:circle-check'
    case 'error': return 'fa7-solid:circle-xmark'
    case 'warning': return 'fa7-solid:triangle-exclamation'
    default: return 'fa7-solid:circle-info'
  }
})
</script>

<style scoped>
@keyframes l-fill-complete {
  from { stroke-dashoffset: 1000; }
  to { stroke-dashoffset: 0; } 
}

.animate-l-full-fill {
  stroke-dashoffset: 1000; 
  animation: l-fill-complete 10000ms linear forwards;
}

svg {
  filter: drop-shadow(0 0 5px currentColor);
}
</style>