<template>
  <div class="min-h-full flex flex-col gap-4 p-4 md:p-6 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro v-model="filtro" v-model:viewMode="visaoAtual" :campos="camposFiltro" titulo="Gestão de Projetos"
      descricao="Gerenciamento de projetos, contas e verbas do sistema" icone-titulo="fa7-solid:briefcase"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Cadastro' }, { label: 'Projetos' }]" :pending="carregandoTela"
      @buscar="filtrar" @openAdvancedFilter="abrirModalFiltroAvancado"
      @buscarSugestao="buscarSugestoesProjeto"
      @selecionarSugestao="({ sugestao }) => selecionarSugestao(sugestao)"
      @fecharSugestao="fecharSugestoesDelay">
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="abrirModalExibicao">Controle de Exibição
        </AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/cadastro/projeto/cadastro?id=0')">
          Novo Projeto
        </AppBotao>
      </template>

      <AppContainerListagem ref="listagemRef" v-model:filtro-global="filtroGlobal" :carregando="carregandoTela"
        :buscaRealizada="buscaRealizada" :lista="listaRegistros" :visaoAtual="visaoAtual"
        :registroInicial="registroInicial" :registroFinal="registroFinal" :totalRegistros="totalRegistros"
        :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas" :paginaAtual="paginaAtual"
        :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina" @mudarItensPorPagina="mudarItensPorPagina"
        :history="true" nomeTela="Projeto" endpointDelete="/api/cadastro/projeto/excluir"
        @view="item => navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)"
        @edit="item => navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)"
        @history="codigo => abrirHistorico(Number(codigo))" @delete-success="filtrar">

        <template #cabecalho-tabela>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Projeto</th>
          <th v-if="colunas.cnpj" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            CNPJ</th>
          <th v-if="colunas.contas" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Contas</th>
          <th v-if="colunas.verbas" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Verbas</th>
          <th v-if="colunas.status" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Status</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td class="px-6 py-4 max-w-[300px]">
            <NuxtLink :to="`/cadastro/projeto/cadastro?id=${item.codigo}`" class="flex items-center gap-3 group">
              <div
                class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                {{ item.apelido.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{
                    item.apelido }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.descricao }}</span>
              </div>
            </NuxtLink>
          </td>
          <td v-if="colunas.cnpj" class="px-6 py-4 text-center">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ item.cnpj }}</span>
          </td>
          <td v-if="colunas.contas" class="px-6 py-4 text-center">
            <button @click="abrirModalConta(item.codigo)"
              class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all duration-300 shadow-sm mx-auto group ring-1 ring-slate-200/50 dark:ring-slate-700/50 active:scale-95"
              title="Ver Contas">
              <Icon name="fa7-solid:building-columns" class="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </td>
          <td v-if="colunas.verbas" class="px-6 py-4 text-center">
            <button @click="abrirModalVerba(item.codigo)"
              class="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-all duration-300 shadow-sm mx-auto group ring-1 ring-amber-200/50 dark:ring-amber-900/30 active:scale-95"
              title="Ver Verbas">
              <Icon name="fa7-solid:sack-dollar" class="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </td>
          <td v-if="colunas.status" class="px-6 py-4 text-center">
            <AppAtivo :ativo="Number(item.ativo) === 1 || item.ativo === true" />
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.apelido" subtituloNome="Descrição" :subtituloValor="item.descricao"
            :ativo="Number(item.ativo) === 1 || item.ativo === true" :mostrarStatus="colunas.status"
            :mostrarHistorico="true" :detalhes="[
              ...(colunas.cnpj ? [{ icone: 'fa7-solid:address-card', texto: `CNPJ: ${item.cnpj}` }] : [])
            ]" @ver-detalhes="navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)"
            @editar="navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)"
            @excluir="() => listagemRef?.triggerDelete(item.codigo)" @ver-historico="abrirHistorico(item.codigo)"
            @clique-titulo="navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)" />
        </template>

      </AppContainerListagem>
    </AppFiltro>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoSelecionado"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">

      <AppInputCnpj v-model="filtro.cnpjParam" label="CNPJ do Projeto" />

      <AppSelect v-model="filtro.contaParam" label="Conta Vinculada (Banco)"
        :opcoes="listaBancos" />

      <AppSelect v-model="filtro.verbaParam" label="Verba"
        :opcoes="listaVerbas" />

    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labelsColunas"
      @aplicar="aplicarExibicao" @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  filtro, listaRegistros, carregandoTela, buscaRealizada,
  visaoAtual, registroInicial, registroFinal, totalRegistros,
  itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  colunasVisiveis, colunasTemp, modalExibicaoAberto, aplicarExibicao, abrirModalExibicao,
  labelsColunas, placeholderDinamico,
  modalHistoricoAberto, historicoSelecionado, carregandoHistorico, abrirHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  sugestoesProjeto, mostrandoSugestoes, buscandoSugestoes, buscarSugestoesProjeto, selecionarSugestao, fecharSugestoesDelay,
  buscarProjetos, filtrar, mudarPagina, mudarItensPorPagina, filtroGlobal,
  abrirModalConta, abrirModalVerba,
  listaVerbas, listaBancos
} = useProjetoListagem()

const colunas = colunasVisiveis

const camposFiltro = computed<any>(() => [
  {
    key: 'apelidoParam',
    label: 'Buscar Por',
    type: 'autocomplete' as const,
    placeholder: placeholderDinamico.value,
    sugestoes: sugestoesProjeto.value,
    buscando: buscandoSugestoes.value,
    mostrarMenu: mostrandoSugestoes.value
  },
  {
    key: 'ativoParam',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'Ativos', value: '1' },
      { label: 'Inativos', value: '0' },
      { label: 'Todos', value: '' }
    ]
  }
])


const gerarExcel = () => {
  alert('📊 Gerando relatório Excel dos Projetos...')
}

const gerarPdf = () => {
  alert('📄 Gerando PDF da Base de Projetos...')
}

// Referência para abrir o modal de exclusão a partir dos cards
const listagemRef = ref<any>(null)
</script>