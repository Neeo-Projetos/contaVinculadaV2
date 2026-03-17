<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
        R$
      </div>
      <input
        :id="id"
        ref="input"
        :value="modelValue"
        @input="handleInput($event)"
        type="text"
        :required="required"
        :placeholder="placeholder"
        class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl py-3 pl-11 pr-4 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400 font-mono"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: () => `input-moeda-${Math.random().toString(36).substr(2, 9)}` },
  placeholder: { type: String, default: '0,00' },
  required: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  
  // Converte para decimal
  const numberValue = (Number(value) / 100)
  
  // Formata como moeda PT-BR (sem o R$)
  const formattedValue = numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  // Atualiza o valor exibido
  target.value = formattedValue
  
  // Emite o valor formatado para o modelValue
  emit('update:modelValue', formattedValue)
}

// Inicializa o valor se necessário
onMounted(() => {
  if (props.modelValue) {
    const event = { target: { value: String(props.modelValue) } } as any
    handleInput(event)
  }
})
</script>
