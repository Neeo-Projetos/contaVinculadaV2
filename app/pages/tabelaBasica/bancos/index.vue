<template>
  <div class="min-h-full flex flex-col gap-4 p-4 md:p-6 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro v-model="filtro" v-model:viewMode="visaoAtual" :campos="camposFiltro" titulo="Bancos"
      descricao="Cadastro e gestão de instituições financeiras" icone-titulo="fa7-solid:building-columns"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Tabela Básica' }, { label: 'Bancos' }]" :pending="carregando"
      @buscar="filtrar" @openAdvancedFilter="() => {}"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="() => {}">Controle de Exibição
        </AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:download" @click="navigateTo('/tabelaBasica/bancos/importar')">
          Importação
        </AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/tabelaBasica/bancos/cadastro?id=0')">
          Novo Banco
        </AppBotao>
      </template>

      <AppContainerListagem ref="listagemRef" v-model:filtro-global="filtroGlobal" :carregando="carregando"
        :buscaRealizada="buscaRealizada" :lista="dados || []" :visaoAtual="visaoAtual"
        :history="true" nomeTela="Banco" endpointDelete="/api/tabelaBasica/banco/excluir"
        @view="item => navigateTo(`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`)"
        @edit="item => navigateTo(`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`)"
        @history="codigo => abrirHistorico(Number(codigo))" @delete-success="filtrar">

        <template #cabecalho-tabela>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Código</th>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Banco</th>
          <th scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Status</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td class="px-6 py-4 text-center">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{{ item.codigoBanco }}</span>
          </td>
          <td class="px-6 py-4">
            <NuxtLink :to="`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
              <div
                class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                {{ item.descricao.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {{ item.descricao }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate">Instituição Financeira</span>
              </div>
            </NuxtLink>
          </td>
          <td class="px-6 py-4 text-center">
            <AppAtivo :ativo="Number(item.ativo) === 1 || item.ativo === true" />
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.descricao" :subtituloNome="'Cód. Banco'" :subtituloValor="item.codigoBanco"
            :ativo="Number(item.ativo) === 1 || item.ativo === true" :mostrarStatus="true" :mostrarHistorico="true"
            @ver-detalhes="navigateTo(`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`)"
            @editar="navigateTo(`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`)"
            @excluir="() => listagemRef?.triggerDelete(item.codigo)"
            @ver-historico="abrirHistorico(item.codigo)"
            @clique-titulo="navigateTo(`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`)" />
        </template>

      </AppContainerListagem>
    </AppFiltro>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoSelecionado"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const visaoAtual = ref('lista')
const buscaRealizada = ref(false)
const carregando = ref(false)
const dados = ref<any[]>([])
const filtro = ref<any>({ descricao: '', ativo: '1' })
const filtroGlobal = ref('')

const camposFiltro = computed(() => [
  { key: 'descricao', label: 'Descrição', type: 'text' as const, placeholder: 'Buscar por nome do banco...' },
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

const modalHistoricoAberto = ref(false)
const historicoSelecionado = ref<any[]>([])
const carregandoHistorico = ref(false)

const mudarPagina = (p: number) => { }
const filtrar = () => {
    // Aqui resetaria a página para 1 se houvesse paginação por composable
    // paginacao.mudarPagina(1) 
    buscarLista()
}
const buscarLista = () => { }
const abrirHistorico = (id: number) => {
  modalHistoricoAberto.value = true
}

const gerarExcel = () => {
    alert('📊 Gerando relatório Excel de Bancos...')
}

const gerarPdf = () => {
    alert('📄 Gerando PDF da Tabela de Bancos...')
}

// Referência para abrir o modal de exclusão a partir dos cards
const listagemRef = ref<any>(null)
</script>