<template>
  <div class="min-h-full flex flex-col gap-4 p-4 md:p-6 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Tipos de Movimentação"
      descricao="Gerenciamento de fluxos de entrada e saída financeira" 
      icone-titulo="fa7-solid:shuffle"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Tabela Básica' }, { label: 'Tipos de Movimentação' }]" 
      :pending="carregando"
      @buscar="buscarLista" 
      @openAdvancedFilter="abrirModalFiltroAvancado"
      @buscarSugestao="buscarSugestao" 
      @selecionarSugestao="({ sugestao }) => selecionarSugestao(sugestao)"
      @fecharSugestao="fecharSugestoesDelay"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="abrirModalExibicao">Controle de Exibição</AppBotao>

        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/tabelaBasica/tipoMovimentacao/cadastro?codigo=0')">
          Novo Tipo
        </AppBotao>
      </template>

      <AppContainerListagem 
        ref="listagemRef" 
        v-model:filtro-global="filtroGlobal" 
        :carregando="carregando"
        :buscaRealizada="buscaRealizada" 
        :lista="dados || []" 
        :visaoAtual="visaoAtual"
        :totalRegistros="totalRegistros" 
        :itensPorPagina="itensPorPagina" 
        :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" 
        :paginasExibidas="paginasExibidas" 
        :registroInicial="registroInicial" 
        :registroFinal="registroFinal"
        nomeTela="Tipo de Movimentação" 
        endpointDelete="/api/tabelaBasica/tipoMovimentacao/excluir"
        campoDelete="codigo"
        :history="true"
        @mudarPagina="mudarPagina"
        @mudarItensPorPagina="mudarItensPorPagina"
        @view="item => navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}&modo=visualizar`)"
        @edit="item => navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}`)"
        @history="id => abrirHistorico(id)" 
        @delete-success="buscarLista"
      >

        <template #cabecalho-tabela>
          <th v-if="colunas.descricao" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tipo de Movimentação</th>
          <th v-if="colunas.status" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Status</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.descricao" class="px-6 py-4">
            <NuxtLink :to="`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}&modo=visualizar`" class="flex items-center gap-3 group">
              <div
                class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                {{ item.descricao ? item.descricao.charAt(0).toUpperCase() : 'M' }}
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {{ item.descricao }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">Fluxo Financeiro</span>
              </div>
            </NuxtLink>
          </td>
          <td v-if="colunas.status" class="px-6 py-4 text-center">
            <AppAtivo :ativo="Number(item.ativo) === 1" />
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem 
            :titulo="item.descricao" 
            :subtituloNome="'Situação'" 
            :subtituloValor="Number(item.ativo) === 1 ? 'Ativo' : 'Inativo'"
            :ativo="Number(item.ativo) === 1" 
            :mostrarStatus="colunas.status" 
            :mostrarHistorico="colunas.historico"
            @ver-detalhes="navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}&modo=visualizar`)"
            @editar="navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}`)"
            @excluir="() => listagemRef?.triggerDelete(item.codigo)"
            @ver-historico="abrirHistorico(item.codigo)"
            @clique-titulo="navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?codigo=${item.codigo}&modo=visualizar`)" 
          />
        </template>

      </AppContainerListagem>
    </AppFiltro>

    <AppModalFiltroAvancado 
      :aberto="modalFiltroAvancadoAberto" 
      @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" 
      @aplicar="aplicarFiltroAvancado"
    >
        <div class="md:col-span-4">
          <AppInputTexto v-model="filtro.descricao" label="DESCRIÇÃO" placeholder="Digite o nome..." icone="fa7-solid:font" />
        </div>
    </AppModalFiltroAvancado>

    <AppModalExibicao 
      :aberto="modalExibicaoAberto" 
      :colunas="colunasTemp" 
      :labels="labels" 
      @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" 
    />

    <AppModalHistorico 
      :aberto="modalHistoricoAberto" 
      :historico="historicoData"
      :carregando="carregandoHistorico" 
      @close="modalHistoricoAberto = false" 
    />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscandoSugestao, sugestoes, mostrarMenuSugestao, buscarSugestao,
  selecionarSugestao, fecharSugestoesDelay,
  buscarLista, filtroGlobal, modalHistoricoAberto, historicoData, abrirHistorico, carregandoHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  modalExibicaoAberto, abrirModalExibicao, colunas, labels, aplicarExibicao, colunasTemp,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina, gerarExcel
} = useTipoMovimentacaoListagem()

const listagemRef = ref<any>(null)

const camposFiltro = computed(() => [
  { 
      key: 'descricao', 
      label: 'Descrição', 
      type: 'autocomplete' as const, 
      placeholder: 'Buscar tipo...',
      sugestoes: sugestoes.value,
      buscando: buscandoSugestao.value,
      mostrarMenu: mostrarMenuSugestao.value,
      icon: 'fa7-solid:shuffle'
  },
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
</script>