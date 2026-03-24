<template>
  <AppPortalTelas 
    title="Gestão de Cadastros"
    icon="fa7-solid:users"
    description="Centralize as informações básicas de funcionários e projetos para controle total da operação."
    :items="[
      { label: 'Funcionários', to: '/cadastro/funcionario', icon: 'fa7-solid:user', description: 'Gestão de colaboradores, documentos e dados pessoais.' },
      { label: 'Projetos', to: '/cadastro/projeto', icon: 'fa7-solid:briefcase', description: 'Controle de projetos ativos, custos e vínculos.' }
    ]"
  />
</template>
