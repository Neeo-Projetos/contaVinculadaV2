<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Tipos de Movimentação"
      descricao="Gerenciamento de tipos de entrada e saída financeira" 
      icone-titulo="fa7-solid:shuffle"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Tabela Básica' }, { label: 'Tipos de Movimentação' }]"
      :pending="carregando"
      @buscar="buscarLista"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="visaoAtual = visaoAtual === 'lista' ? 'cards' : 'lista'">Controle de Exibição</AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/tabelaBasica/tipoMovimentacao/cadastro')">
          Novo Tipo
        </AppBotao>
      </template>

      <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
        :visaoAtual="visaoAtual" @mudarPagina="mudarPagina">

        <template #cabecalho-tabela>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            ID</th>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tipo de Movimentação</th>
          <th scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Status</th>
        </template>

        <template #linhas-tabela="{ item }">
           <td class="px-6 py-4 text-center">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.codigo }}</span>
          </td>
          <td class="px-6 py-4">
            <NuxtLink :to="`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
              <span
                class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ item.descricao }}
              </span>
            </NuxtLink>
          </td>
          <td class="px-6 py-4 text-center">
            <AppAtivo :ativo="item.ativo" />
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.descricao" :subtituloNome="'ID'" :subtituloValor="item.codigo"
            :ativo="item.ativo" :mostrarStatus="true"
            @ver-detalhes="navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}`)"
            @clique-titulo="navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}`)" />
        </template>

      </AppContainerListagem>
    </AppFiltro>

  </div>
</template>

<script setup lang="ts">
const visaoAtual = ref('lista')
const buscaRealizada = ref(true)
const carregando = ref(false)
const dados = ref<any[]>([])
const filtro = ref<any>({ descricao: '', ativo: '1' })

const camposFiltro = computed(() => [
  { key: 'descricao', label: 'Descrição', type: 'text' as const, placeholder: 'Buscar tipo...' },
  {
    key: 'ativo',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'Ativos', value: '1' },
      { label: 'Inativos', value: '0' },
      { label: 'Todos', value: '' }
    ]
  }
])

const mudarPagina = (p: number) => { }
const buscarLista = () => { }
</script>