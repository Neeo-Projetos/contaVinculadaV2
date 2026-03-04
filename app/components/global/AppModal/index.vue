<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
    <div class="bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white tracking-wide flex items-center gap-2">
          <Icon v-if="icon" :name="icon" class="text-[#3276b1] dark:text-[#a8cf45] w-6 h-6" />
          {{ title }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
          <Icon name="fa7-solid:xmark" class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 overflow-y-auto">
        <slot />
      </div>

      <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl flex justify-end gap-3">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, required: true },
  icon: { type: String, default: '' }
})

defineEmits(['close'])
</script>

<style scoped src="./style.css"></style>