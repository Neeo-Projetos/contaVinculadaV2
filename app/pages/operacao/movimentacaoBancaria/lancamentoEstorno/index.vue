<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100 font-bold">

    <AppFiltro v-model="filtro" v-model:viewMode="visaoAtual" :campos="camposFiltro" titulo="Lançamento Estorno"
      descricao="Gerencie estornos de movimentações manuais e reembolsos" icone-titulo="fa7-solid:reply"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Operação' }, { label: 'Tesouraria' }, { label: 'Estorno' }]"
      :pending="carregando" @buscar="tentarBuscar" @openAdvancedFilter="abrirModalFiltroAvancado"
      @buscarSugestao="buscarProjetosAutocomplete"
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
        :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
        :view="false" :edit="false"
        @mudarItensPorPagina="mudarItensPorPagina">

        <template #cabecalho-tabela>
          <th v-if="colunas.projeto" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-left">Projeto</th>
          <th v-if="colunas.conta" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-left">Conta</th>
          <th v-if="colunas.tipoLancamento" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Origem</th>
          <th v-if="colunas.tipoMovimentacao" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Movimentação</th>
          <th v-if="colunas.valor" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Valor</th>
          <th v-if="colunas.data" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Data</th>
          <th v-if="colunas.classificacao" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-left">Classificação</th>
          <th v-if="colunas.acoes" scope="col"
            class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center w-32">Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.projeto" class="px-6 py-4">
            <span class="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ item.projeto
              }}</span>
          </td>
          <td v-if="colunas.conta" class="px-6 py-4">
            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium italic">{{ item.contaVinculada }}</span>
          </td>
          <td v-if="colunas.tipoLancamento" class="px-6 py-4 text-center">
            <span
              class="text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              {{ item.tipoLancamento === 2 ? 'Manual' : 'Reembolso' }}
            </span>
          </td>
          <td v-if="colunas.tipoMovimentacao" class="px-6 py-4 text-center">
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">{{
              item.tipoMovimentacao }}</span>
          </td>
          <td v-if="colunas.valor"
            class="px-6 py-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            R$ {{ formatarMoeda(item.valorMovimentacao) }}
          </td>
          <td v-if="colunas.data" class="px-6 py-4 text-center text-xs font-bold text-gray-500 tabular-nums">
            {{ item.dataMovimentacao }}
          </td>
          <td v-if="colunas.classificacao"
            class="px-6 py-4 text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">
            {{ item.classificacao }}
          </td>
          <td v-if="colunas.acoes" class="px-6 py-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button @click="abrirModalFuncionarios(item.codigo, item.tipoLancamento)" title="Ver Funcionários"
                class="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all active:scale-95 shadow-sm">
                <Icon name="fa7-solid:users" class="w-4 h-4" />
              </button>

              <button @click="abrirModalDetalhes(item.codigo, item.tipoLancamento)" title="Mais Detalhes"
                class="w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl transition-all active:scale-95 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <Icon name="fa7-solid:indent" class="w-4 h-4" />
              </button>
              
              <button v-if="item.estorno === 0" @click="prepararEstorno(item)" title="Realizar Estorno"
                class="w-10 h-10 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 rounded-xl transition-all active:scale-95 shadow-sm">
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
            ]" @ver-detalhes="abrirModalFuncionarios(item.codigo, item.tipoLancamento)">
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

    <AppModal :isOpen="modalFuncionarioAberto" title="Funcionários Vinculados" icon="fa7-solid:users"
      @close="modalFuncionarioAberto = false" tamanho="sm">
      <div class="p-2">
        <div v-if="listaFuncionariosModal.length > 0" class="divide-y divide-gray-50 dark:divide-gray-800 px-4">
          <div v-for="(func, index) in listaFuncionariosModal" :key="index" class="py-4 flex items-center gap-4 group">
            <div
              class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 group-hover:bg-emerald-500/20 transition-all font-black text-sm text-emerald-600 uppercase">
              {{ func.funcionario.charAt(0).toUpperCase() }}
            </div>
            <span class="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-tight">{{
              func.funcionario
              }}</span>
          </div>
        </div>
        <div v-else class="py-12 flex flex-col items-center text-center gap-4 text-gray-500 dark:text-gray-400">
          <Icon name="fa7-solid:circle-nodes" class="w-16 h-16 text-blue-500/20" />
          <p class="font-black text-lg uppercase tracking-tighter text-gray-400">Projeto Global</p>
          <p class="font-bold text-xs max-w-[200px]">Este lançamento foi aplicado a todos os funcionários vinculados ao
            projeto.</p>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalFuncionarioAberto = false"
          class="w-full h-12 font-black uppercase tracking-widest text-[10px]">Fechar Painel</AppBotao>
      </template>
    </AppModal>

    <AppModal :isOpen="modalEstornoAberto" title="Motivo do Estorno" icon="fa7-solid:pen-fancy"
      @close="modalEstornoAberto = false" tamanho="sm">
      <div class="p-6 space-y-6">
        <div>
          <label class="text-[10px] font-black uppercase text-gray-400 mb-3 block tracking-widest">Justificativa
            Operacional</label>
          <textarea v-model="estornoObj.motivo" rows="4"
            class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none placeholder:font-medium"
            placeholder="Descreva detalhadamente o motivo da reversão..."></textarea>
        </div>
        <div
          class="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-4">
          <Icon name="fa7-solid:clock-rotate-left" class="text-amber-500 w-5 h-5 shrink-0" />
          <div class="flex flex-col">
            <span class="text-[8px] font-black text-amber-600 uppercase tracking-widest">Data Programada</span>
            <span class="text-xs font-black text-amber-700 dark:text-amber-500 tabular-nums uppercase">{{
              dataEstornoDisplay
              }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3 w-full">
          <AppBotao variacao="padrao" @click="modalEstornoAberto = false"
            class="flex-1 font-black uppercase tracking-widest text-[10px]">Cancelar</AppBotao>
          <AppBotao variacao="primario" icone="fa7-solid:shield-halved" @click="vaiParaPin"
            class="flex-1 font-black uppercase tracking-widest text-[10px]">Avançar para PIN</AppBotao>
        </div>
      </template>
    </AppModal>

    <AppModal :isOpen="modalPinAberto" title="Assinatura Eletrônica" icon="fa7-solid:lock"
      @close="modalPinAberto = false" tamanho="sm">
      <div class="p-8 text-center space-y-8">
        <div class="space-y-2">
          <p class="text-gray-700 dark:text-gray-300 font-bold text-sm">Confirmação de Segurança</p>
          <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Insira seu PIN operacional para
            processar
          </p>
        </div>
        <div class="relative group">
          <input :type="mostrarPin ? 'text' : 'password'" v-model="estornoObj.pin" maxlength="6"
            class="w-full h-20 text-center text-4xl font-black tracking-[0.8em] bg-gray-50 dark:bg-gray-900/80 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] focus:border-emerald-500 outline-none transition-all shadow-inner pl-6" />
          <button @click="mostrarPin = !mostrarPin"
            class="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-emerald-500 transition-colors">
            <Icon :name="mostrarPin ? 'fa7-solid:eye-slash' : 'fa7-solid:eye'" class="w-5 h-5" />
          </button>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="perigo" :carregando="processandoEstorno"
          class="w-full h-14 font-black uppercase tracking-[0.2em]" @click="tentarFinalizar">
          {{ processandoEstorno ? 'PROCESSANDO...' : 'CONFIRMAR ESTORNO' }}
        </AppBotao>
      </template>
    </AppModal>

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
  carregando, buscaRealizada, visaoAtual, dados, filtro, buscarLista,
  abrirModalFiltroAvancado, modalFiltroAvancadoAberto, limparFiltrosAvancados, aplicarFiltroAvancado,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  projetosAtivos, funcionariosAtivos,
  // Autocomplete Projeto
  projetoSearch, sugestoesProjetos, buscandoProjetos, mostrarMenuProjetos,
  buscarProjetosAutocomplete, selecionarProjetoAutocomplete, fecharSugestoesDelay,
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
    key: 'projetoParam',
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

const tentarBuscar = async () => {
  await buscarLista()
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