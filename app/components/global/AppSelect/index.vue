<template>
  <div class="w-full relative">
    <label v-if="label" :for="id"
      class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <div @click="aberto = !aberto"
        ref="triggerRef"
        tabindex="0"
        @keydown.space.prevent="aberto = !aberto"
        @keydown.enter.prevent="aberto = !aberto"
        @keydown.esc="aberto = false"
        class="w-full rounded-xl px-4 py-3 text-sm transition-all cursor-pointer flex items-center justify-between border focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        :class="[
          aberto ? 'ring-2 ring-emerald-500/50 border-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' : 'border-gray-200 dark:border-gray-700/70',
          !modelValue ? 'text-gray-400 dark:text-gray-500' : (required ? 'text-gray-900 dark:text-gray-100' : 'text-gray-800 dark:text-gray-200'),
          required
            ? 'bg-[#fffcc0] border-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/30'
            : 'bg-gray-50 dark:bg-gray-900/50 shadow-sm'
        ]">
        <span class="truncate pr-4">{{ textoSelecionado || placeholder }}</span>
        <Icon name="fa7-solid:chevron-down" class="w-3 h-3 text-gray-400 transition-transform duration-200 shrink-0"
          :class="{ 'rotate-180': aberto }" />
      </div>

      <div v-if="aberto" class="fixed inset-0 z-40" @click="aberto = false"></div>

      <Transition name="dropdown">
        <div v-if="aberto"
          class="absolute top-full mt-1.5 left-0 w-full z-50 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-2xl backdrop-blur-xl py-1 overflow-hidden">

          <div
            class="max-h-60 w-full overflow-y-auto overflow-x-hidden
                      [&::-webkit-scrollbar]:w-1.5 
                      [&::-webkit-scrollbar-track]:bg-transparent 
                      [&::-webkit-scrollbar-thumb]:bg-gray-400/40 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500/40 
                      [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500/60 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/60">
            <ul class="flex flex-col w-full">
              <li v-for="opcao in opcoes" :key="opcao[itemValue]" @click="selecionar(opcao[itemValue])"
                class="w-[calc(100%+1rem)] pl-4 pr-10 py-2.5 text-sm cursor-pointer transition-colors whitespace-normal break-words"
                :class="modelValue === opcao[itemValue] ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'">
                {{ opcao[itemLabel] }}
              </li>
            </ul>
          </div>

        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: () => `select-${Math.random().toString(36).substr(2, 9)}` },
  placeholder: { type: String, default: 'Selecione uma opção...' },
  required: { type: Boolean, default: false },
  opcoes: { type: Array as PropType<any[]>, default: () => [] },
  itemValue: { type: String, default: 'codigo' },
  itemLabel: { type: String, default: 'descricao' }
})

const emit = defineEmits(['update:modelValue'])
const aberto = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

const textoSelecionado = computed(() => {
  const enc = props.opcoes.find(o => o[props.itemValue] === props.modelValue)
  return enc ? enc[props.itemLabel] : ''
})

const selecionar = (valor: any) => {
  emit('update:modelValue', valor)
  aberto.value = false
}

defineExpose({
  focus: () => triggerRef.value?.focus()
})
</script>