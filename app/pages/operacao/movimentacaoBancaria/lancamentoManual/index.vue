<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100 font-bold">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Lançamento Manual"
      descricao="Gerencie movimentações bancárias manuais e vinculações com funcionários" 
      icone-titulo="fa7-solid:file-invoice-dollar"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Operação' }, { label: 'Tesouraria' }, { label: 'Lançamento Manual' }]"
      :pending="carregando"
      @buscar="tentarBuscar"
      @openAdvancedFilter="abrirModalFiltroAvancado"
      @buscarSugestao="buscarProjetosAutocomplete"
      @selecionarSugestao="({ sugestao }) => selecionarProjetoAutocomplete(sugestao)"
      @fecharSugestao="fecharSugestoesDelay"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="abrirModalExibicao" class="whitespace-nowrap">Controle de Exibição</AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="novoRegistro">
          Novo Lançamento
        </AppBotao>
      </template>

      <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
        :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
        :view="false" :edit="false"
        @mudarItensPorPagina="mudarItensPorPagina">

        <template #cabecalho-tabela>
          <th scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
            Projeto / Conta
          </th>
          <th v-if="colunas.valor" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Valor</th>
          <th v-if="colunas.tipo" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
            Movimentação</th>
          <th v-if="colunas.data" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Data</th>
          <th v-if="colunas.acoes" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-40">
            Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td class="px-6 py-4">
            <NuxtLink :to="`/operacao/movimentacaoBancaria/lancamentoManual/cadastro?codigo=${item.codigo}&modo=visualizar`" class="flex flex-col group">
              <span class="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{{ item.projeto }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium italic">{{ item.contaVinculada }}</span>
            </NuxtLink>
          </td>
          <td v-if="colunas.valor" class="px-6 py-4 text-center">
            <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg tabular-nums">
              R$ {{ formatarMoeda(item.valorMovimentacao) }}
            </span>
          </td>
          <td v-if="colunas.tipo" class="px-6 py-4">
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">{{ item.tipoMovimentacao }}</span>
              <span v-if="colunas.classificacao" class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{{ item.classificacao }}</span>
            </div>
          </td>
          <td v-if="colunas.data" class="px-6 py-4 text-center font-bold text-gray-500 tabular-nums">
            <span class="text-xs tracking-tighter">{{ item.dataMovimentacao }}</span>
          </td>
          <td v-if="colunas.acoes" class="px-6 py-4 text-center">
             <div class="flex items-center justify-center gap-2">
                <NuxtLink :to="`/operacao/movimentacaoBancaria/lancamentoManual/cadastro?codigo=${item.codigo}&modo=visualizar`"
                  class="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all active:scale-95 shadow-sm"
                  title="Ver Detalhes">
                  <Icon name="fa7-solid:eye" class="w-4 h-4" />
                </NuxtLink>
                <button @click="abrirModalFuncionarios(item.codigo)"
                  :disabled="item.funcionario !== 1"
                  class="w-10 h-10 flex items-center justify-center transition-all active:scale-95 rounded-xl shadow-sm"
                  :class="item.funcionario === 1 ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20' : 'text-gray-300 opacity-40 cursor-not-allowed'"
                  title="Funcionários">
                  <Icon name="fa7-solid:users" class="w-4 h-4" />
                </button>
                <button @click="abrirModalDetalhes(item.codigo)"
                  class="w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-all active:scale-95 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  title="Mais Detalhes">
                  <Icon name="fa7-solid:indent" class="w-4 h-4" />
                </button>
             </div>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.projeto" subtituloNome="Conta" :subtituloValor="item.contaVinculada"
            :ativo="true" :mostrarStatus="false" :mostrarHistorico="false"
            :detalhes="[
              { icone: 'fa7-solid:money-bill-transfer', texto: `R$ ${formatarMoeda(item.valorMovimentacao)}` },
              { icone: 'fa7-solid:calendar-day', texto: item.dataMovimentacao },
              { icone: 'fa7-solid:tag', texto: item.tipoMovimentacao }
            ]" @ver-detalhes="abrirModalDetalhes(item.codigo)"
            @clique-titulo="navigateTo(`/operacao/movimentacaoBancaria/lancamentoManual/cadastro?codigo=${item.codigo}`)" />
        </template>
      </AppContainerListagem>
    </AppFiltro>

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      <AppSelect v-model="filtro.tipoMovimentacaoParam" label="Tipo de Movimentação" :opcoes="tiposMovimentacao" itemValue="codigo" itemLabel="descricao" icone="fa7-solid:filter" />
      <AppSelect v-model="filtro.ativoParam" label="Status do Lançamento" 
        :opcoes="[{ codigo: '1', descricao: 'Ativos' }, { codigo: '0', descricao: 'Inativos' }, { codigo: '', descricao: 'Todos' }]" 
        itemValue="codigo" itemLabel="descricao" icone="fa7-solid:shield-check" />
    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

    <AppModalDetalhes 
      :aberto="modalDetalhesAberto" 
      :dados="detalhes" 
      @close="modalDetalhesAberto = false" 
    />

    <AppModal :isOpen="modalFuncionarioAberto" title="Funcionários Vinculados" icon="fa7-solid:users" @close="modalFuncionarioAberto = false" tamanho="sm">
      <div class="p-2">
        <div v-if="listaFuncionariosModal.length > 0" class="divide-y divide-gray-50 dark:divide-gray-800 px-4">
          <div v-for="(func, index) in listaFuncionariosModal" :key="index" class="py-4 flex items-center gap-3 group">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 group-hover:bg-emerald-500/20 transition-all text-emerald-600 font-black text-sm uppercase">
               {{ func.funcionario.charAt(0) }}
            </div>
            <span class="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-tight">{{ func.funcionario }}</span>
          </div>
        </div>
        <div v-else class="py-12 flex flex-col items-center text-center gap-4 text-gray-500 dark:text-gray-400">
           <Icon name="fa7-solid:circle-exclamation" class="w-12 h-12 text-amber-500 opacity-20" />
           <p class="font-black uppercase tracking-tighter text-lg text-gray-400">Projeto Global</p>
           <p class="font-bold text-xs max-w-[200px]">Este lançamento foi aplicado a todos os funcionários vinculados ao projeto.</p>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalFuncionarioAberto = false" class="w-full h-12 uppercase text-[10px] font-black tracking-widest">Fechar Painel</AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, 
  buscarLista, abrirModalFiltroAvancado, modalFiltroAvancadoAberto, limparFiltrosAvancados, aplicarFiltroAvancado,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  tiposMovimentacao, modalDetalhesAberto, detalhes, modalFuncionarioAberto, listaFuncionariosModal,
  abrirModalDetalhes, abrirModalFuncionarios, formatarMoeda, novoRegistro,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina,
  // Autocomplete Projetos
  projetoSearch, sugestoesProjetos, buscandoProjetos, mostrarMenuProjetos,
  buscarProjetosAutocomplete, selecionarProjetoAutocomplete, fecharSugestoesDelay
} = useLancamentoManualListagem()

const { dispararAlerta } = useAppNotificacao()

const camposFiltro = computed(() => [
  {
    key: 'dataInicioParam',
    label: 'Início',
    type: 'text' as const,
    placeholder: 'Data Início',
    mask: '##/##/####',
    icon: 'fa7-solid:calendar-day',
    colSpan: 'md:col-span-2',
    required: true
  },
  {
    key: 'dataFimParam',
    label: 'Fim',
    type: 'text' as const,
    placeholder: 'Data Fim',
    mask: '##/##/####',
    icon: 'fa7-solid:calendar-day',
    colSpan: 'md:col-span-2',
    required: true
  },
  { 
    key: 'projetoId', 
    label: 'Projeto', 
    type: 'autocomplete' as const, 
    placeholder: 'Buscar projeto...',
    sugestoes: sugestoesProjetos.value,
    buscando: buscandoProjetos.value,
    mostrarMenu: mostrarMenuProjetos.value,
    colSpan: 'md:col-span-5'
  }
])

const tentarBuscar = () => {
  if (!filtro.value.dataInicioParam || !filtro.value.dataFimParam) {
    dispararAlerta('Campos Obrigatórios', 'As datas de início e fim são obrigatórias para a busca.', 'warning')
    return
  }
  buscarLista()
}

const gerarExcel = () => {
    dispararAlerta('Relatório Excel', 'A geração do relatório excel foi iniciada e será baixada em instantes.', 'info')
}

const gerarPdf = () => {
    dispararAlerta('Relatório PDF', 'A geração do relatório PDF foi iniciada e será baixada em instantes.', 'info')
}
</script>