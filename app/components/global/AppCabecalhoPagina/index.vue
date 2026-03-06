<template>
  <div class="relative overflow-hidden rounded-3xl shadow-sm bg-gradient-to-br from-[#22262e] to-[#2c3e50] dark:from-[#1a1c23] dark:to-[#0f172a] p-6 sm:p-8 border border-gray-200/10 dark:border-gray-800">
    <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full border-[30px] border-emerald-500/5 blur-sm pointer-events-none"></div>
    <div class="absolute -right-10 top-20 w-32 h-32 rounded-full border-[15px] border-[#a8cf45]/10 blur-sm pointer-events-none"></div>

    <div class="relative z-10 flex flex-col gap-1">
      <h2 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-inner shrink-0">
          <Icon :name="icone" class="w-6 h-6 text-emerald-400" />
        </div>
        {{ tituloFino }}
        <span class="text-emerald-400 drop-shadow-md">{{ tituloGrosso }}</span>
      </h2>
      <p class="text-gray-400 text-sm md:text-base font-medium flex items-center gap-2 mt-1 sm:ml-16">
        {{ descricao }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  tituloFino: { type: String, required: true },  
  tituloGrosso: { type: String, required: true }, 
  descricao: { type: String, required: true },
  icone: { type: String, required: true }
})
</script>