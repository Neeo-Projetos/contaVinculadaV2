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
        <div class="relative w-full max-w-4xl bg-white dark:bg-[#1e2029] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
          
          <!-- Header Premium -->
          <div class="bg-gradient-to-br from-[#22262e] to-[#2c3e50] dark:from-[#1a1c23] dark:to-[#0f172a] p-5 border-b border-gray-200/10 dark:border-gray-800 flex items-center justify-between relative overflow-hidden shrink-0">
            <!-- Decorative Orb -->
            <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full border-[15px] border-emerald-500/5 blur-sm pointer-events-none"></div>
            
            <h2 class="text-xl font-black text-white tracking-tight flex items-center gap-3 relative z-10">
              <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md shadow-inner">
                <Icon name="fa7-solid:users" class="w-4 h-4 text-emerald-400" />
              </div>
              {{ titulo || 'Funcionários Vinculados' }}
            </h2>
            
            <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors relative z-10 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto p-6 scrollbar-custom bg-gray-50/10 dark:bg-transparent relative z-10 max-h-[70vh]">
            
            <div v-if="carregando" class="flex flex-col items-center justify-center py-20">
              <Icon name="fa7-solid:spinner" class="animate-spin w-10 h-10 text-emerald-500 mb-4" />
              <p class="text-gray-500 font-black uppercase tracking-widest text-[10px]">Buscando dados...</p>
            </div>

            <div v-else-if="lista.length > 0" class="space-y-3">
              <div v-for="(item, index) in lista" :key="index" 
                class="flex items-center gap-4 p-4 bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300">
                
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-lg group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner shrink-0">
                  {{ (item.funcionarioNome || item.funcionario || '?').charAt(0).toUpperCase() }}
                </div>
                
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight text-sm group-hover:text-emerald-600 transition-colors">
                    {{ item.funcionarioNome || item.funcionario }}
                  </span>
                  <template v-if="item.cpf">
                    <span class="text-gray-300 dark:text-gray-700 font-black">/</span>
                    <span class="font-black text-gray-500 dark:text-gray-400 tabular-nums text-sm tracking-tight">
                      {{ item.cpf }}
                    </span>
                  </template>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-16 opacity-60">
              <div class="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mb-6 border border-gray-200 dark:border-gray-700/50 shadow-inner">
                <Icon name="fa7-solid:building-user" class="w-8 h-8 text-gray-300" />
              </div>
              <p class="text-lg font-black text-gray-400 uppercase tracking-tighter">Global para o Projeto</p>
              <p class="text-[10px] font-bold text-gray-500 text-center uppercase tracking-widest mt-2 max-w-[250px] leading-relaxed">
                Este lançamento foi aplicado a todos os funcionários vinculados ao projeto.
              </p>
            </div>
          </div>

          <!-- Footer Premium -->
          <div class="border-t border-gray-200 dark:border-gray-800 p-5 flex justify-center bg-white dark:bg-[#1e2029] shrink-0 relative z-10">
            <button 
              @click="$emit('close')" 
              class="w-full sm:w-auto px-16 py-3 bg-[#1a1c23] hover:bg-black dark:bg-[#2c3e50] dark:hover:bg-[#34495e] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95 group flex items-center gap-3 justify-center"
            >
              Fechar Painel
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
  carregando: { type: Boolean, default: false },
  lista: {
    type: Array as () => Array<{
      funcionarioNome?: string
      funcionario?: string
      cargo?: string
      [key: string]: any
    }>,
    default: () => []
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
</style>
