<template>
  <div class="relative w-full sm:flex-1">
    <Icon name="fa7-solid:magnifying-glass" class="absolute left-4 top-3.5 text-gray-400 w-4 h-4 z-10" />
    <input 
      ref="inputRef"
      :value="modelValue" @input="aoDigitar" @focus="$emit('buscar')" @blur="fecharComAtraso"
      @keyup.enter="$emit('enter')" type="text"
      class="w-full rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder-gray-400 truncate border"
      :class="required 
        ? 'bg-[#fffcc0] text-gray-900 border-yellow-400 focus:border-yellow-500 shadow-sm dark:bg-yellow-500/10 dark:text-gray-100 dark:border-yellow-500/30' 
        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700/70 text-gray-800 dark:text-gray-200 focus:ring-emerald-500/50 focus:border-emerald-500'"
      :placeholder="placeholder" autocomplete="off" />
    <Icon v-if="buscando" name="fa7-solid:spinner"
      class="animate-spin absolute right-4 top-3.5 text-emerald-500 w-4 h-4" />

    <Transition name="dropdown">
      <div v-if="mostrarMenu"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-2xl max-h-64 overflow-y-auto scrollbar-custom backdrop-blur-xl">
        <ul v-if="sugestoes.length > 0" class="py-1.5">
          <li v-for="sugestao in sugestoes" :key="sugestao.id || sugestao.descricao"
            @mousedown.prevent="selecionar(sugestao)"
            class="flex items-center gap-3 px-5 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer transition-all border-b border-gray-50 dark:border-gray-800/50 last:border-0 group">
            <Icon name="fa7-solid:magnifying-glass"
              class="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors shrink-0" />
            <span
              class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
              v-html="destacarTexto(sugestao.descricao)"></span>
          </li>
        </ul>
        <div v-else-if="!buscando && String(modelValue).length >= 3"
          class="p-6 text-center flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
          <span class="text-sm">Nenhum resultado encontrado.</span>
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
  mostrarMenu: { type: Boolean, default: false }
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
  const regex = new RegExp(`(${props.modelValue})`, 'gi')
  return texto.replace(regex, '<span class="font-extrabold text-emerald-600 dark:text-emerald-400">$1</span>')
}

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  }
})
</script>