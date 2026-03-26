<template>
  <AppPortalTelas 
    title="Gestão de Cadastros"
    icon="fa7-solid:users"
    description="Centralize as informações básicas de funcionários e projetos para controle total da operação."
    :items="[
      { 
        label: 'Funcionários', 
        to: '/cadastro/funcionario', 
        icon: 'fa7-solid:user', 
        tag: 'Pessoas',
        tagColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
        bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        bgShape: 'bg-emerald-500/10',
        borderHover: 'hover:border-emerald-500/40',
        description: 'Gestão de colaboradores, documentos e dados pessoais.' 
      },
      { 
        label: 'Projetos', 
        to: '/cadastro/projeto', 
        icon: 'fa7-solid:briefcase', 
        tag: 'Empresas',
        tagColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
        bgLight: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgShape: 'bg-blue-500/10',
        borderHover: 'hover:border-blue-500/40',
        description: 'Controle de projetos ativos, custos e vínculos.' 
      }
    ]"
  />
</template>
