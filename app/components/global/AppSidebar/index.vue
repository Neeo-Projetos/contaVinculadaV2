<template>
  <aside 
    :class="[
      'bg-white dark:bg-[#1a1c23] border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 h-full overflow-hidden absolute lg:relative z-50', 
      collapsed ? 'w-0 lg:w-20 border-0 lg:border-r' : 'w-64 border-r shadow-2xl lg:shadow-sm'
    ]"
  >
    <nav class="flex-1 overflow-y-auto py-6 space-y-1 overflow-x-hidden scrollbar-hide w-64">
      
      <!-- INÍCIO -->
      <NuxtLink to="/inicio" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Início' : ''">
        <Icon name="fa7-solid:house" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Início</span>
      </NuxtLink>

      <!-- GESTÃO DE CADASTROS -->
      <div v-if="!collapsed" class="menu-header">Gestão de Cadastros</div>
      <div v-else class="menu-divider"></div>
      
      <NuxtLink to="/cadastro/funcionario" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Funcionários' : ''">
        <Icon name="fa7-solid:users" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Funcionários</span>
      </NuxtLink>

      <NuxtLink to="/cadastro/projeto" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Projetos' : ''">
        <Icon name="fa7-solid:briefcase" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Projetos</span>
      </NuxtLink>

      <!-- ROTINAS DE FOLHA -->
      <div v-if="!collapsed" class="menu-header mt-2">Rotinas de Folha</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/operacao/contracheque/importacao" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Importação TXT' : ''">
        <Icon name="fa7-solid:file-arrow-up" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Importação TXT</span>
      </NuxtLink>

      <NuxtLink to="/operacao/contracheque/processamento" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Processamento' : ''">
        <Icon name="fa7-solid:gears" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Processamento</span>
      </NuxtLink>

      <NuxtLink to="/operacao/contracheque/detalhes" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Histórico' : ''">
        <Icon name="fa7-solid:clock-rotate-left" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Histórico</span>
      </NuxtLink>

      <!-- FINANCEIRO & REEMBOLSO -->
      <div v-if="!collapsed" class="menu-header mt-2">Financeiro & Reembolso</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/operacao/oficio/lancamentoReembolso" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Lançamento Reembolso' : ''">
        <Icon name="fa7-solid:hand-holding-dollar" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Lançamento Reembolso</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/lancamentoManual" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Lançamento Manual' : ''">
        <Icon name="fa7-solid:cash-register" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Lançamento Manual</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/lancamentoEstorno" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Estornos' : ''">
        <Icon name="fa7-solid:rotate-left" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Estornos</span>
      </NuxtLink>

      <!-- RELATÓRIOS & EXTRATOS -->
      <div v-if="!collapsed" class="menu-header mt-2">Relatórios & Extratos</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/operacao/movimentacaoBancaria/extratoProjeto" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Extrato Projeto' : ''">
        <Icon name="fa7-solid:list-check" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Extrato Projeto</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/extratoFuncionario" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Extrato Funcionário' : ''">
        <Icon name="fa7-solid:list" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Extrato Funcionário</span>
      </NuxtLink>

      <!-- CONFIGURAÇÕES -->
      <div v-if="!collapsed" class="menu-header mt-2">Configurações</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/configuracao" 
        class="menu-link group" 
        :class="{ 'menu-active': $route.path.startsWith('/configuracao') || $route.path.startsWith('/seguranca') }" 
        :title="collapsed ? 'Central de Configurações' : ''">
        <Icon name="fa7-solid:screwdriver-wrench" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Central de Configurações</span>
      </NuxtLink>

      <NuxtLink to="/tabelaBasica" 
        class="menu-link group" 
        :class="{ 'menu-active': $route.path.startsWith('/tabelaBasica') }" 
        :title="collapsed ? 'Tabelas Básicas' : ''">
        <Icon name="fa7-solid:database" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Tabelas Básicas</span>
      </NuxtLink>

    </nav>

    <div class="p-4 border-t border-gray-100 dark:border-gray-800/80 bg-white/50 dark:bg-[#1a1c23]/50 backdrop-blur-md">
      <button @click="toggleTheme()" class="flex items-center justify-center gap-3 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group" :title="theme === 'dark' ? 'Mudar para Claro' : 'Mudar para Escuro'">
        <Icon :name="theme === 'dark' ? 'fa7-solid:sun' : 'fa7-solid:moon'" class="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" :class="theme === 'dark' ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-emerald-500 group-hover:text-emerald-600'" />
        <span v-if="!collapsed" class="font-semibold text-sm whitespace-nowrap">Tema {{ theme === 'dark' ? 'Claro' : 'Escuro' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { toggleTheme, theme } = useTheme()

defineProps<{ collapsed: boolean }>()
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