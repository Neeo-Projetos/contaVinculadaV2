<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Lançamento" tituloGrosso="Estorno"
      descricao="Gerencie estornos de movimentações manuais e reembolsos" icone="fa7-solid:reply" />

    <div
      class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="flex flex-col xl:flex-row items-center gap-4">
        <div class="flex-1 w-full text-left">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AppInputTexto v-model="filtro.dataInicioParam" label="Data Início" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-day" />
            <AppInputTexto v-model="filtro.dataFimParam" label="Data Fim" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-day" />
            <AppSelect v-model="filtro.projetoParam" label="Projeto" :opcoes="projetosAtivos.map(p => ({ codigo: p.codigo, descricao: `${p.apelido} - ${p.descricao}` }))" />
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto shrink-0 mt-4 xl:mt-0">
          <div
            class="flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            <button @click="visaoAtual = 'lista'"
              :class="visaoAtual === 'lista' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-bold'"
              class="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2">
              <Icon name="fa7-solid:list-ul" class="w-4 h-4" /> Lista
            </button>
            <button @click="visaoAtual = 'cards'"
              :class="visaoAtual === 'cards' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-bold'"
              class="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2">
              <Icon name="fa7-solid:border-all" class="w-4 h-4" /> Cards
            </button>
          </div>

          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden xl:block mx-1"></div>

          <AppBotao variacao="padrao" icone="fa7-solid:table-columns" @click="abrirModalExibicao">Exibição</AppBotao>
          <AppBotao variacao="padrao" icone="fa7-solid:filter" @click="abrirModalFiltroAvancado">Filtros Avançados
          </AppBotao>
        </div>
      </div>

      <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

      <div class="flex flex-col sm:flex-row items-center justify-end gap-4">
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="tentarBuscar">
          Pesquisar Lançamentos
        </AppBotao>
      </div>
    </div>

    <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
      :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
      :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
      :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
      @mudarItensPorPagina="mudarItensPorPagina">

      <template #cabecalho-tabela>
        <th v-if="colunas.projeto" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Projeto</th>
        <th v-if="colunas.conta" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Conta</th>
        <th v-if="colunas.tipoLancamento" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Origem</th>
        <th v-if="colunas.tipoMovimentacao" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Movimentação</th>
        <th v-if="colunas.valor" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Valor</th>
        <th v-if="colunas.data" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Data</th>
        <th v-if="colunas.classificacao" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Classificação</th>
        <th v-if="colunas.funcionarios" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Gerenciar</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td v-if="colunas.projeto" class="px-6 py-4">
          <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ item.projeto }}</span>
        </td>
        <td v-if="colunas.conta" class="px-6 py-4">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.contaVinculada }}</span>
        </td>
        <td v-if="colunas.tipoLancamento" class="px-6 py-4 text-center">
          <span class="text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
            {{ item.tipoLancamento === 2 ? 'Manual' : 'Reembolso' }}
          </span>
        </td>
        <td v-if="colunas.tipoMovimentacao" class="px-6 py-4 text-center">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.tipoMovimentacao }}</span>
        </td>
        <td v-if="colunas.valor" class="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
          R$ {{ formatarMoeda(item.valorMovimentacao) }}
        </td>
        <td v-if="colunas.data" class="px-6 py-4 text-center text-xs font-bold text-gray-500">
          {{ item.dataMovimentacao }}
        </td>
        <td v-if="colunas.classificacao" class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
          {{ item.classificacao }}
        </td>
        <td v-if="colunas.funcionarios" class="px-6 py-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <button @click="abrirModalFuncionarios(item.codigo, item.tipoLancamento)"
              title="Ver Funcionários"
              class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all">
              <Icon name="fa7-solid:users" class="w-5 h-5" />
            </button>
            <button v-if="item.estorno === 0" @click="prepararEstorno(item)"
              title="Realizar Estorno"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
              <Icon name="fa7-solid:reply" class="w-5 h-5" />
            </button>
            <span v-else class="p-2 text-gray-300 cursor-not-allowed" title="Já Estornado">
               <Icon name="fa7-solid:circle-check" class="w-5 h-5" />
            </span>
          </div>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.projeto" :subtituloNome="item.tipoLancamento === 2 ? 'Lançamento' : 'Reembolso'" :subtituloValor="item.dataMovimentacao"
          :ativo="item.estorno === 0" :mostrarStatus="false" :mostrarHistorico="false"
          :detalhes="[
            { icone: 'fa7-solid:building-columns', texto: item.contaVinculada },
            { icone: 'fa7-solid:money-bill-transfer', texto: `R$ ${formatarMoeda(item.valorMovimentacao)}` },
            { icone: 'fa7-solid:tag', texto: item.tipoMovimentacao }
          ]" 
          @ver-detalhes="abrirModalFuncionarios(item.codigo, item.tipoLancamento)">
          <template #footer-actions>
             <AppBotao v-if="item.estorno === 0" variacao="padrao" icone="fa7-solid:reply" class="flex-1" @click="prepararEstorno(item)">Estornar</AppBotao>
             <span v-else class="text-xs font-bold text-emerald-500 flex items-center gap-1 mx-auto py-2"><Icon name="fa7-solid:check" /> Estornado</span>
          </template>
        </AppCardListagem>
      </template>

    </AppContainerListagem>

    <!-- Modais -->
    <AppModal :isOpen="modalFuncionarioAberto" title="Funcionários Vinculados" icon="fa7-solid:users" @close="modalFuncionarioAberto = false" tamanho="sm">
      <div class="p-2">
        <div v-if="listaFuncionariosModal.length > 0" class="divide-y divide-gray-50 dark:divide-gray-800">
          <div v-for="(func, index) in listaFuncionariosModal" :key="index" class="py-4 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Icon name="fa7-solid:user-check" class="w-3 h-3 text-emerald-600" />
            </div>
            <span class="font-bold text-gray-700 dark:text-gray-300 text-sm">{{ func.funcionario }}</span>
          </div>
        </div>
        <div v-else class="py-12 flex flex-col items-center text-center gap-4 text-gray-500 dark:text-gray-400">
           <Icon name="fa7-solid:circle-nodes" class="w-12 h-12 text-blue-500" />
           <p class="font-bold">Lançamento feito para todos funcionários do projeto.</p>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalFuncionarioAberto = false" class="w-full">Fechar</AppBotao>
      </template>
    </AppModal>

    <AppModal :isOpen="modalEstornoAberto" title="Motivo do Estorno" icon="fa7-solid:pen-fancy" @close="modalEstornoAberto = false" tamanho="sm">
      <div class="p-4 space-y-4">
        <div>
          <label class="text-[10px] font-black uppercase text-gray-400 mb-2 block">Descreva o motivo</label>
          <textarea v-model="estornoObj.motivo" rows="4" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Justifique o estorno..."></textarea>
        </div>
        <div class="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center gap-3">
           <Icon name="fa7-solid:clock" class="text-amber-500" />
           <span class="text-xs font-bold text-amber-700 dark:text-amber-500">{{ dataEstornoDisplay }}</span>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalEstornoAberto = false">Cancelar</AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:shield-halved" @click="vaiParaPin">Avançar para PIN</AppBotao>
      </template>
    </AppModal>

    <AppModal :isOpen="modalPinAberto" title="Segurança" icon="fa7-solid:lock" @close="modalPinAberto = false" tamanho="sm">
      <div class="p-6 text-center space-y-6">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Digite seu PIN de segurança para processar o estorno.</p>
        <div class="relative group">
          <input :type="mostrarPin ? 'text' : 'password'" v-model="estornoObj.pin" maxlength="6"
            class="w-full h-16 text-center text-3xl font-black tracking-[1em] bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-emerald-500 outline-none transition-all" />
          <button @click="mostrarPin = !mostrarPin" class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-emerald-500">
             <Icon :name="mostrarPin ? 'fa7-solid:eye-slash' : 'fa7-solid:eye'" class="w-5 h-5" />
          </button>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="perigo" :carregando="processandoEstorno" class="w-full" @click="tentarFinalizar">
           {{ processandoEstorno ? 'Processando...' : 'Confirmar Estorno' }}
        </AppBotao>
      </template>
    </AppModal>

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      <AppSelect v-model="filtro.funcionarioParam" label="Funcionário" :opcoes="funcionariosAtivos.map(f => ({ codigo: f.codigo, descricao: f.nomeCompleto }))" />
      <AppSelect v-model="filtro.tipoLancamentoParam" label="Origem do Lançamento" :opcoes="[{ codigo: '2', descricao: 'Manual' }, { codigo: '3', descricao: 'Reembolso' }]" />
      <AppSelect v-model="filtro.estornadoParam" label="Status do Estorno" :opcoes="[{ codigo: '0', descricao: 'Não Estornado' }, { codigo: '1', descricao: 'Estornado' }]" />
    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

    <AppModal :isOpen="modalAlertaAberto" title="Atenção" icon="fa7-solid:circle-exclamation" @close="modalAlertaAberto = false" tamanho="sm">
      <div class="p-6 text-center">
         <p class="text-gray-700 dark:text-gray-300 font-medium">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="modalAlertaAberto = false" class="w-full">Entendi</AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, buscarLista,
  abrirModalFiltroAvancado, modalFiltroAvancadoAberto, limparFiltrosAvancados, aplicarFiltroAvancado,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  projetosAtivos, funcionariosAtivos,
  modalFuncionarioAberto, listaFuncionariosModal, abrirModalFuncionarios,
  modalEstornoAberto, modalPinAberto, mostrarPin, processandoEstorno, dataEstornoDisplay, estornoObj,
  prepararEstorno, avancarParaPin, finalizarEstorno,
  formatarMoeda,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useLancamentoEstornoListagem()

const modalAlertaAberto = ref(false)
const modalAlertaMensagem = ref('')

const tentarBuscar = async () => {
  const res = await buscarLista()
  if (res === 'datas_obrigatorias') {
    modalAlertaMensagem.value = 'Informe a Data Início e Data Fim para realizar a busca.'
    modalAlertaAberto.value = true
  }
}

const vaiParaPin = () => {
  const res = avancarParaPin()
  if (res === 'motivo_obrigatorio') {
    modalAlertaMensagem.value = 'Digite o motivo do estorno!'
    modalAlertaAberto.value = true
  }
}

const tentarFinalizar = async () => {
  const res = await finalizarEstorno()
  if (res === 'pin_obrigatorio') {
    modalAlertaMensagem.value = 'Insira seu PIN para confirmar!'
    modalAlertaAberto.value = true
  } else if (res === 'pin_incorreto') {
    modalAlertaMensagem.value = 'PIN Incorreto!'
    modalAlertaAberto.value = true
  } else if (res === 'sucesso') {
     // O composable já fecha o modal e recarrega a lista
  } else if (res === 'erro_interno') {
    modalAlertaMensagem.value = 'Erro interno ao realizar o estorno.'
    modalAlertaAberto.value = true
  } else if (res) {
    modalAlertaMensagem.value = res
    modalAlertaAberto.value = true
  }
}
</script>