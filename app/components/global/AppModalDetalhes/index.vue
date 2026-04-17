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
                <Icon :name="icone || 'fa7-solid:circle-info'" class="w-4 h-4 text-emerald-400" />
              </div>
              {{ titulo || 'Detalhes do Lançamento' }}
            </h2>
            
            <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors relative z-10 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/10 dark:bg-transparent scrollbar-custom relative z-10 max-h-[85vh]">
            
            <!-- Card de Motivo Premium -->
            <div class="relative p-6 bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm transition-all duration-300 hover:border-emerald-500/40 group overflow-hidden flex flex-col items-center text-center">
              
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block group-hover:text-emerald-500 transition-colors">
                Motivo do Lançamento
              </label>
              
              <div class="relative">
                <p class="text-gray-800 dark:text-gray-50 font-black leading-snug text-xl tracking-tight italic">
                  "{{ dados.motivo || 'Nenhum motivo informado.' }}"
                </p>
              </div>
            </div>

            <!-- Grid de Informações Secundárias -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <!-- Card Usuário Premium -->
              <div class="p-5 bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:border-emerald-500/30 transition-all duration-300 group flex flex-col items-center text-center">
                <div class="flex items-center justify-center gap-3 mb-4">
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Icon name="fa7-solid:user-shield" class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 group-hover:text-emerald-500 transition-colors">Operador</span>
                </div>
                <div>
                    <span class="block text-[10px] text-gray-400 font-bold mb-0.5 opacity-70">Responsável pelo registro</span>
                    <span class="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-xl leading-none">
                    {{ dados.usuarioCadastro || 'Sistema' }}
                    </span>
                </div>
              </div>

              <!-- Card Data Premium -->
              <div class="p-5 bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:border-blue-500/30 transition-all duration-300 group flex flex-col items-center text-center">
                <div class="flex items-center justify-center gap-3 mb-4">
                  <div class="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Icon name="fa7-solid:clock" class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 group-hover:text-blue-500 transition-colors">Data / Hora</span>
                </div>
                <div>
                    <span class="block text-[10px] text-gray-400 font-bold mb-0.5 opacity-70">Momento do Cadastro</span>
                    <span class="font-black text-gray-900 dark:text-white tabular-nums text-xl tracking-tighter leading-none">
                    {{ dados.dataCadastro || '--/--/----' }}
                    </span>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer Premium -->
          <div class="border-t border-gray-200 dark:border-gray-800 p-5 flex justify-center bg-white dark:bg-[#1e2029] shrink-0 relative z-10">
            <button 
              @click="$emit('close')" 
              class="w-full sm:w-auto px-16 py-3 bg-[#1a1c23] hover:bg-black dark:bg-[#2c3e50] dark:hover:bg-[#34495e] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95 group flex items-center gap-3"
            >
              Fechar Detalhes
              <Icon name="fa7-solid:xmark" class="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  aberto: { type: Boolean, default: false },
  titulo: { type: String, default: '' },
  icone: { type: String, default: '' },
  dados: {
    type: Object as () => {
      motivo?: string
      usuarioCadastro?: string
      dataCadastro?: string
    },
    default: () => ({})
  }
})

defineEmits(['close'])
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

/* Animação adicional para os cards */
.group:hover {
    transform: translateY(-2px);
}
</style>
