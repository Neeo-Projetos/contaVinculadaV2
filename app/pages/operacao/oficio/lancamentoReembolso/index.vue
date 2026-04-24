<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Lançamento Reembolso"
      descricao="Controle e acompanhamento de ofícios de reembolso" 
      icone-titulo="fa7-solid:file-invoice-dollar"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Operação' }, { label: 'Ofício' }, { label: 'Reembolso' }]"
      :pending="carregando"
      @buscar="tentarBuscar"
      @openAdvancedFilter="modalFiltroAvancadoAberto = true"
      @buscarSugestao="buscarProjetos"
      @selecionarSugestao="({ sugestao }) => selecionarProjeto(sugestao)"
      @fecharSugestao="mostrarMenuProjetos = false"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="abrirModalExibicao">Controle de Exibição</AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="novoRegistro">
          Novo Lançamento
        </AppBotao>
      </template>

      <AppContainerListagem 
        :carregando="carregando" 
        :buscaRealizada="buscaRealizada" 
        :lista="dados || []"
        v-model:filtro-global="filtroGlobal"
        :visaoAtual="visaoAtual" 
        :registroInicial="registroInicial" 
        :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" 
        :itensPorPagina="itensPorPagina" 
        :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" 
        :paginasExibidas="paginasExibidas" 
        @mudarPagina="mudarPagina"
        @mudarItensPorPagina="mudarItensPorPagina"
        :view="false"
        :edit="false"
      >
        <template #cabecalho-tabela>
          <th v-if="colunas.projeto" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Projeto / Conta</th>
          <th v-if="colunas.tipoMov" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Movimentação</th>
          <th v-if="colunas.vlrMov" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center min-w-[140px]">Valor</th>
          <th v-if="colunas.dataOficio" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data</th>
          <th v-if="colunas.status" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
          <th v-if="colunas.acoes" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.projeto" class="p-4">
            <NuxtLink :to="`/operacao/oficio/lancamentoReembolso/cadastro?codigo=${item.codigo}&modo=visualizar`" class="flex flex-col group">
              <span class="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                {{ item.apelido }} - {{ item.projeto }}
              </span>
              <span class="text-[11px] text-gray-400 font-bold uppercase tracking-tighter opacity-70 group-hover:text-emerald-500/60 transition-colors">
                {{ item.contaVinculada }}
              </span>
            </NuxtLink>
          </td>
          <td v-if="colunas.tipoMov" class="p-4">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">{{ item.tipoMovimentacao }}</span>
                <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{{ item.classificacao }}</span>
              </div>
          </td>
          <td v-if="colunas.vlrMov" class="p-4 text-center">
            <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg tabular-nums">
              R$ {{ item.valorMovimentacao }}
            </span>
          </td>
          <td v-if="colunas.dataOficio" class="p-4 text-center text-xs font-bold text-gray-500">
            {{ item.dataOficio }}
          </td>
          <td v-if="colunas.status" class="p-4 text-center uppercase">
            <span :class="item.status === 'Aprovado' || item.status === 'Liquidado' ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' : 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'" class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border">
              {{ item.status }}
            </span>
          </td>
          <td v-if="colunas.acoes" class="p-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <NuxtLink :to="`/operacao/oficio/lancamentoReembolso/cadastro?codigo=${item.codigo}&modo=visualizar`" 
                class="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all active:scale-95 shadow-sm" title="Ver Detalhes">
                <Icon name="fa7-solid:eye" class="w-4 h-4" />
              </NuxtLink>
              <button @click="abrirModalFuncionarios(item.codigo, item.codigoProjeto)" 
                class="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all active:scale-95 shadow-sm" title="Funcionários">
                <Icon name="fa7-solid:users" class="w-4 h-4" />
              </button>
               <button @click="abrirModalDetalhes(item.codigo)" 
                class="w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-all active:scale-95 shadow-sm border border-slate-200/50 dark:border-slate-700/50" title="Mais Detalhes">
                <Icon name="fa7-solid:indent" class="w-4 h-4" />
              </button>
            </div>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem 
            :titulo="item.projeto" 
            :subtituloNome="item.contaVinculada" 
            :subtituloValor="`R$ ${item.valorMovimentacao}`"
            :ativo="true"
            :detalhes="[
              { icone: 'fa7-solid:building-columns', texto: item.contaVinculada },
              { icone: 'fa7-solid:calendar-check', texto: `Ofício: ${item.dataOficio}` },
              { icone: 'fa7-solid:clock-rotate-left', texto: `Status: ${item.status}` }
            ]" 
            @ver-detalhes="navigateTo(`/operacao/oficio/lancamentoReembolso/cadastro?codigo=${item.codigo}&modo=visualizar`)"
            @clique-titulo="navigateTo(`/operacao/oficio/lancamentoReembolso/cadastro?codigo=${item.codigo}&modo=visualizar`)" 
          />
        </template>
      </AppContainerListagem>
    </AppFiltro>

    <AppModalDetalhes 
        :aberto="modalDetalhesAberto" 
        :dados="detalhes"
        @close="modalDetalhesAberto = false"
    />

    <AppModalFuncionarios 
        :aberto="modalFuncionarioAberto" 
        :lista="listaFuncionariosModal"
        @close="modalFuncionarioAberto = false"
    />

    <AppModalExibicao 
      :aberto="modalExibicaoAberto" 
      :colunas="colunasTemp" 
      :labels="labels" 
      @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" 
    />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @aplicar="filtrar" @limpar="limparFiltros">
      <AppSelect v-model="filtro.tipoMovimentacao" label="Tipo de Movimentação" placeholder="Todos os Tipos"
        :opcoes="tiposMovimentacao" itemValue="codigo" itemLabel="descricao" icone="fa7-solid:filter" />
    </AppModalFiltroAvancado>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, filtroGlobal, projetos, tiposMovimentacao,
  buscarLista, filtrar, novoRegistro,
  modalDetalhesAberto, detalhes, abrirModalDetalhes,
  modalFuncionarioAberto, listaFuncionariosModal, abrirModalFuncionarios, gerarPdfOficio,
  modalExibicaoAberto, abrirModalExibicao, aplicarExibicao, colunas, labels, colunasTemp, placeholderDinamico,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina,
  // Autocomplete Projetos
  projetoSearch, sugestoesProjetos, buscandoProjetos, mostrarMenuProjetos,
  buscarProjetos, selecionarProjeto, limparFiltros
} = useLancamentoReembolsoListagem()

const { dispararAlerta } = useAppNotificacao()

const modalFiltroAvancadoAberto = ref(false)

const camposFiltro = computed(() => [
  { 
    key: 'projetoId', 
    label: 'Projeto', 
    type: 'autocomplete' as const, 
    placeholder: 'Buscar projeto...',
    sugestoes: sugestoesProjetos.value,
    buscando: buscandoProjetos.value,
    mostrarMenu: mostrarMenuProjetos.value,
    colSpan: 'md:col-span-5'
  },
  {
    key: 'dataInicioParam',
    label: 'Início',
    type: 'text' as const,
    placeholder: 'Data Início',
    mask: '##/##/####',
    icon: 'fa7-solid:calendar-day',
    colSpan: 'md:col-span-2'
  },
  {
    key: 'dataFimParam',
    label: 'Fim',
    type: 'text' as const,
    placeholder: 'Data Fim',
    mask: '##/##/####',
    icon: 'fa7-solid:calendar-day',
    colSpan: 'md:col-span-2'
  }
])

const tentarBuscar = () => {
  filtrar()
}

const verHistorico = () => {
    alert('📜 Ver Histórico...')
}

const gerarExcel = () => {
    alert('📊 Gerando relatório de reembolsos (Excel)...')
}

const gerarPdf = () => {
    alert('📄 Gerando PDF dos reembolsos...')
}
</script>