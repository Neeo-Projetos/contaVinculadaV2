<template>
  <div class="min-h-full flex flex-col gap-4 p-4 md:p-6 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro v-model="filtro" v-model:viewMode="visaoAtual" :campos="camposFiltro" titulo="Verbas"
      descricao="Cadastro e gestão de rubricas e verbas do sistema" icone-titulo="fa7-solid:sack-dollar"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Tabela Básica' }, { label: 'Verbas' }]" :pending="carregando"
      @buscar="buscarLista" @openAdvancedFilter="() => {}"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="() => {}">Controle de Exibição
        </AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:download" @click="navigateTo('/tabelaBasica/verbas/importar')">
          Importação
        </AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/tabelaBasica/verbas/cadastro?id=0')">
          Nova Verba
        </AppBotao>
      </template>

      <AppContainerListagem ref="listagemRef" v-model:filtro-global="filtroGlobal" :carregando="carregando"
        :buscaRealizada="buscaRealizada" :lista="dados || []" :visaoAtual="visaoAtual"
        :history="true" nomeTela="Verba" endpointDelete="/api/tabelaBasica/verba/excluir"
        @view="item => navigateTo(`/tabelaBasica/verbas/cadastro?codigo=${item.codigo}`)"
        @edit="item => navigateTo(`/tabelaBasica/verbas/cadastro?codigo=${item.codigo}`)"
        @history="codigo => abrirHistorico(Number(codigo))" @delete-success="buscarLista">

        <template #cabecalho-tabela>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Código</th>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Verba</th>
          <th scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Status</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td class="px-6 py-4 text-center">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{{ item.codigo_verba }}</span>
          </td>
          <td class="px-6 py-4">
            <NuxtLink :to="`/tabelaBasica/verbas/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
              <div
                class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                {{ item.descricao.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {{ item.descricao }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate">Rubrica Financeira</span>
              </div>
            </NuxtLink>
          </td>
          <td class="px-6 py-4 text-center">
            <AppAtivo :ativo="Number(item.ativo) === 1 || item.ativo === true" />
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.descricao" :subtituloNome="'Cód. Verba'" :subtituloValor="item.codigo_verba"
            :ativo="Number(item.ativo) === 1 || item.ativo === true" :mostrarStatus="true" :mostrarHistorico="true"
            @ver-detalhes="navigateTo(`/tabelaBasica/verbas/cadastro?codigo=${item.codigo}`)"
            @editar="navigateTo(`/tabelaBasica/verbas/cadastro?codigo=${item.codigo}`)"
            @excluir="() => listagemRef?.triggerDelete(item.codigo)"
            @ver-historico="abrirHistorico(item.codigo)"
            @clique-titulo="navigateTo(`/tabelaBasica/verbas/cadastro?codigo=${item.codigo}`)" />
        </template>

      </AppContainerListagem>
    </AppFiltro>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoSelecionado"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const visaoAtual = ref('lista')
const buscaRealizada = ref(true)
const carregando = ref(false)
const dados = ref<any[]>([])
const filtro = ref<any>({ descricao: '', ativo: '1' })
const filtroGlobal = ref('')

const camposFiltro = computed(() => [
  { key: 'descricao', label: 'Descrição', type: 'text' as const, placeholder: 'Buscar por nome da verba...' },
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
const buscarLista = () => { }
const abrirHistorico = (id: number) => {
  modalHistoricoAberto.value = true
}

const gerarExcel = () => {
    alert('📊 Gerando relatório Excel de Verbas...')
}

const gerarPdf = () => {
    alert('📄 Gerando PDF da Tabela de Verbas...')
}

// Referência para abrir o modal de exclusão a partir dos cards
const listagemRef = ref<any>(null)
</script>