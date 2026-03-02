<template>
  <header class="bg-white dark:bg-[#1a1c23] border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm shrink-0 transition-colors duration-300">
    <div class="flex items-center gap-4">
      <div class="hidden sm:flex items-center gap-2">
        <Icon name="fa7-solid:bars" class="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer mr-2 hover:text-gray-700 dark:hover:text-gray-200 transition" @click="$emit('toggle-sidebar')" />
        <h1 class="font-bold text-lg tracking-tight text-[#3276b1] dark:text-[#539ce0]">
          Conta<span class="font-light text-gray-500 dark:text-gray-400">Vinculada</span>
        </h1>
      </div>
    </div>

    <!-- Right Side Actions -->
    <div class="flex items-center gap-4">
      <!-- Relógio em tempo real com data e hora -->
      <div class="hidden md:flex flex-col items-end text-xs leading-tight text-gray-500 dark:text-gray-400 px-4 border-r border-gray-200 dark:border-gray-700">
        <span class="font-semibold text-gray-700 dark:text-gray-200 text-sm tabular-nums">{{ horaAtual }}</span>
        <span class="text-[11px]">{{ dataAtual }}</span>
      </div>

      <div class="relative" @click="menuOpen = !menuOpen" @blur="menuOpen = false" tabindex="0">
        <button class="flex items-center gap-2 p-1.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition border border-transparent cursor-pointer">
          <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
            <Icon name="fa7-solid:user" class="w-4 h-4" />
          </div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block max-w-[120px] truncate">{{ userName }}</span>
          <Icon name="fa7-solid:chevron-down" class="w-3 h-3 text-gray-400 dark:text-gray-500" />
        </button>

        <!-- Dropdown Menu -->
        <div v-show="menuOpen" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 py-1" @mousedown.prevent>
          <NuxtLink to="/configuracao/usuario" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <Icon name="fa7-solid:gear" class="w-4 h-4 text-gray-400 dark:text-gray-500" /> Configurações
          </NuxtLink>
          <div class="border-t border-gray-100 dark:border-gray-700 my-1"></div>
          <button @click="logout" class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700/50 transition w-full text-left">
            <Icon name="fa7-solid:arrow-right-from-bracket" class="w-4 h-4 text-red-400 dark:text-red-500" /> Sair
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const horaAtual = ref('')
const dataAtual = ref('')
const userName = ref('Usuário')
const menuOpen = ref(false)
let timer: ReturnType<typeof setInterval>

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const updateTime = () => {
  const now = new Date()
  horaAtual.value = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  dataAtual.value = `${semana[now.getDay()]}, ${now.getDate()} ${meses[now.getMonth()]} ${now.getFullYear()}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)

  if (process.client) {
    try {
      const userRaw = localStorage.getItem('user')
      if (userRaw) {
        const user = JSON.parse(userRaw)
        userName.value = user.nome || user.login || 'Usuário'
      }
    } catch {}
  }
})

onUnmounted(() => { clearInterval(timer) })

const logout = () => {
  if (process.client) {
    localStorage.removeItem('user')
  }
  
  const tokenCookie = useCookie('token')
  tokenCookie.value = null
  
  router.push('/login')
}

defineEmits(['toggle-sidebar'])
</script>
