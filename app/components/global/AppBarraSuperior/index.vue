<template>
  <header class="bg-white/90 dark:bg-[#1a1c23]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sticky top-0 z-50 transition-colors duration-300">
    
    <div class="flex items-center gap-4">
      <button 
        v-if="layout === 'barraLateral'"
        @click="$emit('toggle-sidebar')" 
        class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <Icon name="fa7-solid:bars" class="w-5 h-5" />
      </button>
      <div class="flex items-center gap-2 select-none mr-4">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
          <Icon name="fa7-solid:building-columns" class="text-white w-4 h-4" />
        </div>
        <h1 class="font-bold text-xl tracking-tight text-gray-800 dark:text-white">
          Conta<span class="font-light text-emerald-600 dark:text-emerald-400">Vinculada</span>
        </h1>
      </div>

      <!-- NAVEGAÇÃO HORIZONTAL (Barra Superior) -->
      <nav v-if="layout === 'barraSuperior'" class="hidden lg:flex items-center gap-1 ml-4">
        <template v-for="item in menuItems" :key="item.label">
          <NuxtLink 
            :to="item.to" 
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-300 whitespace-nowrap border border-transparent"
            active-class="!text-emerald-500 dark:!text-emerald-400 !font-extrabold"
          >
            <Icon :name="item.icon" class="w-4 h-4" />
            <span class="text-[11px] font-bold uppercase tracking-wide">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </nav>
    </div>

    <div class="flex items-center gap-3 md:gap-5">
      
      <Transition name="slide-fade">
        <div v-if="!eInicio && layout === 'barraLateral'" class="hidden md:flex items-center gap-4">
          <div class="flex items-center gap-3 bg-white dark:bg-[#1e2029] border border-gray-200 dark:border-gray-700/80 px-4 py-1.5 rounded-full shadow-sm">
            <Icon name="fa7-solid:clock" class="text-emerald-500 dark:text-emerald-400 w-4 h-4" />
            <div class="flex flex-col items-center justify-center leading-none mt-0.5">
              <span class="font-extrabold text-gray-800 dark:text-white text-[15px] tabular-nums tracking-wide leading-none mb-1">{{ horaAtual }}</span>
              <span class="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] font-bold leading-none">{{ dataAtual }}</span>
            </div>
          </div>
          <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </Transition>
      
      <div class="relative" ref="menuRef">
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
            <NuxtLink to="/configuracao" class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useCookie } from '#app'

const props = defineProps<{ 
  layout: 'barraLateral' | 'barraSuperior' 
}>()

const router = useRouter()
const route = useRoute()

const isInicio = computed(() => route.path === '/' || route.path === '/dashboard' || route.path === '/inicio')
const eInicio = isInicio

const userName = ref('Usuário')
const menuOpen = ref(false)
const menuRef = ref(null)

onClickOutside(menuRef, () => (menuOpen.value = false))

const menuItems = [
  { label: 'Início', to: '/inicio', icon: 'fa7-solid:house' },
  { 
    label: 'Gestão de Cadastros', 
    to: '/cadastro', 
    icon: 'fa7-solid:users', 
    children: [
      { label: 'Funcionários', to: '/cadastro/funcionario', icon: 'fa7-solid:user' },
      { label: 'Projetos', to: '/cadastro/projeto', icon: 'fa7-solid:briefcase' }
    ]
  },
  { 
    label: 'Rotinas de Folha', 
    to: '/operacao', 
    icon: 'fa7-solid:file-invoice-dollar', 
    children: [
      { label: 'Importação TXT', to: '/operacao/contracheque/importacao', icon: 'fa7-solid:file-arrow-up' },
      { label: 'Processamento', to: '/operacao/contracheque/processamento', icon: 'fa7-solid:gears' },
      { label: 'Histórico', to: '/operacao/contracheque/detalhes', icon: 'fa7-solid:clock-rotate-left' }
    ]
  },
  { 
    label: 'Financeiro', 
    to: '/operacao/financeiro', 
    icon: 'fa7-solid:hand-holding-dollar', 
    children: [
      { label: 'Lançamento Reembolso', to: '/operacao/oficio/lancamentoReembolso', icon: 'fa7-solid:money-bill-transfer' },
      { label: 'Lançamento Manual', to: '/operacao/movimentacaoBancaria/lancamentoManual', icon: 'fa7-solid:cash-register' },
      { label: 'Estornos', to: '/operacao/movimentacaoBancaria/lancamentoEstorno', icon: 'fa7-solid:rotate-left' }
    ]
  },
  { 
    label: 'Relatórios', 
    to: '/operacao/relatorio', 
    icon: 'fa7-solid:chart-pie', 
    children: [
      { label: 'Extrato Projeto', to: '/operacao/movimentacaoBancaria/extratoProjeto', icon: 'fa7-solid:list-check' },
      { label: 'Extrato Funcionário', to: '/operacao/movimentacaoBancaria/extratoFuncionario', icon: 'fa7-solid:list' }
    ]
  },
  { 
    label: 'Configurações', 
    to: '/configuracao', 
    icon: 'fa7-solid:screwdriver-wrench', 
    children: [
      { label: 'Central de Configurações', to: '/configuracao', icon: 'fa7-solid:gear' },
      { label: 'Tabelas Básicas', to: '/tabelaBasica', icon: 'fa7-solid:database' }
    ]
  }
]

const horaAtual = ref('')
const dataAtual = ref('')
let timer: ReturnType<typeof setInterval>

const updateTime = () => {
  const now = new Date()
  
  horaAtual.value = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  
  const diaSemana = now.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()
  const dia = String(now.getDate()).padStart(2, '0')
  const mes = now.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()
  
  dataAtual.value = `${diaSemana}, ${dia} DE ${mes}.`
}

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)

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

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const logout = () => {
  if (process.client) localStorage.removeItem('user')
  const tokenCookie = useCookie('token')
  tokenCookie.value = null
  router.push('/login')
}

defineEmits(['toggle-sidebar'])
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

</style>