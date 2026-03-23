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
        :type="tipo" :maxlength="maxlength" :placeholder="placeholder"
        class="w-full rounded-xl py-3 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 transition-all placeholder-gray-400 border"
        :class="[
          icone ? 'pl-11 pr-4' : 'px-4',
          centralizado ? 'text-center' : 'text-left',
          required 
            ? 'bg-[#fffcc0] text-gray-900 border-yellow-400 focus:border-yellow-500 shadow-sm dark:bg-yellow-500/10 dark:text-gray-100 dark:border-yellow-500/30' 
            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700/70 text-gray-800 dark:text-gray-200 focus:border-emerald-500/20 focus:ring-emerald-500/10'
        ]" />
    </div>
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
  centralizado: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

const inputRef = ref<HTMLInputElement | null>(null)

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  }
})
</script>