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
        
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="fechar"></div>

        <div class="relative w-full max-w-2xl bg-white dark:bg-[#1e2029] rounded-2xl shadow-2xl flex flex-col">
          
          <div class="bg-gray-50 dark:bg-[#1a1c23] p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon name="fa7-solid:table-columns" class="w-4 h-4" />
                </div>
                Controle de Exibição
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">Selecione quais colunas deseja ver na tabela.</p>
            </div>
            <button @click="fechar" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <label class="relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="colunas.cpf ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#15171e] hover:border-emerald-300 dark:hover:border-emerald-700'">
              <input type="checkbox" v-model="colunas.cpf" class="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="font-bold text-sm text-gray-800 dark:text-gray-200">Documento (CPF)</span>
            </label>

            <label class="relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="colunas.matricula ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#15171e] hover:border-emerald-300 dark:hover:border-emerald-700'">
              <input type="checkbox" v-model="colunas.matricula" class="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="font-bold text-sm text-gray-800 dark:text-gray-200">Matrícula</span>
            </label>

            <label class="relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="colunas.projeto ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#15171e] hover:border-emerald-300 dark:hover:border-emerald-700'">
              <input type="checkbox" v-model="colunas.projeto" class="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="font-bold text-sm text-gray-800 dark:text-gray-200">Projeto / Alocação</span>
            </label>

            <label class="relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="colunas.status ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#15171e] hover:border-emerald-300 dark:hover:border-emerald-700'">
              <input type="checkbox" v-model="colunas.status" class="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="font-bold text-sm text-gray-800 dark:text-gray-200">Status</span>
            </label>

            <label class="relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="colunas.historico ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#15171e] hover:border-emerald-300 dark:hover:border-emerald-700'">
              <input type="checkbox" v-model="colunas.historico" class="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="font-bold text-sm text-gray-800 dark:text-gray-200">Botão de Histórico</span>
            </label>

          </div>

          <div class="bg-gray-50 dark:bg-[#1a1c23] border-t border-gray-200 dark:border-gray-800 p-5 flex items-center justify-end rounded-b-2xl">
            <button @click="aplicar" class="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
              <Icon name="fa7-solid:check" class="w-4 h-4" /> Pronto
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps({
  aberto: {
    type: Boolean,
    default: false
  },
  colunas: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'aplicar'])

const fechar = () => emit('close')
const aplicar = () => emit('aplicar') 
</script>