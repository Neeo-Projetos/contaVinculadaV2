<template>
  <AppPortalTelas 
    title="Central de Configurações"
    icon="fa7-solid:user-gear"
    description="Gestão de acessos, parâmetros globais e regras de negócio para o sistema."
    button-label="Abrir Configuração"
    :items="[
      {
        label: 'Usuários',
        description: 'Gestão de contas, dados pessoais e acesso dos colaboradores ao sistema.',
        icon: 'fa7-solid:user-gear',
        to: '/configuracao/usuario',
        tag: 'Segurança',
        tagColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
        bgLight: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgShape: 'bg-blue-500/10',
        borderHover: 'hover:border-blue-500/40'
      },
      {
        label: 'Permissões de Usuário',
        description: 'Configuração de perfis e níveis de acesso granular para cada usuário.',
        icon: 'fa7-solid:shield-halved',
        to: '/configuracao/permissaoUsuario',
        tag: 'Segurança',
        tagColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
        bgLight: 'bg-amber-50 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        bgShape: 'bg-amber-500/10',
        borderHover: 'hover:border-amber-500/40'
      },
      {
        label: 'Parâmetros de Ofício',
        description: 'Redações base e variáveis para geração automática de documentos oficiais.',
        icon: 'fa7-solid:file-signature',
        to: '/configuracao/parametros/oficio',
        tag: 'Segurança',
        tagColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
        bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        bgShape: 'bg-emerald-500/10',
        borderHover: 'hover:border-emerald-500/40'
      }
    ]"
  />
</template>

<script setup lang="ts">
// Central de Configurações padronizada
</script>
