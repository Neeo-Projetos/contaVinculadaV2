<template>
  <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col relative transition-all duration-300"
       :class="(lista || []).length === 0 ? 'flex-1' : ''">

    <div v-if="buscaRealizada && ((lista || []).length > 0 || filtroGlobal)" class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Busca na Esquerda -->
      <AppInputBusca :model-value="filtroGlobal" @update:model-value="$emit('update:filtroGlobal', $event)" class="w-full sm:max-w-md" />

      <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <!-- Indicador de Filtro -->
        <div v-if="filtroGlobal" class="flex text-xs font-bold text-emerald-600 dark:text-emerald-400 items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 transition-all animate-fade-in">
          <Icon name="fa7-solid:filter" class="w-2.5 h-2.5" />
          <span class="hidden xs:inline">Filtrando...</span>
        </div>

        <!-- Seletor de Linhas na Direita -->
        <div class="flex items-center gap-2.5 relative">
          <span class="text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Linhas por página:</span>
          <div @click="dropdownLinhasAberto = !dropdownLinhasAberto"
            class="bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-sm min-w-[80px] flex items-center justify-between gap-2"
            :class="{ 'ring-2 ring-emerald-500/50 border-emerald-500': dropdownLinhasAberto }">
            <span>{{ itensPorPagina }}</span>
            <Icon name="fa7-solid:chevron-down" class="w-3 h-3 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': dropdownLinhasAberto }" />
          </div>
          <div v-if="dropdownLinhasAberto" class="fixed inset-0 z-40" @click="dropdownLinhasAberto = false"></div>
          <Transition name="dropdown">
            <div v-if="dropdownLinhasAberto" class="absolute top-full mt-1 right-0 z-50 w-[65px] bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl py-1">
              <ul class="text-center flex flex-col">
                <li v-for="opcao in (visaoAtual === 'cards' ? [12, 24, 48, 96] : [10, 25, 50, 100])" :key="opcao" @click="selecionarLinhas(opcao)"
                  class="px-2 py-2 text-xs cursor-pointer transition-colors"
                  :class="itensPorPagina === opcao ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'">
                  {{ opcao }}
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div v-if="carregando && (lista || []).length === 0" class="flex-1 flex flex-col items-center justify-center py-12 px-6 animate-fade-in">
      <div class="relative flex items-center justify-center mb-6">
        <div class="absolute inset-0 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-ping opacity-20"></div>
        <div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center relative z-10 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
          <Icon name="fa7-solid:spinner" class="animate-spin w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <h3 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight mb-2">Buscando informações</h3>
      <p class="font-medium text-sm text-gray-500 dark:text-gray-400">Aguarde um momento, estamos processando os dados...</p>
    </div>

    <div v-else-if="!buscaRealizada" class="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div class="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-200/60 dark:border-gray-700/50 ring-8 ring-gray-50/50 dark:ring-gray-800/20">
        <Icon name="fa7-solid:magnifying-glass" class="w-10 h-10 text-emerald-500 dark:text-emerald-400 opacity-90" />
      </div>
      <h3 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight mb-2">Pronto para buscar</h3>
      <p class="font-medium text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">Utilize a barra de pesquisa ou os filtros acima para listar os registros no sistema.</p>
    </div>

    <div v-else-if="(lista || []).length === 0" class="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div class="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-200/60 dark:border-gray-700/50 ring-8 ring-gray-50/50 dark:ring-gray-800/20">
        <Icon name="fa7-solid:folder-open" class="w-10 h-10 text-gray-400 dark:text-gray-500 opacity-80" />
      </div>
      <h3 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight mb-2">Nenhum registro encontrado</h3>
      <p class="font-medium text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">Não encontramos dados com os filtros informados. Limpe os filtros e tente novamente.</p>
    </div>

    <div v-else class="relative z-10 bg-gray-50/30 dark:bg-transparent flex flex-col flex-1">
      
      <div v-if="carregando" class="absolute inset-0 z-30 bg-white/60 dark:bg-[#1e2029]/70 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 rounded-t-2xl">
        <div class="bg-white dark:bg-gray-800 p-4 px-6 rounded-2xl shadow-xl flex items-center gap-4 border border-emerald-100 dark:border-emerald-900/30 animate-fade-in">
          <Icon name="fa7-solid:spinner" class="animate-spin w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span class="font-bold text-sm tracking-wide text-gray-800 dark:text-gray-200">Atualizando lista...</span>
        </div>
      </div>

      <div v-if="visaoAtual === 'cards'" class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 p-4 sm:p-6">
        <template v-for="(item, index) in lista" :key="item.codigo || index">
          <slot name="cards" :item="item"></slot>
        </template>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 dark:bg-[#1a1c23] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
            <tr class="divide-x divide-gray-200 dark:divide-gray-800">
              <slot name="cabecalho-tabela"></slot>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800/80 bg-white dark:bg-[#1e2029]">
            <tr v-for="(item, index) in lista" :key="item.codigo || index" class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group divide-x divide-gray-100 dark:divide-gray-800/60">
              <slot name="linhas-tabela" :item="item"></slot>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-gray-50 dark:bg-[#1a1c23] border-t border-gray-200 dark:border-gray-800 p-4 sm:px-6 flex flex-col xl:flex-row items-center justify-between gap-4 mt-auto">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 text-center xl:text-left">
          Mostrando de <span class="font-bold text-gray-900 dark:text-gray-100">{{ registroInicial }}</span>
          até <span class="font-bold text-gray-900 dark:text-gray-100">{{ registroFinal }}</span>
          de <span class="font-bold text-gray-900 dark:text-gray-100">{{ totalRegistros }}</span> registros
        </div>

          <div v-if="totalPaginas > 1" class="flex items-center bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
            <button type="button" @click="$emit('mudarPagina', paginaAtual - 1)" :disabled="paginaAtual === 1"
              class="px-3 sm:px-4 py-2 text-sm font-bold transition-colors"
              :class="paginaAtual === 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400'">Anterior</button>
            <template v-for="(pag, index) in paginasExibidas" :key="index">
              <button type="button" v-if="pag !== '...'" @click="$emit('mudarPagina', Number(pag))"
                class="px-3.5 py-2 text-sm font-bold transition-colors"
                :class="pag === paginaAtual ? 'bg-emerald-500 text-white cursor-default' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400'">{{ pag }}</button>
              <div v-else class="px-3 py-2 text-sm font-bold text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 cursor-default">...</div>
            </template>
            <button type="button" @click="$emit('mudarPagina', paginaAtual + 1)" :disabled="paginaAtual === totalPaginas"
              class="px-3 sm:px-4 py-2 text-sm font-bold transition-colors"
              :class="paginaAtual === totalPaginas ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400'">Próximo</button>
          </div>

        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { type PropType, ref } from 'vue'

const props = defineProps({
  carregando: { type: Boolean, default: false },
  buscaRealizada: { type: Boolean, default: true },
  lista: { type: Array as PropType<any[]>, required: true },
  visaoAtual: { type: String, default: 'lista' },
  registroInicial: { type: Number, default: 0 },
  registroFinal: { type: Number, default: 0 },
  totalRegistros: { type: Number, default: 0 },
  itensPorPagina: { type: Number, default: 10 },
  totalPaginas: { type: Number, default: 1 },
  paginaAtual: { type: Number, default: 1 },
  paginasExibidas: { type: Array as PropType<(number | string)[]>, default: () => [] },
  filtroGlobal: { type: String, default: '' }
})

const emit = defineEmits(['mudarPagina', 'mudarItensPorPagina', 'update:filtroGlobal'])
const dropdownLinhasAberto = ref(false)

const selecionarLinhas = (quantidade: number) => {
  dropdownLinhasAberto.value = false
  emit('mudarItensPorPagina', quantidade)
}
</script>