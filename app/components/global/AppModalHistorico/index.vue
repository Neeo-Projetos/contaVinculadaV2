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
        
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="fecharModal"></div>

        <div class="relative w-full max-w-4xl bg-white dark:bg-[#1e2029] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div class="bg-gradient-to-br from-[#22262e] to-[#2c3e50] dark:from-[#1a1c23] dark:to-[#0f172a] p-5 border-b border-gray-200/10 dark:border-gray-800 flex items-center justify-between relative overflow-hidden shrink-0">
            <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full border-[15px] border-emerald-500/5 blur-sm pointer-events-none"></div>
            
            <h2 class="text-xl font-bold text-white tracking-wide flex items-center gap-3 relative z-10">
              <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4 text-emerald-400" />
              </div>
              {{ titulo || 'Histórico de Alterações' }}
            </h2>
            
            <button @click="fecharModal" class="text-gray-400 hover:text-white transition-colors relative z-10 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-custom bg-gray-50/50 dark:bg-transparent relative z-10">
            
            <div v-if="carregando" class="flex flex-col items-center justify-center py-20">
              <Icon name="fa7-solid:spinner" class="animate-spin w-10 h-10 text-emerald-500 mb-4" />
              <p class="text-gray-500 font-medium">Carregando histórico...</p>
            </div>

            <div v-else-if="!historico || historico.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
              <Icon name="fa7-solid:box-open" class="w-12 h-12 mb-3 opacity-50" />
              <p class="font-medium">Nenhum histórico encontrado para este registro.</p>
            </div>

            <div v-else class="flex flex-col gap-3">
              <div 
                v-for="(item, index) in historico" 
                :key="index"
                class="bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:border-emerald-500/30"
              >
                <button 
                  @click="alternarItem(index)"
                  class="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                  :class="{'bg-gray-50 dark:bg-gray-800/50': itemAberto(index)}"
                >
                  <div class="flex items-center gap-3 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                    <Icon name="fa7-solid:calendar-day" class="text-emerald-500 dark:text-emerald-400 w-4 h-4 opacity-70" />
                    <span>{{ item.dataHora }} - <span class="uppercase font-bold text-gray-900 dark:text-gray-100">{{ item.usuario }}</span></span>
                  </div>
                  <Icon 
                    name="fa7-solid:chevron-down" 
                    class="w-4 h-4 text-gray-400 transition-transform duration-300"
                    :class="{'rotate-180': itemAberto(index)}"
                  />
                </button>

                <div 
                class="grid transition-all duration-300 ease-in-out"
                :style="itemAberto(index) ? 'grid-template-rows: 1fr; opacity: 1;' : 'grid-template-rows: 0fr; opacity: 0; pointer-events: none;'"
              >
                <div class="overflow-hidden">
                  <div class="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1c23]">
                    <ul class="p-4 flex flex-col gap-2.5">
                      <li v-for="(alt, idxAlt) in item.alteracoes" :key="idxAlt" class="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <Icon name="fa7-solid:caret-right" class="w-3 h-3 mt-1 text-gray-400 shrink-0" />
                        
                        <p v-if="alt.tipo === 'campo'" class="leading-relaxed">
                          O campo <span class="font-bold text-gray-800 dark:text-gray-200">{{ alt.campo }}</span> foi alterado de: 
                          <span class="font-bold text-red-500 line-through decoration-red-500/30">{{ alt.valorAntigo }}</span> 
                          para: 
                          <span class="font-extrabold text-emerald-600 dark:text-emerald-400">{{ alt.valorNovo }}</span>
                        </p>
                        <p v-else-if="alt.tipo === 'html'" class="leading-relaxed w-full whitespace-pre-line" v-html="alt.mensagem"></p>
                        <p v-else class="leading-relaxed font-bold text-gray-800 dark:text-gray-200">
                          {{ alt.mensagem }}
                        </p>

                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-800 p-4 sm:p-5 flex justify-center bg-white dark:bg-[#1e2029] shrink-0">
            <button @click="fecharModal" class="px-8 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2">
              Fechar Histórico
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  aberto: {
    type: Boolean,
    default: false
  },
  titulo: {
    type: String,
    default: ''
  },
  historico: {
    type: Array as () => Array<{
      dataHora: string,
      usuario: string,
      alteracoes: Array<any>
    }>,
    default: () => []
  },
  carregando: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const itensAbertos = ref<number[]>([])

const fecharModal = () => {
  emit('close')
  setTimeout(() => { itensAbertos.value = [] }, 300) 
}

const alternarItem = (index: number) => {
  const posicao = itensAbertos.value.indexOf(index)
  if (posicao !== -1) {
    itensAbertos.value.splice(posicao, 1)
  } else {
    itensAbertos.value.push(index)
  }
}

const itemAberto = (index: number) => {
  return itensAbertos.value.includes(index)
}
</script>