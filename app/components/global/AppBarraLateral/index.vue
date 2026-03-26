<template>
  <aside 
    :class="[
      'bg-white dark:bg-[#1a1c23] border-gray-200/50 dark:border-gray-800/50 flex flex-col transition-all duration-300 h-full overflow-hidden absolute lg:relative z-50', 
      collapsed ? 'w-0 lg:w-20 border-0 lg:border-r' : 'w-64 border-r shadow-2xl lg:shadow-sm'
    ]"
  >
    <nav class="flex-1 overflow-y-auto py-3 space-y-1 overflow-x-hidden scrollbar-hide w-64">
      
      <!-- BUSCA RÁPIDA -->
      <div v-if="!collapsed" class="px-3 mb-4 relative group/search">
        <div 
          class="relative transition-colors duration-200 rounded-xl border"
          :class="[
            isSearchFocused 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30' 
              : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/50'
          ]"
        >
          <Icon name="fa7-solid:magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10" :class="isSearchFocused ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'" />
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text" 
            placeholder="Pesquisar Menu..." 
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
            class="w-full bg-transparent border-0 rounded-xl pl-11 pr-10 py-3 text-sm outline-none transition-all placeholder:text-gray-400/70"
            :class="isSearchFocused ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400 font-medium'"
          />
          <button v-if="searchQuery" @mousedown.prevent="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10">
            <Icon name="fa7-solid:circle-xmark" class="w-4 h-4" :class="isSearchFocused ? 'text-emerald-500 hover:text-emerald-600' : 'text-gray-300 hover:text-gray-400'" />
          </button>
        </div>

        <!-- Resultados da Busca -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-1 opacity-0"
        >
          <div v-if="searchQuery && filteredItems.length > 0" class="absolute left-3 right-3 mt-2 bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-[60] py-2 max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-hide backdrop-blur-xl">
             <div v-for="item in filteredItems" :key="item.to" @mousedown.prevent="navigateTo(item)" class="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer transition-all border-b border-gray-50/50 dark:border-gray-800/30 last:border-0 group/item">
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                  :class="[
                    item.isHeader 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 shadow-sm' 
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 group-hover/item:bg-emerald-100 dark:group-hover/item:bg-emerald-500/20 group-hover/item:border-emerald-200 dark:group-hover/item:border-emerald-500/30'
                  ]"
                >
                  <Icon :name="item.icon" class="w-4 h-4 text-gray-400 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors" :class="{ 'text-emerald-600 dark:text-emerald-400': item.isHeader }" />
                </div>
                <div class="flex flex-col flex-1 truncate">
                  <span class="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400 transition-colors">{{ item.label }}</span>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span v-if="item.isHeader" class="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">Central</span>
                    <span class="text-[9px] text-gray-400 dark:text-gray-500 font-medium">{{ item.isHeader ? 'Ver todas as opções' : 'Ir para tela' }}</span>
                  </div>
                </div>
             </div>
          </div>
          <div v-else-if="searchQuery" class="absolute left-3 right-3 mt-2 bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-[60] p-6 text-center">
             <Icon name="fa7-solid:magnifying-glass" class="w-8 h-8 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
             <p class="text-xs font-bold text-gray-400 dark:text-gray-500 italic">Nenhum resultado para "{{ searchQuery }}"</p>
          </div>
        </Transition>
      </div>

      <!-- Divisor Sutil -->
      <div v-if="!collapsed" class="mx-6 h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-800 to-transparent mb-4 opacity-50"></div>

      <template v-for="item in menuItems" :key="item.label">
        <div class="relative">
          <!-- Item com Children -->
          <template v-if="item.children">
            <button 
              @click="handleItemClick(item)"
              @mouseenter="collapsed && (activePopover = item.label)"
              @mouseleave="collapsed && (activePopover = null)"
              class="menu-link mx-3 w-[calc(100%-1.5rem)] group relative"
              :class="{ 'menu-active': isRouteActive(item.to, true) || item.children.some(c => isRouteActive(c.to)) }"
            >
              <Icon :name="item.icon" class="menu-icon shrink-0" />
              <span v-if="!collapsed" class="ml-3 text-[10px] font-bold uppercase tracking-[0.15em] truncate text-left flex-1">{{ item.label }}</span>
              <Icon 
                v-if="!collapsed" 
                name="fa7-solid:chevron-right" 
                class="ml-2 w-3 h-3 transition-transform duration-200 shrink-0 opacity-50"
                :class="{ 'rotate-90': isSubmenuExpanded(item) }"
              />

              <!-- Popover para estado Colapsado -->
              <div 
                v-if="collapsed && activePopover === item.label"
                class="absolute left-full top-0 ml-4 w-56 bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[70] py-3 animate-in fade-in duration-200 overflow-hidden text-left"
              >
                <div class="px-5 pb-2 mb-2 border-b border-gray-50 dark:border-gray-800/50">
                  <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{{ item.label }}</span>
                </div>
                <NuxtLink 
                  v-for="child in item.children" 
                  :key="child.to" 
                  :to="child.to"
                  @click="collapsed && emit('update:collapsed', false)"
                  class="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                >
                  <Icon :name="child.icon" class="w-3.5 h-3.5" />
                  {{ child.label }}
                </NuxtLink>
              </div>
            </button>

            <!-- Submenu Expansível -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="max-h-0 opacity-0 overflow-hidden"
              enter-to-class="max-h-[500px] opacity-100 overflow-hidden"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="max-h-[500px] opacity-100 overflow-hidden"
              leave-to-class="max-h-0 opacity-0 overflow-hidden"
            >
              <div v-if="!collapsed && isSubmenuExpanded(item)" class="menu-sub-items">
                <NuxtLink 
                  v-for="child in item.children" 
                  :key="child.to" 
                  :to="child.to"
                  class="menu-sub-link group"
                  active-class="menu-sub-active"
                >
                  <span class="menu-text truncate flex-1">{{ child.label }}</span>
                  <Icon 
                    :name="favorites[child.to] ? 'fa7-solid:star' : 'fa7-regular:star'" 
                    class="menu-sub-fav-icon" 
                    :class="{ 'menu-sub-fav-active': favorites[child.to] }"
                    @click="toggleFavorite(child.to, $event)"
                  />
                </NuxtLink>
              </div>
            </Transition>
          </template>

          <!-- Item Simples -->
          <NuxtLink 
            v-else
            :to="item.to" 
            class="menu-link group" 
            :class="{ 'menu-active': isRouteActive(item.to) && !isSearchFocused }" 
            :title="collapsed ? item.label : ''"
            @click="collapsed && emit('update:collapsed', false)"
          >
            <Icon :name="item.icon" class="menu-icon" />
            <span v-if="!collapsed" class="ml-3 text-[10px] font-bold uppercase tracking-[0.15em] flex-1 truncate text-left">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const { toggleTheme, theme } = useTheme()
const router = useRouter()
const route = useRoute()

const props = defineProps<{ collapsed: boolean }>()
const emit = defineEmits(['update:collapsed'])
const favorites = reactive<Record<string, boolean>>({});
function toggleFavorite(id: string, event: Event) {
  event.preventDefault(); // Evita navegar ao clicar na estrela
  event.stopPropagation(); // Evita abrir/fechar o menu ao clicar
  favorites[id] = !favorites[id];
}

// Gerencia cliques nos itens (especialmente para modo colapsado)
const handleItemClick = (item: any) => {
  if (props.collapsed) {
    // Se estiver fechado, expande e navega para a central do item
    emit('update:collapsed', false)
    if (item.to) router.push(item.to)
    activePopover.value = null
  } else if (item.children) {
    // Se estiver aberto, apenas expande/recolhe o submenu interno
    toggleSubmenu(item.label)
  }
}

const isSearchFocused = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const manuallyOpenedSubmenus = ref<string[]>([])
const manuallyClosedSubmenus = ref<string[]>([])
const activePopover = ref<string | null>(null)

const toggleSubmenu = (label: string) => {
  // Encontra o item para verificar estado atual
  const item = menuItems.find(i => i.label === label)
  if (!item) return

  const isOpen = isSubmenuExpanded(item)
  
  if (isOpen) {
    // Se estava aberto, forçamos o fechamento
    if (manuallyOpenedSubmenus.value.includes(label)) {
      manuallyOpenedSubmenus.value = manuallyOpenedSubmenus.value.filter(l => l !== label)
    } else {
      manuallyClosedSubmenus.value.push(label)
    }
  } else {
    // Se estava fechado, forçamos a abertura
    if (manuallyClosedSubmenus.value.includes(label)) {
      manuallyClosedSubmenus.value = manuallyClosedSubmenus.value.filter(l => l !== label)
    } else {
      manuallyOpenedSubmenus.value.push(label)
    }
  }
}

// Verifica se uma rota é ativa ou subclasse da rota do item
const isRouteActive = (to: string, exact = false) => {
  if (!to) return false
  if (exact) return route.path === to
  
  // Evita que "Configurações" fique ativo quando estamos em "Acessibilidade"
  if (to === '/configuracao' && route.path.startsWith('/configuracao/interface')) {
    return false
  }

  return route.path === to || route.path.startsWith(to + '/')
}

// Verifica se um submenu deve estar aberto (seja manualmente ou pela rota ativa)
const isSubmenuExpanded = (item: any) => {
  // Prioridade 1: Fechamento manual forçado pelo usuário
  if (manuallyClosedSubmenus.value.includes(item.label)) return false
  
  // Prioridade 2: Abertura manual forçada pelo usuário
  if (manuallyOpenedSubmenus.value.includes(item.label)) return true
  
  // Prioridade 3: Abertura automática pela rota
  // Uma categoria abre se a rota for EXATAMENTE a sua central OU se um filho estiver ativo
  const active = isRouteActive(item.to, true) || item.children?.some((c: any) => isRouteActive(c.to))
  return active
}

// Resetar estados forçados ao trocar substantivamente de módulo (opcional, mas recomendado)
// Para o momento, vamos manter como solicitado: controle total do usuário.
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
  { 
    label: 'Acessibilidade', 
    to: '/configuracao/interface',
    icon: 'fa7-solid:universal-access'
  },
]

const allMenuItems = computed(() => {
  const flattened: any[] = []
  menuItems.forEach(item => {
    // Adiciona o pai na busca se ele tiver filhos ou uma rota própria (Central)
    if (item.children && item.children.length > 0) {
      flattened.push({
        label: item.label,
        icon: item.icon,
        to: item.to || item.children[0]?.to || '', // Prioriza rota da Central, senão primeiro filho
        isHeader: true,
        tags: [item.label.toLowerCase(), 'central', 'inicio', 'visão geral']
      })
      flattened.push(...item.children)
    } else if (item.to) {
      flattened.push(item)
    }
  })
  return flattened
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return allMenuItems.value.filter(item => 
    item.label.toLowerCase().includes(query) || 
    item.tags?.some((tag: string) => tag.toLowerCase().includes(query))
  )
})

const navigateTo = (item: any) => {
  searchInput.value?.blur()
  isSearchFocused.value = false
  
  // Limpa estados manuais para que a barra lateral siga apenas a nova rota ativa
  manuallyOpenedSubmenus.value = []
  manuallyClosedSubmenus.value = []

  router.push(item.to)
  searchQuery.value = ''
}
</script>

<style scoped>
.menu-link {
  @apply flex items-center mx-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 transition-all duration-300 border border-transparent select-none cursor-pointer;
}

.menu-link:hover {
  @apply bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-sm;
}

.menu-active {
  @apply bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm border border-emerald-500/20;
}

.menu-icon {
  @apply w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300;
}

.menu-active .menu-icon {
  @apply opacity-100 scale-105 text-emerald-600 dark:text-emerald-400;
}

/* Sub-items Styles (Tree View) */
.menu-sub-items {
  @apply relative ml-6 my-1 mb-2 overflow-hidden;
}

.menu-sub-link {
  @apply relative flex items-center mr-3 pl-4 pr-3 py-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200;
}

/* Linha Vertical */
.menu-sub-link::before {
  content: "";
  @apply absolute left-0 top-0 w-[2px] h-full bg-emerald-500/20;
}

.menu-sub-link:last-child::before {
  @apply h-1/2;
}

/* Linha Horizontal */
.menu-sub-link::after {
  content: "";
  @apply absolute left-0 top-1/2 w-3 h-[2px] bg-emerald-500/20;
}

.menu-sub-active {
  @apply text-emerald-600 dark:text-emerald-400 font-bold;
}

.menu-sub-fav-icon {
  @apply ml-auto w-3.5 h-3.5 opacity-60 text-gray-400 dark:text-gray-500 hover:!opacity-100 hover:text-yellow-500 transition-all duration-200 cursor-pointer z-10;
}

.menu-sub-fav-active {
  @apply opacity-100 text-yellow-500 dark:text-yellow-400 !important;
}

.menu-text {
  @apply ml-3 text-sm tracking-wide transition-colors duration-300;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>