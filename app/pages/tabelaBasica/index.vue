<template>
  <AppPortalTelas 
    title="Tabelas Básicas"
    icon="fa7-solid:database"
    description="Central de configuração e cadastros de apoio do sistema."
    button-label="Acessar Tabela"
    :items="[
      {
        label: 'Bancos',
        description: 'Instituições financeiras e códigos de compensação.',
        icon: 'fa7-solid:building-columns',
        to: '/tabelaBasica/bancos',
        tag: 'Financeiro',
        tagColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
        bgLight: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgShape: 'bg-blue-500/10',
        borderHover: 'hover:border-blue-500/40'
      },
      {
        label: 'Classificação',
        description: 'Classificações contábeis e de ofício.',
        icon: 'fa7-solid:tags',
        to: '/tabelaBasica/classificacao',
        tag: 'Fiscal',
        tagColor: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
        bgLight: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
        bgShape: 'bg-purple-500/10',
        borderHover: 'hover:border-purple-500/40'
      },
      {
        label: 'Lançamento',
        description: 'Tipos e categorias de lançamento financeiro.',
        icon: 'fa7-solid:file-invoice-dollar',
        to: '/tabelaBasica/lancamento',
        tag: 'Contábil',
        tagColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
        bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        bgShape: 'bg-emerald-500/10',
        borderHover: 'hover:border-emerald-500/40'
      },
      {
        label: 'Status',
        description: 'Situações operacionais e regras do sistema.',
        icon: 'fa7-solid:circle-check',
        to: '/tabelaBasica/status',
        tag: 'Sistema',
        tagColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
        bgLight: 'bg-amber-50 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        bgShape: 'bg-amber-500/10',
        borderHover: 'hover:border-amber-500/40'
      },
      {
        label: 'Tipo Movimentação',
        description: 'Configuração de entradas, saídas e estornos.',
        icon: 'fa7-solid:arrow-right-arrow-left',
        to: '/tabelaBasica/tipoMovimentacao',
        tag: 'Fluxo',
        tagColor: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300',
        bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        bgShape: 'bg-indigo-500/10',
        borderHover: 'hover:border-indigo-500/40'
      },
      {
        label: 'Verbas',
        description: 'Rubricas, repasses e cálculos financeiros.',
        icon: 'fa7-solid:money-bills',
        to: '/tabelaBasica/verbas',
        tag: 'Folha',
        tagColor: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300',
        bgLight: 'bg-rose-50 dark:bg-rose-900/20',
        iconColor: 'text-rose-600 dark:text-rose-400',
        bgShape: 'bg-rose-500/10',
        borderHover: 'hover:border-rose-500/40'
      }
    ]"
  />
</template>

<script setup lang="ts">
// Tabelas Básicas padronizada com componente global
</script>