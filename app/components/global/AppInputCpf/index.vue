<template>
  <div class="w-full">
    <label :for="id" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        <Icon name="fa7-solid:id-card" />
      </div>
      <input 
        ref="inputRef"
        :id="id" :value="modelValue" @input="aoDigitar" @blur="validar" v-maska data-maska="###.###.###-##"
        type="text" :placeholder="placeholder"
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
  label: { type: String, default: 'CPF' },
  id: { type: String, default: () => `cpf-${Math.random().toString(36).substr(2, 9)}` },
  placeholder: { type: String, default: '___.___.___-__' },
  required: { type: Boolean, default: false }
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

const validarCpfMatematico = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf == '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let soma = 0, resto
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  resto = (soma * 10) % 11
  if ((resto == 10) || (resto == 11)) resto = 0
  if (resto != parseInt(cpf.substring(9, 10))) return false
  soma = 0
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  resto = (soma * 10) % 11
  if ((resto == 10) || (resto == 11)) resto = 0
  if (resto != parseInt(cpf.substring(10, 11))) return false
  return true
}

const validar = () => {
  if (!props.modelValue) {
    erroInterno.value = ''
    emit('invalido', false)
    return
  }

  const cpfLimpo = props.modelValue.replace(/\D/g, '')
  if (cpfLimpo.length < 11 || !validarCpfMatematico(cpfLimpo)) {
    erroInterno.value = 'CPF Inválido'
    dispararAlerta('Atenção', 'O CPF informado não é válido.', 'warning')
    emit('invalido', true)
  } else {
    erroInterno.value = ''
    emit('invalido', false)
  }
}

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>