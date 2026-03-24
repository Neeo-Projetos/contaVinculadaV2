<template>
  <AppPortalTelas 
    title="Financeiro"
    icon="fa7-solid:hand-holding-dollar"
    description="Controle de lançamentos financeiros, reembolsos, aportes e movimentações manuais."
    :items="[
      { label: 'Lançamento Reembolso', to: '/operacao/oficio/lancamentoReembolso', icon: 'fa7-solid:money-bill-transfer', description: 'Gestão de ofícios de reembolso e vinculação de despesas.' },
      { label: 'Lançamento Manual', to: '/operacao/movimentacaoBancaria/lancamentoManual', icon: 'fa7-solid:cash-register', description: 'Movimentações diretas em contas de projetos e aportes emergenciais.' },
      { label: 'Estornos', to: '/operacao/movimentacaoBancaria/lancamentoEstorno', icon: 'fa7-solid:rotate-left', description: 'Reversão de lançamentos incorretos e ajustes de saldo.' }
    ]"
  />
</template>
