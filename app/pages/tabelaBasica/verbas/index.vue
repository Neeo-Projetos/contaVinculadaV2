<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Verbas"
      descricao="Cadastro e gestão de rubricas e verbas do sistema" 
      icone-titulo="fa7-solid:sack-dollar"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Tabela Básica' }, { label: 'Verbas' }]"
      :pending="carregando"
      @buscar="buscarLista"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="visaoAtual = visaoAtual === 'lista' ? 'cards' : 'lista'">Controle de Exibição</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:download" @click="navigateTo('/tabelaBasica/verbas/importar')">
          Importação
        </AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/tabelaBasica/verbas/cadastro')">
          Nova Verba
        </AppBotao>
      </template>

      <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
        :visaoAtual="visaoAtual" @mudarPagina="mudarPagina">

        <template #cabecalho-tabela>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Código</th>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Verba</th>
          <th scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Status</th>
          <th scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Histórico</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td class="px-6 py-4">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.codigo_verba }}</span>
          </td>
          <td class="px-6 py-4">
            <NuxtLink :to="`/tabelaBasica/verbas/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
              <span
                class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ item.descricao }}
              </span>
            </NuxtLink>
          </td>
          <td class="px-6 py-4 text-center">
            <AppAtivo :ativo="item.ativo" />
          </td>
          <td class="px-6 py-4 text-center">
            <button @click.stop="abrirHistorico(item.codigo)"
              class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
              title="Ver Histórico">
              <Icon name="fa6-solid:clock-rotate-left" class="w-5 h-5" />
            </button>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.descricao" :subtituloNome="'Cód. Verba'" :subtituloValor="item.codigo_verba"
            :ativo="item.ativo" :mostrarStatus="true" :mostrarHistorico="true"
            @ver-detalhes="navigateTo(`/tabelaBasica/verbas/cadastro?codigo=${item.codigo}`)"
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
</script>