<template>
  <AppPortalTelas 
    title="Relatórios"
    icon="fa7-solid:chart-pie"
    description="Análise detalhada de movimentações, extratos consolidados e visões por projeto ou colaborador."
    :items="[
      { 
        label: 'Extrato Projeto', 
        to: '/operacao/movimentacaoBancaria/extratoProjeto', 
        icon: 'fa7-solid:list-check', 
        tag: 'Visão Geral',
        tagColor: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
        bgLight: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
        bgShape: 'bg-purple-500/10',
        borderHover: 'hover:border-purple-500/40',
        description: 'Visão detalhada de todas as entradas e saídas de um projeto específico.' 
      },
      { 
        label: 'Extrato Funcionário', 
        to: '/operacao/movimentacaoBancaria/extratoFuncionario', 
        icon: 'fa7-solid:list', 
        tag: 'Individual',
        tagColor: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300',
        bgLight: 'bg-teal-50 dark:bg-teal-900/20',
        iconColor: 'text-teal-600 dark:text-teal-400',
        bgShape: 'bg-teal-500/10',
        borderHover: 'hover:border-teal-500/40',
        description: 'Histórico de movimentações vinculadas a um único colaborador.' 
      }
    ]"
  />
</template>
