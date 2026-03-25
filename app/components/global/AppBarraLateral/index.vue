<template>
  <aside 
    :class="[
      'bg-white dark:bg-[#1a1c23] border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 h-full overflow-hidden absolute lg:relative z-50', 
      collapsed ? 'w-0 lg:w-20 border-0 lg:border-r' : 'w-64 border-r shadow-2xl lg:shadow-sm'
    ]"
  >
    <nav class="flex-1 overflow-y-auto py-6 space-y-1 overflow-x-hidden scrollbar-hide w-64">
      
      <!-- BUSCA RÁPIDA -->
      <div v-if="!collapsed" class="px-3 mb-6 relative group/search">
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
             <div v-for="item in filteredItems" :key="item.to" @mousedown.prevent="navigateTo(item.to)" class="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer transition-all border-b border-gray-50/50 dark:border-gray-800/30 last:border-0 group/item">
                <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center border border-gray-100 dark:border-gray-700/50 group-hover/item:bg-emerald-100 dark:group-hover/item:bg-emerald-500/20 group-hover/item:border-emerald-200 dark:group-hover/item:border-emerald-500/30 transition-all">
                  <Icon :name="item.icon" class="w-4 h-4 text-gray-400 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors" />
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] font-bold text-gray-700 dark:text-gray-200 group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400 transition-colors">{{ item.label }}</span>
                  <span class="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Ir para tela</span>
                </div>
             </div>
          </div>
          <div v-else-if="searchQuery" class="absolute left-3 right-3 mt-2 bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-[60] p-6 text-center">
             <Icon name="fa7-solid:magnifying-glass" class="w-8 h-8 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
             <p class="text-xs font-bold text-gray-400 dark:text-gray-500 italic">Nenhum resultado para "{{ searchQuery }}"</p>
          </div>
        </Transition>
      </div>

      <NuxtLink to="/inicio" class="menu-link group" :class="{ 'menu-active': $route.path === '/inicio' && !isSearchFocused }" :title="collapsed ? 'Início' : ''">
        <Icon name="fa7-solid:house" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Início</span>
      </NuxtLink>

      <!-- GESTÃO DE CADASTROS -->
      <div v-if="!collapsed" class="menu-header">Gestão de Cadastros</div>
      <div v-else class="menu-divider"></div>
      
      <NuxtLink to="/cadastro/funcionario" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/cadastro/funcionario') && !isSearchFocused }" :title="collapsed ? 'Funcionários' : ''">
        <Icon name="fa7-solid:users" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Funcionários</span>
      </NuxtLink>

      <NuxtLink to="/cadastro/projeto" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/cadastro/projeto') && !isSearchFocused }" :title="collapsed ? 'Projetos' : ''">
        <Icon name="fa7-solid:briefcase" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Projetos</span>
      </NuxtLink>

      <!-- ROTINAS DE FOLHA -->
      <div v-if="!collapsed" class="menu-header mt-2">Rotinas de Folha</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/operacao/contracheque/importacao" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/operacao/contracheque/importacao') && !isSearchFocused }" :title="collapsed ? 'Importação TXT' : ''">
        <Icon name="fa7-solid:file-arrow-up" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Importação TXT</span>
      </NuxtLink>

      <NuxtLink to="/operacao/contracheque/processamento" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/operacao/contracheque/processamento') && !isSearchFocused }" :title="collapsed ? 'Processamento' : ''">
        <Icon name="fa7-solid:gears" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Processamento</span>
      </NuxtLink>

      <NuxtLink to="/operacao/contracheque/detalhes" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/operacao/contracheque/detalhes') && !isSearchFocused }" :title="collapsed ? 'Histórico' : ''">
        <Icon name="fa7-solid:clock-rotate-left" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Histórico</span>
      </NuxtLink>

      <!-- FINANCEIRO & REEMBOLSO -->
      <div v-if="!collapsed" class="menu-header mt-2">Financeiro & Reembolso</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/operacao/oficio/lancamentoReembolso" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/operacao/oficio/lancamentoReembolso') && !isSearchFocused }" :title="collapsed ? 'Lançamento Reembolso' : ''">
        <Icon name="fa7-solid:hand-holding-dollar" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Lançamento Reembolso</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/lancamentoManual" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/operacao/movimentacaoBancaria/lancamentoManual') && !isSearchFocused }" :title="collapsed ? 'Lançamento Manual' : ''">
        <Icon name="fa7-solid:cash-register" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Lançamento Manual</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/lancamentoEstorno" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/operacao/movimentacaoBancaria/lancamentoEstorno') && !isSearchFocused }" :title="collapsed ? 'Estornos' : ''">
        <Icon name="fa7-solid:rotate-left" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Estornos</span>
      </NuxtLink>

      <!-- RELATÓRIOS & EXTRATOS -->
      <div v-if="!collapsed" class="menu-header mt-2">Relatórios & Extratos</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/operacao/movimentacaoBancaria/extratoProjeto" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/operacao/movimentacaoBancaria/extratoProjeto') && !isSearchFocused }" :title="collapsed ? 'Extrato Projeto' : ''">
        <Icon name="fa7-solid:list-check" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Extrato Projeto</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/extratoFuncionario" class="menu-link group" :class="{ 'menu-active': $route.path.startsWith('/operacao/movimentacaoBancaria/extratoFuncionario') && !isSearchFocused }" :title="collapsed ? 'Extrato Funcionário' : ''">
        <Icon name="fa7-solid:list" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Extrato Funcionário</span>
      </NuxtLink>

      <!-- CONFIGURAÇÕES -->
      <div v-if="!collapsed" class="menu-header mt-2">Configurações</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/configuracao" 
        class="menu-link group" 
        :class="{ 'menu-active': ($route.path.startsWith('/configuracao') || $route.path.startsWith('/seguranca')) && !isSearchFocused }" 
        :title="collapsed ? 'Central de Configurações' : ''">
        <Icon name="fa7-solid:screwdriver-wrench" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Central de Configurações</span>
      </NuxtLink>

      <NuxtLink to="/tabelaBasica" 
        class="menu-link group" 
        :class="{ 'menu-active': $route.path.startsWith('/tabelaBasica') && !isSearchFocused }" 
        :title="collapsed ? 'Tabelas Básicas' : ''">
        <Icon name="fa7-solid:database" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Tabelas Básicas</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const { toggleTheme, theme } = useTheme()
const router = useRouter()

defineProps<{ collapsed: boolean }>()

const isSearchFocused = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const menuItems = [
  { label: 'Início', to: '/inicio', icon: 'fa7-solid:house' },
  { label: 'Funcionários', to: '/cadastro/funcionario', icon: 'fa7-solid:users', tags: ['cadastro', 'funcionario', 'colaborador'] },
  { label: 'Projetos', to: '/cadastro/projeto', icon: 'fa7-solid:briefcase', tags: ['cadastro', 'projeto', 'obra'] },
  { label: 'Importação TXT', to: '/operacao/contracheque/importacao', icon: 'fa7-solid:file-arrow-up', tags: ['folha', 'importacao', 'txt', 'contracheque'] },
  { label: 'Processamento', to: '/operacao/contracheque/processamento', icon: 'fa7-solid:gears', tags: ['folha', 'processamento', 'contracheque'] },
  { label: 'Histórico', to: '/operacao/contracheque/detalhes', icon: 'fa7-solid:clock-rotate-left', tags: ['folha', 'historico', 'detalhes', 'contracheque'] },
  { label: 'Lançamento Reembolso', to: '/operacao/oficio/lancamentoReembolso', icon: 'fa7-solid:hand-holding-dollar', tags: ['financeiro', 'reembolso', 'oficio'] },
  { label: 'Lançamento Manual', to: '/operacao/movimentacaoBancaria/lancamentoManual', icon: 'fa7-solid:cash-register', tags: ['financeiro', 'bancario', 'manual'] },
  { label: 'Estornos', to: '/operacao/movimentacaoBancaria/lancamentoEstorno', icon: 'fa7-solid:rotate-left', tags: ['financeiro', 'bancario', 'estorno'] },
  { label: 'Extrato Projeto', to: '/operacao/movimentacaoBancaria/extratoProjeto', icon: 'fa7-solid:list-check', tags: ['relatorio', 'extrato', 'projeto'] },
  { label: 'Extrato Funcionário', to: '/operacao/movimentacaoBancaria/extratoFuncionario', icon: 'fa7-solid:list', tags: ['relatorio', 'extrato', 'funcionario'] },
  { label: 'Central de Configurações', to: '/configuracao', icon: 'fa7-solid:screwdriver-wrench', tags: ['configuracao', 'ajustes'] },
  { label: 'Tabelas Básicas', to: '/tabelaBasica', icon: 'fa7-solid:database', tags: ['configuracao', 'tabela', 'basica'] },
]

const filteredItems = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return menuItems.filter(item => 
    item.label.toLowerCase().includes(query) || 
    item.tags?.some(tag => tag.toLowerCase().includes(query))
  )
})

const navigateTo = (to: string) => {
  searchInput.value?.blur()
  isSearchFocused.value = false
  router.push(to)
  searchQuery.value = ''
}
</script>

<style scoped>
.menu-link {
  @apply flex items-center mx-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 transition-all duration-200 border border-transparent;
}

.menu-link:hover {
  @apply bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400;
}

.menu-active {
  @apply bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm border border-emerald-200 dark:border-emerald-800/30;
}

.menu-icon {
  @apply w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-200;
}

.menu-active .menu-icon {
  @apply opacity-100 scale-105;
}

.menu-text {
  @apply ml-3 text-sm tracking-wide whitespace-nowrap;
}

.menu-header {
  @apply px-7 pt-4 pb-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] select-none;
}

.menu-divider {
  @apply w-8 h-px bg-gray-200 dark:bg-gray-800 mx-auto my-3;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>