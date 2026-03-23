<script setup lang="ts">
onMounted(() => {
  navigateTo('/login')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center gap-4">
      <Icon name="fa7-solid:circle-notch" class="animate-spin w-10 h-10 text-emerald-500" />
      <p class="text-gray-500 dark:text-gray-400 font-medium anim-pulse">Carregando acesso...</p>
    </div>
  </div>
</template>