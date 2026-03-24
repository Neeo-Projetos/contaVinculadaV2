<template>
  <AppPortalTelas 
    title="Rotinas de Folha"
    icon="fa7-solid:file-invoice-dollar"
    description="Processamento de contracheques, importação de dados e análise de histórico de pagamentos."
    :items="[
      { label: 'Importação TXT', to: '/operacao/contracheque/importacao', icon: 'fa7-solid:file-arrow-up', description: 'Carregamento de arquivos de folha gerados pelo sistema ERP.' },
      { label: 'Processamento', to: '/operacao/contracheque/processamento', icon: 'fa7-solid:gears', description: 'Processamento e validação dos dados importados para a conta vinculada.' },
      { label: 'Histórico de Folha', to: '/operacao/contracheque/detalhes', icon: 'fa7-solid:clock-rotate-left', description: 'Consulta de pagamentos realizados e detalhes de competências anteriores.' }
    ]"
  />
</template>
