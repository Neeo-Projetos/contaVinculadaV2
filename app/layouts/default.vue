<template>
  <div class="h-screen w-full bg-slate-50 dark:bg-[#0f172a] flex flex-col font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300 overflow-hidden relative">
    
    <!-- Cortina de Carregamento Global (Cobre tudo) -->
    <AppCarregamentoPagina :carregando="isCurtainGlobal" mensagem="Sincronizando ambiente corporativo..." />
    
    <AppBarraSuperior 
      :layout="settings.layout" 
      @toggle-sidebar="collapsed = !collapsed" 
    />

    <div class="flex flex-1 overflow-hidden relative">
      <AppBarraLateral 
        v-if="settings.layout === 'barraLateral'"
        v-model:collapsed="collapsed" 
        class="z-20" 
      />

      <main class="flex-1 overflow-y-auto overflow-x-hidden transition-colors duration-300 scrollbar-hide">
        <NuxtPage />
      </main>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const collapsed = ref(false)
const { settings } = useInterfaceSettings()
const { isCurtainGlobal } = useStatusLogin()

onMounted(() => {
  if (window.innerWidth < 1024) {
    collapsed.value = true
  }
})
</script>

<style>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>