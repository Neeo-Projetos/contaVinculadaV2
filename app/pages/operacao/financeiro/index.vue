<template>
  <AppPortalTelas 
    title="Financeiro"
    icon="fa7-solid:hand-holding-dollar"
    description="Controle de lançamentos financeiros, reembolsos, aportes e movimentações manuais."
    :items="[
      { 
        label: 'Lançamento Reembolso', 
        to: '/operacao/oficio/lancamentoReembolso', 
        icon: 'fa7-solid:money-bill-transfer', 
        tag: 'Ofícios',
        tagColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
        bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        bgShape: 'bg-emerald-500/10',
        borderHover: 'hover:border-emerald-500/40',
        description: 'Gestão de ofícios de reembolso e vinculação de despesas.' 
      },
      { 
        label: 'Lançamento Manual', 
        to: '/operacao/movimentacaoBancaria/lancamentoManual', 
        icon: 'fa7-solid:cash-register', 
        tag: 'Tesouraria',
        tagColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
        bgLight: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgShape: 'bg-blue-500/10',
        borderHover: 'hover:border-blue-500/40',
        description: 'Movimentações diretas em contas de projetos e aportes emergenciais.' 
      },
      { 
        label: 'Estornos', 
        to: '/operacao/movimentacaoBancaria/lancamentoEstorno', 
        icon: 'fa7-solid:rotate-left', 
        tag: 'Correção',
        tagColor: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300',
        bgLight: 'bg-rose-50 dark:bg-rose-900/20',
        iconColor: 'text-rose-600 dark:text-rose-400',
        bgShape: 'bg-rose-500/10',
        borderHover: 'hover:border-rose-500/40',
        description: 'Reversão de lançamentos incorretos e ajustes de saldo.' 
      }
    ]"
  />
</template>
