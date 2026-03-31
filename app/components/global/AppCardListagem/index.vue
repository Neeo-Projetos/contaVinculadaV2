<template>
  <div class="bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/60 rounded-3xl p-6 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-lg group flex flex-col gap-5 relative overflow-hidden">
    
    <div class="flex items-center justify-between gap-4">
      <div @click="$emit('clique-titulo')" title="Clique para abrir os detalhes" class="flex items-center gap-4 flex-1 min-w-0 group-hover:opacity-80 transition-opacity cursor-pointer">
        <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-lg shrink-0 border border-transparent group-hover:border-emerald-300 transition-colors">
          {{ titulo.charAt(0).toUpperCase() }}
        </div>
        <div class="flex flex-col min-w-0">
          <h3 class="font-extrabold text-lg text-gray-900 dark:text-gray-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate" :title="titulo">
            {{ titulo }}
          </h3>
          <span v-show="mostrarSubtitulo" class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 truncate">
            {{ subtituloNome }}: <span class="text-gray-700 dark:text-gray-300 font-semibold">{{ subtituloValor }}</span>
          </span>
        </div>
      </div>
      <AppAtivo v-show="mostrarStatus" :ativo="ativo" class="shrink-0" />
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

    <div class="mt-auto pt-4 flex items-center justify-center gap-3 w-full">
      <button @click="$emit('ver-detalhes')" 
        class="w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 border border-blue-500/20 bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white"
        title="Ver Detalhes">
        <Icon name="fa7-solid:eye" class="h-5 w-5" />
      </button>

      <button @click="$emit('editar')" 
        class="w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white"
        title="Editar">
        <Icon name="fa7-solid:pen" class="h-5 w-5" />
      </button>

      <button v-show="mostrarHistorico" @click="$emit('ver-historico')" 
        class="w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 border border-slate-500/20 bg-slate-500/5 text-slate-500 hover:bg-slate-500 hover:text-white"
        title="Ver Histórico">
        <Icon name="fa6-solid:clock-rotate-left" class="h-5 w-5" />
      </button>

      <button @click="$emit('excluir')" 
        class="w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white"
        title="Excluir">
        <Icon name="fa7-solid:trash" class="h-5 w-5" />
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

defineEmits(['clique-titulo', 'ver-detalhes', 'ver-historico', 'editar', 'excluir'])
</script>