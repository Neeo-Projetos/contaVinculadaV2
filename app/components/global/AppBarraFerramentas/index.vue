<template>
  <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex flex-col gap-5 mb-2">
    
    <div class="flex flex-col xl:flex-row items-center justify-between gap-4">
      
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-1/2">
        <slot name="entradas"></slot>
      </div>

      <div class="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto shrink-0">
        
        <div v-if="mostrarAlternadorVisao" class="flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
          <button @click="$emit('update:visaoAtual', 'lista')" :class="visaoAtual === 'lista' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-transparent'" class="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
            <Icon name="fa7-solid:list-ul" class="w-4 h-4" /> Lista
          </button>
          <button @click="$emit('update:visaoAtual', 'cards')" :class="visaoAtual === 'cards' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-transparent'" class="px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
            <Icon name="fa7-solid:border-all" class="w-4 h-4" /> Cards
          </button>
        </div>

        <div v-if="mostrarAlternadorVisao" class="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1"></div>

        <slot name="acoes-secundarias"></slot>
      </div>
    </div>

    <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <slot name="acoes-principais"></slot>
        
        <AppBotao v-if="mostrarRelatorio" variacao="padrao" icone="fa7-solid:file-export" @click="modalRelatorioAberto = true">
          Relatório
        </AppBotao>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <slot name="acoes-pesquisa"></slot>
      </div>
    </div>

    <!-- Modal de Seleção de Formato de Relatório -->
    <AppModal :isOpen="modalRelatorioAberto" title="Exportar Relatório" icon="fa7-solid:file-export" @close="modalRelatorioAberto = false" tamanho="md">
      <div class="p-6 md:p-8 flex flex-col items-center text-center">
        <p class="text-lg text-gray-800 dark:text-gray-100 mb-8 font-extrabold tracking-tight leading-tight max-w-[350px]">
          Escolha o formato desejado para exportar as informações da listagem atual:
        </p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <button 
            @click="$emit('excel'); modalRelatorioAberto = false"
            class="group flex flex-col items-center justify-center p-5 bg-emerald-50 dark:bg-emerald-500/5 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl transition-all duration-300"
          >
            <div class="w-14 h-14 bg-white dark:bg-[#1a1c23] shadow-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-emerald-100 dark:border-emerald-500/10">
              <Icon name="fa7-solid:file-excel" class="w-7 h-7 text-emerald-600" />
            </div>
            <span class="font-bold text-sm text-emerald-900 dark:text-emerald-100 tracking-tight">Gerar Excel</span>
            <span class="text-[8px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Planilha .XLSX</span>
          </button>

          <button 
            @click="$emit('pdf'); modalRelatorioAberto = false"
            class="group flex flex-col items-center justify-center p-5 bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl transition-all duration-300"
          >
            <div class="w-14 h-14 bg-white dark:bg-[#1a1c23] shadow-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-rose-100 dark:border-rose-500/10">
              <Icon name="fa7-solid:file-pdf" class="w-7 h-7 text-rose-600" />
            </div>
            <span class="font-bold text-sm text-rose-900 dark:text-rose-100 tracking-tight">Gerar PDF</span>
            <span class="text-[8px] text-rose-600 font-bold uppercase tracking-widest mt-1">Arquivo .PDF</span>
          </button>
        </div>
      </div>
    </AppModal>
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  visaoAtual: { type: String, default: 'lista' },
  mostrarAlternadorVisao: { type: Boolean, default: true },
  mostrarRelatorio: { type: Boolean, default: false }
})

defineEmits(['update:visaoAtual', 'excel', 'pdf'])

const modalRelatorioAberto = ref(false)
</script>