<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div v-if="aberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal Container -->
        <div class="relative w-full max-w-xl bg-white dark:bg-[#1e2029] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
          
          <!-- Header Premium -->
          <div class="bg-gradient-to-br from-[#22262e] to-[#2c3e50] dark:from-[#1a1c23] dark:to-[#0f172a] p-5 border-b border-gray-200/10 dark:border-gray-800 flex items-center justify-between relative overflow-hidden shrink-0">
            <!-- Decorative Orb -->
            <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full border-[15px] border-emerald-500/5 blur-sm pointer-events-none"></div>
            
            <h2 class="text-xl font-black text-white tracking-tight flex items-center gap-3 relative z-10">
              <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md shadow-inner">
                <Icon name="fa7-solid:pen-fancy" class="w-4 h-4 text-emerald-400" />
              </div>
              Motivo do Estorno
            </h2>
            
            <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors relative z-10 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/10 dark:bg-transparent scrollbar-custom relative z-10 max-h-[85vh]">
            
            <!-- Card de Justificativa -->
            <div class="relative p-6 bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm transition-all duration-300 hover:border-emerald-500/40 group overflow-hidden flex flex-col">
              
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Icon name="fa7-solid:message" class="w-3.5 h-3.5" />
                </div>
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-emerald-500 transition-colors">
                  Justificativa Operacional
                </label>
              </div>
              
              <div class="relative">
                <textarea 
                  :value="motivo"
                  @input="$emit('update:motivo', ($event.target as HTMLTextAreaElement).value)"
                  rows="4"
                  class="w-full bg-transparent border-none p-0 text-gray-800 dark:text-gray-50 font-black leading-snug text-lg tracking-tight focus:ring-0 outline-none transition-all resize-none placeholder:font-medium placeholder:text-gray-400/50"
                  placeholder="Descreva detalhadamente o motivo da reversão..."
                ></textarea>
                <div class="absolute bottom-0 right-0 opacity-20 pointer-events-none">
                  <Icon name="fa7-solid:quote-right" class="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>

            <!-- Card Data Programada -->
            <div class="p-5 bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:border-amber-500/30 transition-all duration-300 group flex flex-col items-center text-center">
              <div class="flex items-center justify-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Icon name="fa7-solid:clock-rotate-left" class="w-3.5 h-3.5" />
                </div>
                <span class="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 group-hover:text-amber-500 transition-colors">Data Programada</span>
              </div>
              <div>
                  <span class="block text-[10px] text-gray-400 font-bold mb-0.5 opacity-70 italic uppercase tracking-widest">Execução do Estorno</span>
                  <span class="font-black text-gray-900 dark:text-white tabular-nums text-xl tracking-tighter leading-none">
                  {{ dataProgramada }}
                  </span>
              </div>
            </div>

          </div>

          <!-- Footer Premium -->
          <div class="border-t border-gray-200 dark:border-gray-800 p-5 flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#1e2029] shrink-0 relative z-10">
            <button 
              @click="$emit('close')" 
              class="flex-1 px-8 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-[#2c3e50]/30 dark:hover:bg-[#2c3e50]/50 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 active:scale-95 group flex items-center justify-center gap-3"
            >
              Cancelar
              <Icon name="fa7-solid:xmark" class="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              @click="$emit('avancar')" 
              class="flex-2 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95 group flex items-center justify-center gap-3"
            >
              Avançar para PIN
              <Icon name="fa7-solid:shield-halved" class="w-3.5 h-3.5 group-hover:animate-bounce-subtle" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  aberto: boolean
  motivo: string
  dataProgramada: string
}>()

defineEmits(['close', 'update:motivo', 'avancar'])
</script>

<style scoped>
.scrollbar-custom::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.dark .scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

@keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}
.group-hover\:animate-bounce-subtle {
    animation: bounce-subtle 2s infinite;
}
</style>
