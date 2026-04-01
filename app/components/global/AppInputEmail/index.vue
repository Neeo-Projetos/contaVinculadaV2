<template>
  <div class="w-full">
    <label :for="id" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        <Icon name="fa7-solid:at" />
      </div>
      <input 
        ref="inputRef"
        :id="id" :value="modelValue" @input="aoDigitar" @blur="validar" type="email" :maxlength="maxlength"
        :placeholder="placeholder"
        class="w-full rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder-gray-400 border bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700/70 text-gray-800 dark:text-gray-200 focus:ring-emerald-500/50 focus:border-emerald-500" />
    </div>
    <span v-if="erroInterno" class="text-red-500 text-[10px] font-bold mt-1.5 block uppercase tracking-wider animate-fade-in pl-1">
      <Icon name="fa7-solid:circle-exclamation" class="mr-1" /> {{ erroInterno }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppNotificacao } from '~/composables/global/useAppNotificacao'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Email' },
  id: { type: String, default: () => `email-${Math.random().toString(36).substr(2, 9)}` },
  placeholder: { type: String, default: 'email@exemplo.com' },
  required: { type: Boolean, default: false },
  maxlength: { type: [Number, String], default: 50 }
})

const emit = defineEmits(['update:modelValue', 'invalido'])
const { dispararAlerta } = useAppNotificacao()
const inputRef = ref<HTMLInputElement | null>(null)
const erroInterno = ref('')

const aoDigitar = (event: Event) => {
  const valor = (event.target as HTMLInputElement).value
  erroInterno.value = ''
  emit('update:modelValue', valor)
}

const validar = () => {
  if (!props.modelValue) {
    erroInterno.value = ''
    emit('invalido', false)
    return
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(props.modelValue)) {
    erroInterno.value = 'E-mail Inválido'
    dispararAlerta('Atenção', 'O formato do e-mail não é válido.', 'warning')
    emit('invalido', true)
  } else {
    erroInterno.value = ''
    emit('invalido', false)
  }
}

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  }
})
</script>