<template>
  <div
    class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col relative min-h-[300px] mb-6">

    <div v-if="carregando"
      class="absolute inset-0 z-30 bg-white/70 dark:bg-[#1e2029]/80 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all duration-300">
      <Icon name="fa7-solid:spinner" class="animate-spin w-12 h-12 mb-4" />
      <span class="font-bold tracking-wide">Buscando informações...</span>
    </div>

    <div v-if="!buscaRealizada"
      class="flex flex-col items-center justify-center py-16 px-6 text-gray-400 dark:text-gray-500">
      <div
        class="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200 dark:border-gray-700">
        <Icon name="fa7-solid:magnifying-glass" class="w-8 h-8 opacity-70 text-emerald-500 dark:text-emerald-400" />
      </div>
      <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">Pronto para buscar</h3>
      <p class="font-medium text-sm text-center max-w-sm">Utilize a busca rápida ou os filtros para listar os registros.
      </p>
    </div>

    <div v-else-if="lista.length === 0"
      class="flex flex-col items-center justify-center py-16 px-6 text-gray-400 dark:text-gray-500">
      <div
        class="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200 dark:border-gray-700">
        <Icon name="fa7-solid:folder-open" class="w-8 h-8 opacity-50" />
      </div>
      <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">Nenhum resultado</h3>
      <p class="font-medium text-sm text-center">Nenhum registro encontrado com os filtros informados.</p>
    </div>

    <div v-else class="relative z-10 bg-gray-50/30 dark:bg-transparent flex flex-col flex-1">

      <div v-if="visaoAtual === 'cards'"
        class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 p-4 sm:p-6 mb-4">
        <template v-for="(item, index) in lista" :key="item.codigo || index">
          <slot name="cards" :item="item"></slot>
        </template>
      </div>

      <div v-else class="overflow-x-auto flex flex-col min-h-[400px] mb-4">
        <table class="w-full text-left border-collapse flex-1">
          <thead class="bg-gray-50 dark:bg-[#1a1c23] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
            <tr class="divide-x divide-gray-200 dark:divide-gray-800">
              <slot name="cabecalho-tabela"></slot>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800/80 bg-white dark:bg-[#1e2029]">
            <tr v-for="(item, index) in lista" :key="item.codigo || index"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group divide-x divide-gray-100 dark:divide-gray-800/60">
              <slot name="linhas-tabela" :item="item"></slot>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="bg-gray-50 dark:bg-[#1a1c23] border-t border-gray-200 dark:border-gray-800 p-4 sm:px-6 flex flex-col xl:flex-row items-center justify-between gap-4 mt-auto rounded-b-2xl">
        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 text-center xl:text-left">
          Mostrando de <span class="font-bold text-gray-900 dark:text-gray-100">{{ registroInicial }}</span>
          até <span class="font-bold text-gray-900 dark:text-gray-100">{{ registroFinal }}</span>
          de <span class="font-bold text-gray-900 dark:text-gray-100">{{ totalRegistros }}</span> registros
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-4">

          <div class="flex items-center gap-2 relative">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Linhas por página:</span>
            <div @click="dropdownLinhasAberto = !dropdownLinhasAberto"
              class="bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer shadow-sm min-w-[70px] flex items-center justify-between"
              :class="{ 'ring-2 ring-emerald-500/50 border-emerald-500': dropdownLinhasAberto }">
              <span>{{ itensPorPagina }}</span>
              <Icon name="fa7-solid:chevron-down" class="w-3 h-3 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': dropdownLinhasAberto }" />
            </div>
            <div v-if="dropdownLinhasAberto" class="fixed inset-0 z-40" @click="dropdownLinhasAberto = false"></div>
            <Transition name="dropdown">
              <div v-if="dropdownLinhasAberto"
                class="absolute bottom-full mb-1 right-0 z-50 w-[70px] bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                <ul class="py-1 text-center flex flex-col">
                  <li v-for="opcao in [10, 25, 50, 100]" :key="opcao" @click="selecionarLinhas(opcao)"
                    class="px-2 py-2 text-sm cursor-pointer transition-colors"
                    :class="itensPorPagina === opcao ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'">
                    {{ opcao }}
                  </li>
                </ul>
              </div>
            </Transition>
          </div>

          <div v-if="totalPaginas > 1"
            class="flex items-center bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
            <button @click="$emit('mudarPagina', paginaAtual - 1)" :disabled="paginaAtual === 1"
              class="px-3 sm:px-4 py-2 text-sm font-bold transition-colors"
              :class="paginaAtual === 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400'">Anterior</button>
            <template v-for="(pag, index) in paginasExibidas" :key="index">
              <button v-if="pag !== '...'" @click="$emit('mudarPagina', Number(pag))"
                class="px-3.5 py-2 text-sm font-bold transition-colors"
                :class="pag === paginaAtual ? 'bg-emerald-500 text-white cursor-default' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400'">{{
                  pag }}</button>
              <div v-else
                class="px-3 py-2 text-sm font-bold text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 cursor-default">
                ...</div>
            </template>
            <button @click="$emit('mudarPagina', paginaAtual + 1)" :disabled="paginaAtual === totalPaginas"
              class="px-3 sm:px-4 py-2 text-sm font-bold transition-colors"
              :class="paginaAtual === totalPaginas ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400'">Próximo</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

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
  paginasExibidas: { type: Array as PropType<(number | string)[]>, default: () => [] }
})

const emit = defineEmits(['mudarPagina', 'mudarItensPorPagina'])
const dropdownLinhasAberto = ref(false)

const selecionarLinhas = (quantidade: number) => {
  dropdownLinhasAberto.value = false
  emit('mudarItensPorPagina', quantidade)
}
</script>