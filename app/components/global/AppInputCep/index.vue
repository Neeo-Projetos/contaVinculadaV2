<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        <Icon name="fa7-solid:map-location-dot" />
      </div>
      <input
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        v-maska data-maska="#####-###"
        type="text"
        :required="required"
        :placeholder="placeholder"
        :readonly="somenteLeitura"
        class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl pl-11 pr-4 h-11 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 placeholder-gray-400 transition-all"
        :class="[
          somenteLeitura 
            ? 'bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-70 pointer-events-none text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700/50 shadow-none' 
            : 'focus:ring-emerald-500/50 focus:border-emerald-500'
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'CEP' },
  id: { type: String, default: () => `cep-${Math.random().toString(36).substr(2, 9)}` },
  placeholder: { type: String, default: '_____-___' },
  required: { type: Boolean, default: false },
  somenteLeitura: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>
