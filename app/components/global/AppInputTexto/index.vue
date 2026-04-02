<template>
  <div class="w-full">
    <label v-if="label" :for="id"
      class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div v-if="icone" class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        <Icon :name="icone" />
      </div>
      <input ref="inputRef" :id="id" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        v-maska :data-maska="mask"
        :type="tipo" :maxlength="maxlength" :placeholder="placeholder" :readonly="somenteLeitura"
        class="w-full rounded-xl py-3 text-sm transition-all placeholder-gray-400 border"
        :class="[
          icone ? 'pl-11 pr-4' : 'px-4',
          centralizado ? 'text-center' : 'text-left',
          somenteLeitura ? 'bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-70 pointer-events-none text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700/50' : 
          (erro ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10 text-gray-800 dark:text-gray-200' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700/70 focus:border-emerald-500/20 focus:ring-emerald-500/10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2')
        ]" />
    </div>
    <span v-if="erro" class="text-red-500 text-[10px] font-bold mt-1.5 block uppercase tracking-wider animate-fade-in pl-1 transition-all">
      <Icon name="fa7-solid:circle-exclamation" class="mr-1" /> {{ erro }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: () => `input-${Math.random().toString(36).substr(2, 9)}` },
  tipo: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  maxlength: { type: [Number, String], default: null },
  icone: { type: String, default: '' },
  mask: { type: String, default: null },
  erro: { type: String, default: '' },
  centralizado: { type: Boolean, default: false },
  somenteLeitura: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

const inputRef = ref<HTMLInputElement | null>(null)

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  }
})
</script>