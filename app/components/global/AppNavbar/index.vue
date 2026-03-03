<template>
  <header class="bg-white/90 dark:bg-[#1a1c23]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sticky top-0 z-50 transition-colors duration-300">
    
    <div class="flex items-center gap-4">
      <button @click="$emit('toggle-sidebar')" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
        <Icon name="fa7-solid:bars" class="w-5 h-5" />
      </button>
      <div class="hidden sm:flex items-center gap-2 select-none">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
          <Icon name="fa7-solid:building-columns" class="text-white w-4 h-4" />
        </div>
        <h1 class="font-bold text-xl tracking-tight text-gray-800 dark:text-white">
          Conta<span class="font-light text-emerald-600 dark:text-emerald-400">Vinculada</span>
        </h1>
      </div>
    </div>

    <div class="flex items-center">
      
      <div class="relative" @blur="menuOpen = false" tabindex="0">
        <button @click="menuOpen = !menuOpen" class="flex items-center gap-3 p-1 pr-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white font-bold shadow-inner">
            {{ userInitial }}
          </div>
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block max-w-[120px] truncate">
            {{ userName }}
          </span>
          <Icon name="fa7-solid:chevron-down" class="w-3 h-3 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': menuOpen }" />
        </button>

        <Transition name="dropdown">
          <div v-if="menuOpen" class="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-2 overflow-hidden" @mousedown.prevent>
            <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80 mb-1">
              <p class="text-xs text-gray-500 dark:text-gray-400">Logado como</p>
              <p class="text-sm font-bold text-gray-800 dark:text-white truncate">{{ userName }}</p>
            </div>
            <NuxtLink to="/configuracao/usuario" class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <Icon name="fa7-solid:gear" class="w-4 h-4 opacity-70" /> Configurações
            </NuxtLink>
            <div class="border-t border-gray-100 dark:border-gray-700/50 my-1"></div>
            <button @click="logout" class="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
              <Icon name="fa7-solid:arrow-right-from-bracket" class="w-4 h-4 opacity-70" /> Sair do Sistema
            </button>
          </div>
        </Transition>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCookie } from '#app'

const router = useRouter()
const userName = ref('Usuário')
const menuOpen = ref(false)

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

onMounted(() => {
  if (process.client) {
    try {
      const userRaw = localStorage.getItem('user')
      if (userRaw) {
        const user = JSON.parse(userRaw)
        let nome = user.nome || user.login || 'Usuário'
        userName.value = nome.charAt(0).toUpperCase() + nome.slice(1)
      }
    } catch {}
  }
})

const logout = () => {
  if (process.client) localStorage.removeItem('user')
  const tokenCookie = useCookie('token')
  tokenCookie.value = null
  router.push('/login')
}

defineEmits(['toggle-sidebar'])
</script>

<style scoped src="./style.css"></style>