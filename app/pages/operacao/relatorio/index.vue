<template>
  <AppPortalTelas 
    title="Relatórios"
    icon="fa7-solid:chart-pie"
    description="Análise detalhada de movimentações, extratos consolidados e visões por projeto ou colaborador."
    :items="[
      { label: 'Extrato Projeto', to: '/operacao/movimentacaoBancaria/extratoProjeto', icon: 'fa7-solid:list-check', description: 'Visão detalhada de todas as entradas e saídas de um projeto específico.' },
      { label: 'Extrato Funcionário', to: '/operacao/movimentacaoBancaria/extratoFuncionario', icon: 'fa7-solid:list', description: 'Histórico de movimentações vinculadas a um único colaborador.' }
    ]"
  />
</template>
