<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in shadow-inner bg-gray-50/30 dark:bg-transparent tracking-tight">
    
    <!-- HEADER DO HUB -->
    <div class="relative overflow-hidden rounded-[2.8rem] shadow-sm bg-white dark:bg-[#1a1c23] p-8 md:p-12 border border-gray-100 dark:border-gray-800 transition-all duration-700 group">
      <!-- Elementos Decorativos de Vidro/Blur -->
      <div class="absolute -right-24 -top-24 w-96 h-96 rounded-full border-[40px] border-emerald-500/5 dark:border-emerald-500/10 blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
      <div class="absolute -right-12 top-24 w-48 h-48 rounded-full border-[24px] border-emerald-500/5 dark:border-emerald-500/10 blur-xl pointer-events-none group-hover:-translate-y-8 transition-all duration-1000"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 dark:from-emerald-500/20 dark:to-emerald-400/5 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 shadow-inner shrink-0 transform group-hover:rotate-12 transition-transform duration-700">
              <Icon :name="icon" class="w-10 h-10 text-emerald-500 dark:text-emerald-400 drop-shadow-sm" />
            </div>
            <div class="flex flex-col">
              <h2 class="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter transition-all duration-300">
                {{ title }}<span class="text-emerald-500 dark:text-emerald-400">.</span>
              </h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm md:text-lg font-medium opacity-70 mt-1 max-w-3xl leading-relaxed">
                {{ description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- GRID DE CARDS PORTAL -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <NuxtLink 
        v-for="(item, index) in items" 
        :key="index"
        :to="item.to" 
        class="group relative bg-white dark:bg-[#1e2029] rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.98]"
      >
        <!-- Shape Decorativo Superior -->
        <div class="absolute top-0 right-0 w-32 h-32 rounded-bl-[4rem] -mr-8 -mt-8 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>

        <div class="flex flex-col gap-7 relative z-10">
          <div class="w-16 h-16 rounded-[2rem] bg-gray-100 dark:bg-gray-700/30 flex items-center justify-center shrink-0 border border-transparent transition-all duration-500 group-hover:bg-emerald-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm group-hover:shadow-emerald-500/50">
            <Icon :name="item.icon" class="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          
          <div class="flex flex-col gap-2">
            <h3 class="text-2xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {{ item.label }}
            </h3>
            <p class="text-[14px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 opacity-80">
              {{ item.description || 'Acesso centralizado às ferramentas de gestão.' }}
            </p>
          </div>
        </div>

        <div class="mt-10 flex items-center text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 group-hover:text-emerald-500 transition-colors relative z-10">
          <span>Acessar</span>
          <div class="ml-auto w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-md">
            <Icon name="fa7-solid:arrow-right" class="w-4 h-4" />
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PortalItem {
  label: string
  to: string
  icon: string
  description?: string
}

defineProps<{
  title: string
  icon: string
  description: string
  items: PortalItem[]
}>()
</script>

<style scoped>
.animate-fade-in {
  animation: fadeInHub 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInHub {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
