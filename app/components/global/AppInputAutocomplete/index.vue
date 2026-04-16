<template>
  <div class="relative w-full sm:flex-1">
    <Icon name="fa6-solid:magnifying-glass" class="absolute left-4 top-3.5 text-gray-400 w-4 h-4 z-10" />
    <input 
      ref="inputRef"
      :value="modelValue" @input="aoDigitar" @focus="$emit('buscar')" @blur="fecharComAtraso"
      @keyup.enter="$emit('enter')" type="text"
      class="w-full rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder-gray-400 truncate border bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700/70 text-gray-800 dark:text-gray-200 focus:ring-emerald-500/50 focus:border-emerald-500"
      :placeholder="placeholder" autocomplete="off" />
    <Icon v-if="buscando" name="fa7-solid:spinner"
      class="animate-spin absolute right-4 top-3.5 text-emerald-500 w-4 h-4" />

    <Transition name="dropdown">
      <div v-if="mostrarMenu"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-2xl max-h-64 overflow-y-auto scrollbar-custom backdrop-blur-xl">
        <div v-if="buscando" class="p-8 text-center flex flex-col items-center justify-center gap-4 text-gray-500 animate-pulse">
          <Icon name="fa7-solid:spinner" class="animate-spin w-8 h-8 text-emerald-500" />
          <span class="text-xs font-black uppercase tracking-widest">Buscando sugestões...</span>
        </div>
        <ul v-else-if="sugestoes.length > 0" class="py-1.5 font-bold">
          <li v-for="sugestao in sugestoes" :key="sugestao[itemValue] || sugestao[itemLabel]"
            @mousedown.prevent="selecionar(sugestao)"
            class="flex items-center gap-3 px-5 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer transition-all border-b border-gray-50 dark:border-gray-800/50 last:border-0 group">
            <Icon name="fa6-solid:magnifying-glass"
              class="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors shrink-0" />
            <span
              class="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
              v-html="destacarTexto(sugestao[itemLabel])"></span>
          </li>
        </ul>
        <div v-else-if="!buscando && String(modelValue).length >= 3"
          class="p-10 text-center flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-gray-500">
          <Icon name="fa6-solid:magnifying-glass" class="w-8 h-8 opacity-20" />
          <span class="text-xs font-bold uppercase tracking-widest">Nenhum resultado encontrado.</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: 'Pesquisar...' },
  required: { type: Boolean, default: false },
  sugestoes: { type: Array as PropType<any[]>, default: () => [] },
  buscando: { type: Boolean, default: false },
  mostrarMenu: { type: Boolean, default: false },
  itemValue: { type: String, default: 'id' },
  itemLabel: { type: String, default: 'descricao' }
})

const emit = defineEmits(['update:modelValue', 'buscar', 'selecionar', 'enter', 'fechar'])
const inputRef = ref<HTMLInputElement | null>(null)

const aoDigitar = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('buscar')
}

const selecionar = (sugestao: any) => {
  emit('selecionar', sugestao)
}

const fecharComAtraso = () => {
  setTimeout(() => emit('fechar'), 200)
}

const destacarTexto = (texto: string) => {
  if (!props.modelValue) return texto
  // Escapar caracteres especiais para o regex
  const valorSeguro = String(props.modelValue).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  const regex = new RegExp(`(${valorSeguro})`, 'gi')
  return texto.replace(regex, '<span class="font-black text-emerald-600 dark:text-emerald-400">$1</span>')
}

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  }
})
</script>