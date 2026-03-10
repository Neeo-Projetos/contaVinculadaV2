<template>
  <div class="w-full">
    <label :for="id" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" :class="erro ? 'text-red-400' : 'text-gray-400'">
        <Icon name="fa7-solid:at" />
      </div>
      <input
        :id="id"
        :value="modelValue"
        @input="aoDigitar"
        @blur="validar"
        type="email"
        :required="required"
        :maxlength="maxlength"
        :placeholder="placeholder"
        class="w-full bg-gray-50 dark:bg-gray-900/50 rounded-xl pl-11 pr-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none transition-all placeholder-gray-400 border"
        :class="erro ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-gray-200 dark:border-gray-700/70 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500'"
      />
    </div>
    <span v-if="erro" class="text-red-500 text-xs font-semibold mt-1.5 block animate-fade-in">{{ erro }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Email' },
  id: { type: String, default: () => `email-${Math.random().toString(36).substr(2, 9)}` },
  placeholder: { type: String, default: 'email@exemplo.com' },
  required: { type: Boolean, default: false },
  maxlength: { type: [Number, String], default: 50 }
})

const emit = defineEmits(['update:modelValue', 'invalido'])
const erro = ref('')

const aoDigitar = (event: Event) => {
  const valor = (event.target as HTMLInputElement).value
  erro.value = '' 
  emit('update:modelValue', valor)
}

const validar = () => {
  if (!props.modelValue && !props.required) return
  if (!props.modelValue && props.required) {
    erro.value = 'O e-mail é obrigatório.'
    return
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(props.modelValue)) {
    erro.value = 'Formato de e-mail inválido.'
    emit('invalido', true)
  } else {
    emit('invalido', false)
  }
}
</script>