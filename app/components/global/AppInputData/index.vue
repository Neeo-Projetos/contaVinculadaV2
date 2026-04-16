<template>
  <div class="w-full">
    <label v-if="label" :for="id"
      class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative group">
      <div 
        class="absolute inset-y-0 left-0 pl-4 flex items-center cursor-pointer text-gray-400 group-hover:text-emerald-500 transition-colors z-10"
        @click="abrirCalendario"
      >
        <Icon :name="icone || 'fa7-solid:calendar-days'" />
      </div>
      
      <!-- Campo de Texto com Máscara -->
      <input 
        ref="inputRef" 
        :id="id" 
        :value="modelValue" 
        @input="onInput"
        @blur="validarData"
        v-maska data-maska="##/##/####"
        type="text" 
        :placeholder="placeholder || 'DD/MM/AAAA'" 
        :readonly="somenteLeitura"
        class="w-full rounded-xl py-3 text-sm transition-all placeholder-gray-400 border pl-11 pr-4"
        :class="[
          somenteLeitura ? 'bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-70 pointer-events-none text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700/50' : 
          (erro ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10 text-gray-800 dark:text-gray-200' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700/70 focus:border-emerald-500/20 focus:ring-emerald-500/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2')
        ]" 
      />

      <!-- Input de Data Nativo Escondido para o Picker -->
      <input 
        ref="datePickerRef"
        type="date"
        class="absolute opacity-0 pointer-events-none w-0 h-0 invisible"
        @change="onDatePicked"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppNotificacao } from '~/composables/global/useAppNotificacao'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: () => `date-${Math.random().toString(36).substr(2, 9)}` },
  placeholder: { type: String, default: 'DD/MM/AAAA' },
  required: { type: Boolean, default: false },
  icone: { type: String, default: '' },
  erro: { type: String, default: '' },
  somenteLeitura: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'validar'])

const { dispararAlerta } = useAppNotificacao()
const inputRef = ref<HTMLInputElement | null>(null)
const datePickerRef = ref<HTMLInputElement | null>(null)
const onInput = (e: any) => {
  const value = e.target.value
  emit('update:modelValue', value)
}

const abrirCalendario = () => {
  if (props.somenteLeitura) return
  if (datePickerRef.value) {
    try {
      // @ts-ignore - showPicker is a recent browser feature
      if (typeof datePickerRef.value.showPicker === 'function') {
        datePickerRef.value.showPicker()
      } else {
        datePickerRef.value.click()
      }
    } catch {
      datePickerRef.value.click()
    }
  }
}

const onDatePicked = (e: any) => {
  const dateValue = e.target.value // YYYY-MM-DD
  if (!dateValue) return
  
  const [year, month, day] = dateValue.split('-')
  const formatted = `${day}/${month}/${year}`
  emit('update:modelValue', formatted)
  validarData()
}

const validarData = () => {
  const valor = props.modelValue
  if (!valor || valor.length < 10) return

  const partes = valor.split('/')
  if (partes.length !== 3) return

  const day = Number(partes[0])
  const month = Number(partes[1])
  const year = Number(partes[2])
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    emit('update:modelValue', '')
    inputRef.value?.blur()
    return
  }

  const d = new Date(year, month - 1, day)
  const isValid = d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
  
  if (!isValid) {
    dispararAlerta('Data Inválida', 'A data informada não existe no calendário.', 'error')
    emit('update:modelValue', '')
    inputRef.value?.blur()
  } else {
    if (year < 1900 || year > 2100) {
        dispararAlerta('Ano Inválido', 'O ano deve estar entre 1900 e 2100.', 'warning')
        emit('update:modelValue', '')
        inputRef.value?.blur()
    }
  }
}


defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>
