<template>
  <div class="min-h-full flex flex-col gap-4 p-4 md:p-6 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro v-model="filtro" v-model:viewMode="visaoAtual" :campos="camposFiltro" titulo="Bancos"
      descricao="Cadastro e gestão de instituições financeiras" icone-titulo="fa7-solid:building-columns"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Tabela Básica' }, { label: 'Bancos' }]" :pending="carregando"
      @buscar="buscarLista" @openAdvancedFilter="abrirModalFiltroAvancado"
      @buscarSugestao="buscarSugestoesBancos" 
      @selecionarSugestao="({ sugestao }) => selecionarSugestaoBancos(sugestao)"
      @fecharSugestao="fecharSugestoesDelay"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="() => {}">Controle de Exibição
        </AppBotao>

        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/tabelaBasica/bancos/cadastro?id=0')">
          Novo Banco
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
        nomeTela="Banco" 
        endpointDelete="/api/tabelaBasica/bancos/excluir"
        campoDelete="codigo"
        @mudarPagina="mudarPagina"
        @mudarItensPorPagina="mudarItensPorPagina"
        @view="item => navigateTo(`/tabelaBasica/bancos/cadastro?id=${item.codigo}&modo=visualizar`)"
        @edit="item => navigateTo(`/tabelaBasica/bancos/cadastro?id=${item.codigo}`)"
        @history="item => abrirHistorico(item.codigo)" 
        @delete-success="buscarLista"
      >

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
          <td v-if="colunas.codigoBanco" class="px-6 py-4 text-center">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{{ item.codigoBanco }}</span>
          </td>
          <td v-if="colunas.descricao" class="px-6 py-4">
            <NuxtLink :to="`/tabelaBasica/bancos/cadastro?id=${item.codigo}&modo=visualizar`" class="flex items-center gap-3 group">
              <div
                class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                {{ item.nomeBanco ? item.nomeBanco.charAt(0).toUpperCase() : 'B' }}
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {{ item.nomeBanco }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">Instituição Financeira</span>
              </div>
            </NuxtLink>
          </td>
          <td v-if="colunas.status" class="px-6 py-4 text-center">
            <AppAtivo :ativo="Number(item.ativo) === 1" />
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem 
            :titulo="item.nomeBanco" 
            :subtituloNome="'Cód. Banco'" 
            :subtituloValor="item.codigoBanco"
            :ativo="Number(item.ativo) === 1" 
            :mostrarStatus="colunas.status" 
            :mostrarHistorico="colunas.historico"
            @ver-detalhes="navigateTo(`/tabelaBasica/bancos/cadastro?id=${item.codigo}&modo=visualizar`)"
            @editar="navigateTo(`/tabelaBasica/bancos/cadastro?id=${item.codigo}`)"
            @excluir="() => listagemRef?.triggerDelete(item.codigo)"
            @ver-historico="abrirHistorico(item.codigo)"
            @clique-titulo="navigateTo(`/tabelaBasica/bancos/cadastro?id=${item.codigo}&modo=visualizar`)" 
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
        <div class="md:col-span-2">
          <AppInputTexto v-model="filtro.codigoBanco" label="CÓDIGO DO BANCO" placeholder="Ex: 001, 237..." icone="fa7-solid:hashtag" />
        </div>
        <div class="md:col-span-2">
          <AppInputTexto v-model="filtro.nomeBanco" label="DESCRIÇÃO DO BANCO" placeholder="Digite o nome..." icone="fa7-solid:building-columns" />
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
  buscandoBancosSugestao, sugestoesBancos, mostrarMenuBancos, buscarSugestoesBancos,
  selecionarSugestaoBancos, fecharSugestoesDelay,
  buscarLista, filtroGlobal, modalHistoricoAberto, historicoData, abrirHistorico, carregandoHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  modalExibicaoAberto, abrirModalExibicao, colunas, labels, aplicarExibicao, colunasTemp,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina, gerarExcel
} = useBancosListagem()

const listagemRef = ref<any>(null)

const camposFiltro = computed(() => [
  { 
      key: 'nomeBanco', 
      label: 'Descrição', 
      type: 'autocomplete' as const, 
      placeholder: 'Buscar por nome do banco...',
      sugestoes: sugestoesBancos.value,
      buscando: buscandoBancosSugestao.value,
      mostrarMenu: mostrarMenuBancos.value,
      icon: 'fa7-solid:building-columns'
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