<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100 font-bold">

    <AppFiltro v-model="filtro" v-model:viewMode="visaoAtual" :campos="camposFiltro" titulo="Lançamento Estorno"
      descricao="Gerencie estornos de movimentações manuais e reembolsos" icone-titulo="fa7-solid:reply"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Operação' }, { label: 'Tesouraria' }, { label: 'Estorno' }]"
      :pending="carregando" @buscar="tentarBuscar" @openAdvancedFilter="abrirModalFiltroAvancado"
      @buscarSugestao="buscarSugestoesProjeto"
      @selecionarSugestao="({ sugestao }) => selecionarProjetoAutocomplete(sugestao)"
      @fecharSugestao="fecharSugestoesDelay">
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop"
          @click="visaoAtual = visaoAtual === 'lista' ? 'cards' : 'lista'">Controle de Exibição</AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="novoEstorno">
          Novo Estorno
        </AppBotao>
      </template>

      <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
        v-model:filtro-global="filtroGlobal"
        :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
        :view="false" :edit="false"
        @mudarItensPorPagina="mudarItensPorPagina">

        <template #cabecalho-tabela>
          <th v-if="colunas.projeto" scope="col"
            class="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Projeto / Conta</th>
          <th v-if="colunas.tipoLancamento" scope="col"
            class="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Origem</th>
          <th v-if="colunas.tipoMovimentacao" scope="col"
            class="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Movimentação</th>
          <th v-if="colunas.valor" scope="col"
            class="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Valor</th>
          <th v-if="colunas.data" scope="col"
            class="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Data</th>
          <th v-if="colunas.classificacao" scope="col"
            class="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Classificação</th>
          <th v-if="colunas.acoes" scope="col"
            class="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center w-32">Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.projeto" class="p-4">
            <div class="flex flex-col">
              <span 
                @click="navegarParaCadastro(item.codigo, item.tipoLancamento)"
                class="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors"
              >
                {{ item.apelido }} - {{ item.projeto }}
              </span>
              <span class="text-[11px] text-gray-400 font-bold uppercase tracking-tighter opacity-70">
                {{ item.contaVinculada }}
              </span>
            </div>
          </td>
          <td v-if="colunas.tipoLancamento" class="p-4 text-center">
            <span
              class="text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 whitespace-nowrap">
              {{ item.tipoLancamento === 2 ? 'Manual' : 'Reembolso' }}
            </span>
          </td>
          <td v-if="colunas.tipoMovimentacao" class="p-4 text-center">
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">{{
              item.tipoMovimentacao }}</span>
          </td>
          <td v-if="colunas.valor"
            class="p-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            <span class="whitespace-nowrap px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              R$ {{ formatarMoeda(item.valorMovimentacao) }}
            </span>
          </td>
          <td v-if="colunas.data" class="p-4 text-center text-xs font-bold text-gray-500 tabular-nums whitespace-nowrap">
            {{ item.dataMovimentacao }}
          </td>
          <td v-if="colunas.classificacao"
            class="p-4 text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest text-center">
            {{ item.classificacao }}
          </td>
          <td v-if="colunas.acoes" class="p-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button @click="navegarParaCadastro(item.codigo, item.tipoLancamento)" title="Ver Cadastro"
                class="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all active:scale-95 shadow-sm border border-blue-200/50 dark:border-blue-700/30">
                <Icon name="fa7-solid:eye" class="w-4 h-4" />
              </button>

              <button @click="abrirModalFuncionarios(item.codigo, item.tipoLancamento, item.codigoProjeto)" title="Ver Funcionários"
                class="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all active:scale-95 shadow-sm border border-blue-200/50 dark:border-blue-700/30">
                <Icon name="fa7-solid:users" class="w-4 h-4" />
              </button>

              <button @click="abrirModalDetalhes(item.codigo, item.tipoLancamento)" title="Mais Detalhes"
                class="w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-all active:scale-95 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <Icon name="fa7-solid:indent" class="w-4 h-4" />
              </button>
              
              <button v-if="item.estorno === 0" @click="prepararEstorno(item)" title="Realizar Estorno"
                class="w-10 h-10 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 rounded-xl transition-all active:scale-95 shadow-sm border border-rose-200/50 dark:border-rose-700/30">
                <Icon name="fa7-solid:reply" class="w-4 h-4" />
              </button>
              
              <div v-else class="w-10 h-10 flex items-center justify-center text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shadow-sm border border-emerald-500/20" title="Já Estornado">
                <Icon name="fa7-solid:circle-check" class="w-4 h-4" />
              </div>
            </div>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.projeto"
            :subtituloNome="item.tipoLancamento === 2 ? 'Lançamento' : 'Reembolso'"
            :subtituloValor="item.dataMovimentacao" :ativo="item.estorno === 0" :mostrarStatus="false"
            :mostrarHistorico="false" :detalhes="[
              { icone: 'fa7-solid:building-columns', texto: item.contaVinculada },
              { icone: 'fa7-solid:money-bill-transfer', texto: `R$ ${formatarMoeda(item.valorMovimentacao)}` },
              { icone: 'fa7-solid:tag', texto: item.tipoMovimentacao }
            ]" @ver-detalhes="abrirModalFuncionarios(item.codigo, item.tipoLancamento, item.codigoProjeto)">
            <template #footer-actions>
              <AppBotao v-if="item.estorno === 0" variacao="padrao" icone="fa7-solid:reply" class="flex-1"
                @click="prepararEstorno(item)">Estornar</AppBotao>
              <span v-else
                class="text-xs font-black uppercase text-emerald-500 flex items-center gap-2 mx-auto py-3 tracking-widest">
                <Icon name="fa7-solid:check" /> Estornado
              </span>
            </template>
          </AppCardListagem>
        </template>
      </AppContainerListagem>
    </AppFiltro>

    <!-- Modais -->
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

    <AppModalMotivoEstorno 
        :aberto="modalEstornoAberto"
        v-model:motivo="estornoObj.motivo"
        :data-programada="dataEstornoDisplay"
        @close="modalEstornoAberto = false"
        @avancar="vaiParaPin"
    />

    <AppModalAssinaturaEletronica
        :aberto="modalPinAberto"
        v-model:pin="estornoObj.pin"
        :carregando="processandoEstorno"
        label-botao="Confirmar Estorno"
        @close="modalPinAberto = false"
        @confirmar="tentarFinalizar"
    />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      <AppSelect v-model="filtro.funcionarioParam" label="Funcionário"
        :opcoes="funcionariosAtivos.map(f => ({ codigo: f.codigo, descricao: f.nomeCompleto }))" />
      <AppSelect v-model="filtro.tipoLancamentoParam" label="Origem do Lançamento"
        :opcoes="[{ codigo: '2', descricao: 'Manual' }, { codigo: '3', descricao: 'Reembolso' }]" />
      <AppSelect v-model="filtro.estornadoParam" label="Status do Estorno"
        :opcoes="[{ codigo: '0', descricao: 'Não Estornado' }, { codigo: '1', descricao: 'Estornado' }]" />
    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, filtroGlobal, buscarLista,
  abrirModalFiltroAvancado, modalFiltroAvancadoAberto, limparFiltrosAvancados, aplicarFiltroAvancado,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  projetosAtivos, funcionariosAtivos,
  // Autocomplete Projeto
  sugestoesProjetos, buscandoSugestoes, mostrandoSugestoes,
  buscarSugestoesProjeto, selecionarProjetoAutocomplete, fecharSugestoesDelay,
  placeholderDinamico,
  modalFuncionarioAberto, listaFuncionariosModal, abrirModalFuncionarios,
  modalDetalhesAberto, detalhes, abrirModalDetalhes,
  modalEstornoAberto, modalPinAberto, mostrarPin, processandoEstorno, dataEstornoDisplay, estornoObj,
  prepararEstorno, avancarParaPin, finalizarEstorno,
  formatarMoeda,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useLancamentoEstornoListagem()

const { dispararAlerta } = useAppNotificacao()

const camposFiltro = computed(() => [
  {
    key: 'projetoNomeParam',
    label: 'Projeto',
    type: 'autocomplete' as const,
    placeholder: placeholderDinamico.value,
    sugestoes: sugestoesProjetos.value,
    buscando: buscandoSugestoes.value,
    mostrarMenu: mostrandoSugestoes.value
  },
  {
    key: 'dataInicioParam',
    label: 'Início',
    type: 'text' as const,
    placeholder: 'Data Início',
    mask: '##/##/####',
    icon: 'fa7-solid:calendar-day'
  },
  {
    key: 'dataFimParam',
    label: 'Fim',
    type: 'text' as const,
    placeholder: 'Data Fim',
    mask: '##/##/####',
    icon: 'fa7-solid:calendar-day'
  }
])

const tentarBuscar = async () => {
  await buscarLista()
}

const navegarParaCadastro = (codigo: number, tipo: number) => {
  const modulo = tipo === 2 ? 'lancamentoManual' : 'lancamentoReembolso'
  navigateTo(`/operacao/movimentacaoBancaria/${modulo}/cadastro?codigo=${codigo}`)
}

const vaiParaPin = () => {
  const res = avancarParaPin()
  if (res === 'motivo_obrigatorio') {
    dispararAlerta('Atenção', 'É necessário informar o motivo do estorno para prosseguir.', 'warning')
  }
}

const tentarFinalizar = async () => {
  const res = await finalizarEstorno()
  if (res === 'pin_obrigatorio') {
    dispararAlerta('Validação', 'O PIN de segurança é obrigatório!', 'error')
  } else if (res === 'pin_incorreto') {
    dispararAlerta('Erro', 'PIN de segurança inválido. Verifique seus dados.', 'error')
  } else if (res === 'sucesso') {
    // O composable já fecha o modal e recarrega a lista
  } else if (res === 'erro_interno') {
    dispararAlerta('Erro', 'Não foi possível processar o estorno no momento.', 'error')
  } else if (res) {
    dispararAlerta('Erro', res, 'error')
  }
}

const gerarExcel = () => {
  alert('📊 Gerando relatório de estornos (Excel)...')
}

const novoEstorno = () => {
  navigateTo('/operacao/movimentacaoBancaria/lancamentoEstorno/cadastro?codigo=0')
}
</script>