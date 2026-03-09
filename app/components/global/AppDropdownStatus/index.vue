<template>
  <div class="w-full sm:w-44 shrink-0 relative z-30">
    <div @click="aberto = !aberto"
         class="w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none transition-all cursor-pointer flex items-center justify-between shadow-sm border"
         :class="aberto ? 'ring-2 ring-emerald-500/50 border-emerald-500' : 'border-gray-200 dark:border-gray-700/70'">
      <span>{{ labelSelecionada }}</span>
      <Icon name="fa7-solid:chevron-down" class="w-3 h-3 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': aberto }" />
    </div>

    <div v-if="aberto" class="fixed inset-0 z-40" @click="aberto = false"></div>

    <Transition name="dropdown">
      <div v-if="aberto" class="absolute top-full mt-1.5 left-0 w-full z-50 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <ul class="py-1 flex flex-col">
          <li v-for="opcao in opcoes" :key="opcao.valor" @click="selecionar(opcao.valor)"
              class="px-4 py-2.5 text-sm cursor-pointer transition-colors"
              :class="modelValue === opcao.valor ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'">
            {{ opcao.rotulo }}
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const aberto = ref(false)

const opcoes = [
  { valor: '', rotulo: 'Status: Todos' },
  { valor: '1', rotulo: 'Status: Ativos' },
  { valor: '0', rotulo: 'Status: Inativos' }
]

const labelSelecionada = computed(() => {
  const enc = opcoes.find(o => o.valor == props.modelValue)
  return enc ? enc.rotulo : 'Status: Todos'
})

const selecionar = (valor: string | number) => {
  emit('update:modelValue', valor)
  emit('change', valor) 
  aberto.value = false
}
</script>