<template>
  <div class="bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/60 rounded-3xl p-6 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-lg group flex flex-col gap-5 relative overflow-hidden">
    
    <div class="flex items-start justify-between gap-3">
      <div @click="$emit('clique-titulo')" title="Clique para abrir os detalhes" class="flex items-center gap-4 flex-1 group-hover:opacity-80 transition-opacity cursor-pointer">
        <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-lg shrink-0 border border-transparent group-hover:border-emerald-300 transition-colors">
          {{ titulo.charAt(0).toUpperCase() }}
        </div>
        <div class="flex flex-col">
          <h3 class="font-extrabold text-lg text-gray-900 dark:text-gray-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1" :title="titulo">
            {{ titulo }}
          </h3>
          <span v-show="mostrarSubtitulo" class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {{ subtituloNome }}: <span class="text-gray-700 dark:text-gray-300">{{ subtituloValor }}</span>
          </span>
        </div>
      </div>
      <AppAtivo v-show="mostrarStatus" :ativo="ativo" />
    </div>

    <div v-show="mostrarCategoria && categoriaTexto">
      <div class="inline-block bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-2xl text-xs font-semibold leading-relaxed border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <Icon :name="categoriaIcone" class="w-3.5 h-3.5 mr-1.5 opacity-60" /> {{ categoriaTexto }}
      </div>
    </div>

    <div v-if="detalhes && detalhes.length > 0" class="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50">
      <div v-for="(detalhe, index) in detalhes" :key="index" class="flex items-center gap-3">
        <div class="w-6 flex justify-center"><Icon :name="detalhe.icone" class="w-4 h-4 text-emerald-500/70" /></div>
        <span class="font-medium truncate" :title="detalhe.texto">{{ detalhe.texto }}</span>
      </div>
    </div>

    <div class="mt-auto pt-4 flex items-center gap-3 w-full">
      
      <button @click="$emit('ver-detalhes')" class="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm">
        <Icon name="fa7-solid:folder-open" class="w-5 h-5" /> Abrir
      </button>

      <button v-show="mostrarHistorico" @click="$emit('ver-historico')" class="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm">
        <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5 opacity-80" /> Histórico
      </button>
      
    </div>

  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'

defineProps({
  titulo: { type: String, required: true },
  subtituloNome: { type: String, required: true },
  subtituloValor: { type: String, required: true },
  ativo: { type: Boolean, required: true },
  categoriaTexto: { type: String, default: '' },
  categoriaIcone: { type: String, default: 'fa7-solid:tag' },
  detalhes: { 
    type: Array as PropType<{ icone: string, texto: string }[]>, 
    default: () => [] 
  },
  mostrarSubtitulo: { type: Boolean, default: true },
  mostrarStatus: { type: Boolean, default: true },
  mostrarCategoria: { type: Boolean, default: true },
  mostrarHistorico: { type: Boolean, default: true }
})

defineEmits(['clique-titulo', 'ver-detalhes', 'ver-historico'])
</script>