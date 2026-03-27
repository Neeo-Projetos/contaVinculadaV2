<template>
  <div class="relative w-full sm:max-w-md">
    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Icon name="fa7-solid:magnifying-glass" class="h-4 w-4 text-gray-400" />
    </div>
    <input
      :value="modelValue"
      @input="aoDigitar"
      type="text"
      :placeholder="placeholder"
      class="block w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-lg text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
    />
    <button 
      v-if="modelValue" 
      @click="limpar"
      class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
    >
      <Icon name="fa7-solid:xmark" class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Buscar na listagem...' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const aoDigitar = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
}

const limpar = () => {
  emit('update:modelValue', '')
  emit('change', '')
}
</script>
