<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in shadow-inner bg-gray-50/30 dark:bg-transparent tracking-tight">
    
    <!-- HEADER DO HUB -->
    <div class="relative overflow-hidden rounded-3xl shadow-sm bg-white dark:bg-[#1a1c23] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 transition-all duration-700 group">
      <!-- Elementos Decorativos de Vidro/Blur -->
      <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full border-[30px] border-emerald-500/5 dark:border-emerald-500/10 blur-sm pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
      <div class="absolute -right-10 top-20 w-32 h-32 rounded-full border-[15px] border-emerald-500/5 dark:border-emerald-500/10 blur-sm pointer-events-none group-hover:-translate-y-4 transition-all duration-1000"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 shadow-inner shrink-0 transform group-hover:rotate-6 transition-transform">
              <Icon :name="icon" class="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div class="flex flex-col">
              <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-all duration-300">
                {{ title }}<span class="text-emerald-500 dark:text-emerald-400">.</span>
              </h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium opacity-90 mt-1 leading-relaxed">
                {{ description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- GRID DE CARDS PORTAL (PADRÃO TABELA BÁSICA/CONFIG) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <NuxtLink 
        v-for="(item, index) in items" 
        :key="index"
        :to="item.to" 
        class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
        :class="item.borderHover || 'hover:border-emerald-500/40'"
      >
        <!-- Shape Decorativo no Canto -->
        <div class="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" :class="item.bgShape || 'bg-emerald-500/10'"></div>

        <div class="flex items-start justify-between relative z-10">
          <div class="flex-1 pr-4">
            <div v-if="item.tag" class="flex items-center gap-2 mb-2">
                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" :class="item.tagColor || 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300'">
                  {{ item.tag }}
                </span>
            </div>
            <h3 class="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-opacity-80 transition-colors">
              {{ item.label }}
            </h3>
            <p class="text-[12px] font-medium text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
              {{ item.description || 'Gerenciamento completo do módulo e integrações.' }}
            </p>
          </div>
          
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner transition-all group-hover:scale-110 group-hover:rotate-3" :class="item.bgLight || 'bg-emerald-50 dark:bg-emerald-900/20'">
            <Icon :name="item.icon" class="w-6 h-6" :class="item.iconColor || 'text-emerald-600 dark:text-emerald-400'" />
          </div>
        </div>

        <div class="mt-8 flex items-center text-[10px] font-bold uppercase tracking-[0.15em] transition-colors relative z-10" :class="item.iconColor || 'text-emerald-600 dark:text-emerald-400'">
          <span>{{ item.buttonLabel || buttonLabel || 'Acessar Módulo' }}</span>
          <Icon name="fa7-solid:arrow-right" class="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
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
  tag?: string
  tagColor?: string
  iconColor?: string
  bgLight?: string
  bgShape?: string
  borderHover?: string
  buttonLabel?: string
}

defineProps<{
  title: string
  icon: string
  description: string
  items: PortalItem[]
  buttonLabel?: string
}>()
</script>

<style scoped>
.animate-fade-in {
  animation: fadeInHub 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInHub {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
