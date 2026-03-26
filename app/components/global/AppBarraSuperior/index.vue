<template>
  <header class="bg-white dark:bg-[#1a1c23] border-b border-gray-100 dark:border-gray-800/50 h-16 flex items-center px-8 gap-8 sticky top-0 z-50 transition-colors duration-300">
    
    <!-- CONTEÚDO PARA BARRA SUPERIOR -->
    <template v-if="layout === 'barraSuperior'">
      <!-- LOGO -->
      <div class="flex items-center gap-3 select-none flex-shrink-0">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20 active:scale-95 transition-transform">
          <Icon name="fa7-solid:building-columns" class="text-white w-4 h-4" />
        </div>
        <h1 class="font-bold text-[18px] tracking-tight text-gray-800 dark:text-white leading-none">
          Conta<span class="font-extralight text-emerald-600 dark:text-emerald-400">Vinculada</span>
        </h1>
      </div>

      <!-- NAVEGAÇÃO HORIZONTAL (Com Indicador de Scroll) -->
      <div class="relative flex-1 flex items-center justify-center min-w-0 group">
        <nav 
          ref="scrollContainer"
          @scroll="checkScroll"
          @wheel.prevent="handleWheel"
          class="flex items-center gap-2.5 overflow-x-auto custom-scrollbar py-2 mt-1"
        >
          <template v-for="item in menuItems" :key="item.label">
            <NuxtLink 
              :to="item.to" 
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 whitespace-nowrap border border-transparent flex-shrink-0"
              :class="{ 
                '!text-emerald-600 dark:!text-emerald-400 !font-bold bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 shadow-sm': isRouteActive(item.to, true) || item.children?.some(c => isRouteActive(c.to)) 
              }"
            >
              <Icon :name="item.icon" class="w-[17px] h-[17px]" />
              <span class="text-[10px] font-bold uppercase tracking-[0.15em] leading-none translate-y-[2px]">{{ item.label }}</span>
            </NuxtLink>
          </template>
        </nav>

        <!-- Indicador de "Mais Itens" (Seta + Fade) -->
        <Transition name="fade-left">
          <div v-if="canScrollLeft" class="absolute -left-5 inset-y-0 w-20 flex items-center justify-start pl-2 bg-gradient-to-r from-white dark:from-[#1a1c23] via-white/80 dark:via-[#1a1c23]/80 to-transparent pointer-events-none z-10">
            <div class="w-6 h-6 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center animate-pulse">
              <Icon name="fa7-solid:chevron-left" class="text-emerald-600 dark:text-emerald-400 w-3 h-3" />
            </div>
          </div>
        </Transition>

        <Transition name="fade-right">
          <div v-if="canScrollRight" class="absolute -right-5 inset-y-0 w-20 flex items-center justify-end pr-2 bg-gradient-to-l from-white dark:from-[#1a1c23] via-white/80 dark:via-[#1a1c23]/80 to-transparent pointer-events-none z-10">
            <div class="w-6 h-6 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center animate-pulse">
              <Icon name="fa7-solid:chevron-right" class="text-emerald-600 dark:text-emerald-400 w-3 h-3" />
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <!-- CONTEÚDO PARA BARRA LATERAL -->
    <template v-if="layout === 'barraLateral'">
      <div class="flex items-center gap-4 flex-shrink-0">
        <button @click="$emit('toggle-sidebar')" class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 -ml-4">
          <Icon name="fa7-solid:bars" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <!-- LOGO NO MODO LATERAL -->
        <div class="flex items-center gap-3 select-none flex-shrink-0 ml-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20 active:scale-95 transition-transform">
            <Icon name="fa7-solid:building-columns" class="text-white w-4 h-4" />
          </div>
          <h1 class="font-bold text-[18px] tracking-tight text-gray-800 dark:text-white leading-none">
            Conta<span class="font-extralight text-emerald-600 dark:text-emerald-400">Vinculada</span>
          </h1>
        </div>
      </div>

      <div class="flex-1"></div>
    </template>

    <!-- ÁREA DA DIREITA (TEMPO + PERFIL) -->
    <div class="ml-auto flex items-center gap-4">
      <!-- PILL DE TEMPO (Aparece apenas no modo lateral, fora do início) -->
      <Transition
        enter-active-class="transition-all duration-700 ease-in-out"
        enter-from-class="translate-x-10 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition-all duration-700 ease-in-out"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-10 opacity-0"
      >
        <div v-if="layout === 'barraLateral' && !isInicio" class="flex items-center gap-3">
          <div class="flex items-center gap-3 p-1 pr-4 rounded-full bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:border-emerald-500/30 transition-colors group cursor-default h-10">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
              <Icon name="fa7-solid:clock" class="w-4 h-4 text-white" />
            </div>
            <div class="flex flex-col items-center min-w-[80px]">
              <span class="text-[13px] font-black text-gray-800 dark:text-white tracking-widest text-center leading-none">{{ horaAtual }}</span>
              <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] text-center leading-none translate-y-[1.5px]">{{ dataAtual }}</span>
            </div>
          </div>
          
          <!-- DIVISOR -->
          <div class="w-px h-8 bg-gray-200 dark:bg-gray-800/60 mx-1"></div>
        </div>
      </Transition>

      <!-- PERFIL DO USUÁRIO -->
      <div class="relative" ref="menuRef">
        <button @click="menuOpen = !menuOpen" class="flex items-center gap-3 p-1 pr-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 h-10">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white font-bold shadow-inner">
          {{ userInitial }}
        </div>
        <span class="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block max-w-[120px] truncate">
          {{ userName }}
        </span>
        <Icon name="fa7-solid:chevron-down" class="w-3 h-3 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': menuOpen }" />
      </button>

      <Transition name="dropdown">
        <div v-if="menuOpen" class="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-60 py-2 overflow-hidden" @mousedown.prevent>
          <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80 mb-1">
            <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 translate-y-[1.5px]">Logado como</p>
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
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useCookie } from '#app'

const props = defineProps<{ 
  layout: 'barraLateral' | 'barraSuperior' 
}>()

const router = useRouter()
const route = useRoute()

const isInicio = computed(() => route.path === '/' || route.path === '/dashboard')
const eInicio = isInicio

const userName = ref('Usuário')
const menuOpen = ref(false)
const menuRef = ref(null)

// Lógica de Scroll e Indicadores
const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const handleWheel = (e: WheelEvent) => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollLeft += e.deltaY
  checkScroll()
}

const checkScroll = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  
  // Ativa indicadores com margem de segurança
  canScrollLeft.value = scrollLeft > 10
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10
}

onClickOutside(menuRef, () => (menuOpen.value = false))

const menuItems = [
  { label: 'Início', to: '/', icon: 'fa7-solid:house' },
  { 
    label: 'Gestão de Cadastros', 
    to: '/cadastro',
    icon: 'fa7-solid:address-card',
    children: [
      { label: 'Funcionários', to: '/cadastro/funcionario', icon: 'fa7-solid:users', tags: ['cadastro', 'funcionario', 'colaborador'] },
      { label: 'Projetos', to: '/cadastro/projeto', icon: 'fa7-solid:briefcase', tags: ['cadastro', 'projeto', 'obra'] },
    ]
  },
  { 
    label: 'Rotinas de Folha', 
    to: '/operacao',
    icon: 'fa7-solid:file-invoice-dollar',
    children: [
      { label: 'Importação TXT', to: '/operacao/contracheque/importacao', icon: 'fa7-solid:file-arrow-up', tags: ['folha', 'importacao', 'txt', 'contracheque'] },
      { label: 'Processamento', to: '/operacao/contracheque/processamento', icon: 'fa7-solid:gears', tags: ['folha', 'processamento', 'contracheque'] },
      { label: 'Histórico', to: '/operacao/contracheque/detalhes', icon: 'fa7-solid:clock-rotate-left', tags: ['folha', 'historico', 'detalhes', 'contracheque'] },
    ]
  },
  { 
    label: 'Financeiro & Reembolso', 
    to: '/operacao/financeiro',
    icon: 'fa7-solid:hand-holding-dollar',
    children: [
      { label: 'Lançamento Reembolso', to: '/operacao/oficio/lancamentoReembolso', icon: 'fa7-solid:hand-holding-dollar', tags: ['financeiro', 'reembolso', 'oficio'] },
      { label: 'Lançamento Manual', to: '/operacao/movimentacaoBancaria/lancamentoManual', icon: 'fa7-solid:cash-register', tags: ['financeiro', 'bancario', 'manual'] },
      { label: 'Estornos', to: '/operacao/movimentacaoBancaria/lancamentoEstorno', icon: 'fa7-solid:rotate-left', tags: ['financeiro', 'bancario', 'estorno'] },
    ]
  },
  { 
    label: 'Relatórios & Extratos',
    to: '/operacao/relatorio',
    icon: 'fa7-solid:list-check',
    children: [
      { label: 'Extrato Projeto', to: '/operacao/movimentacaoBancaria/extratoProjeto', icon: 'fa7-solid:list-check', tags: ['relatorio', 'extrato', 'projeto'] },
      { label: 'Extrato Funcionário', to: '/operacao/movimentacaoBancaria/extratoFuncionario', icon: 'fa7-solid:list', tags: ['relatorio', 'extrato', 'funcionario'] },
    ]
  },
  { 
    label: 'Configurações', 
    to: '/configuracao',
    icon: 'fa7-solid:screwdriver-wrench',
    children: [
      { label: 'Sistema', to: '/configuracao', icon: 'fa7-solid:screwdriver-wrench', tags: ['configuracao', 'ajustes'] },
      { label: 'Tabelas Básicas', to: '/tabelaBasica', icon: 'fa7-solid:database', tags: ['configuracao', 'tabela', 'basica'] },
    ]
  },
]

// Lógica de Ativação Inteligente
const isRouteActive = (to: string, exact = false) => {
  if (!to) return false
  if (exact) return route.path === to
  return route.path === to || route.path.startsWith(to + '/')
}

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

  // Inicializar Scroll
  nextTick(() => {
    checkScroll()
  })
  window.addEventListener('resize', checkScroll)

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
  window.removeEventListener('resize', checkScroll)
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
.custom-scrollbar::-webkit-scrollbar {
  height: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #10b981; /* emerald-500 */
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #059669; /* emerald-600 */
}
.custom-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: thin;
  scrollbar-color: #10b981 transparent;
}

.fade-left-enter-active,
.fade-left-leave-active,
.fade-right-enter-active,
.fade-right-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-left-enter-from,
.fade-left-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-right-enter-from,
.fade-right-leave-to {
  opacity: 0;
  transform: translateX(10px);
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