<template>
  <AppPortalTelas 
    title="Rotinas de Folha"
    icon="fa7-solid:file-invoice-dollar"
    description="Processamento de contracheques, importação de dados e análise de histórico de pagamentos."
    :items="[
      { 
        label: 'Importação TXT', 
        to: '/operacao/contracheque/importacao', 
        icon: 'fa7-solid:file-arrow-up', 
        tag: 'Dados',
        tagColor: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300',
        bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        bgShape: 'bg-indigo-500/10',
        borderHover: 'hover:border-indigo-500/40',
        description: 'Carregamento de arquivos de folha gerados pelo sistema ERP.' 
      },
      { 
        label: 'Processamento', 
        to: '/operacao/contracheque/processamento', 
        icon: 'fa7-solid:gears', 
        tag: 'Rotinas',
        tagColor: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300',
        bgLight: 'bg-rose-50 dark:bg-rose-900/20',
        iconColor: 'text-rose-600 dark:text-rose-400',
        bgShape: 'bg-rose-500/10',
        borderHover: 'hover:border-rose-500/40',
        description: 'Processamento e validação dos dados importados para a conta vinculada.' 
      },
      { 
        label: 'Histórico de Folha', 
        to: '/operacao/contracheque/detalhes', 
        icon: 'fa7-solid:clock-rotate-left', 
        tag: 'Consulta',
        tagColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
        bgLight: 'bg-amber-50 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        bgShape: 'bg-amber-500/10',
        borderHover: 'hover:border-amber-500/40',
        description: 'Consulta de pagamentos realizados e detalhes de competências anteriores.' 
      }
    ]"
  />
</template>
