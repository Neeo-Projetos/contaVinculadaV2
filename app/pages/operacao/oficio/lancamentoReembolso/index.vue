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
      @buscar="buscarLista"
      @openAdvancedFilter="abrirModalExibicao"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="visaoAtual = visaoAtual === 'lista' ? 'cards' : 'lista'">Controle de Exibição</AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:file-circle-plus" @click="novoRegistro">
          Novo Lançamento
        </AppBotao>
      </template>

      <AppContainerListagem 
        :carregando="carregando" 
        :buscaRealizada="buscaRealizada" 
        :lista="dados || []"
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
      >
        <template #cabecalho-tabela>
          <th v-if="colunas.projeto" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Projeto</th>
          <th v-if="colunas.contaVinculada" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Conta Vinculada</th>
          <th v-if="colunas.tipoMov" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tipo Mov.</th>
          <th v-if="colunas.vlrMov" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Vlr Mov.</th>
          <th v-if="colunas.dataOficio" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data Ofício</th>
          <th v-if="colunas.status" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
          <th v-if="colunas.acoes" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.projeto" class="p-4">
            <NuxtLink :to="`/operacao/oficio/lancamentoReembolso/cadastro?id=${item.codigo}`" class="font-bold text-sm text-gray-800 dark:text-gray-200 hover:text-emerald-500 transition-colors uppercase">
              {{ item.projeto }}
            </NuxtLink>
          </td>
          <td v-if="colunas.contaVinculada" class="p-4 text-sm font-medium text-gray-500 dark:text-gray-400 italic">
            {{ item.contaVinculada }}
          </td>
          <td v-if="colunas.tipoMov" class="p-4 text-center">
              <span class="text-[10px] bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                {{ item.tipoMovimentacao }}
              </span>
          </td>
          <td v-if="colunas.vlrMov" class="p-4 text-center font-black text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
            R$ {{ item.valorMovimentacao }}
          </td>
          <td v-if="colunas.dataOficio" class="p-4 text-center text-xs font-bold text-gray-500">
            {{ item.dataOficio }}
          </td>
          <td v-if="colunas.status" class="p-4 text-center">
            <span :class="item.status === 'Aprovado' || item.status === 'Liquidado' ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' : 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'" class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border">
              {{ item.status }}
            </span>
          </td>
          <td v-if="colunas.acoes" class="p-4 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button @click="abrirModalFuncionarios(item.codigo)" 
                :class="item.funcionario === 1 ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10' : 'text-gray-300 opacity-40 cursor-not-allowed'" 
                class="p-2 rounded-xl transition-all" title="Funcionários">
                <Icon name="fa7-solid:users" class="w-4 h-4" />
              </button>
              <button @click="abrirModalDetalhes(item.codigo)" 
                class="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ver Detalhes">
                <Icon name="fa7-solid:circle-info" class="w-4 h-4" />
              </button>
              <button @click="gerarPdfOficio(item.codigo)" 
                class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all" title="PDF Ofício">
                <Icon name="fa7-solid:file-pdf" class="w-4 h-4" />
              </button>
              <button @click="verHistorico" 
                class="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all" title="Histórico">
                <Icon name="fa6-solid:history" class="w-4 h-4" />
              </button>
              <NuxtLink :to="`/operacao/oficio/lancamentoReembolso/cadastro?id=${item.codigo}`"
                class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Editar">
                <Icon name="fa7-solid:pen-to-square" class="w-4 h-4" />
              </NuxtLink>
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
              { icone: 'fa7-solid:hashtag', texto: `Tipo: ${item.tipoMovimentacao}` },
              { icone: 'fa7-solid:calendar-check', texto: `Ofício: ${item.dataOficio}` },
              { icone: 'fa7-solid:clock-rotate-left', texto: `Status: ${item.status}` }
            ]" 
            @ver-detalhes="abrirModalDetalhes(item.codigo)"
            @clique-titulo="navigateTo(`/operacao/oficio/lancamentoReembolso/cadastro?id=${item.codigo}`)" 
          />
        </template>
      </AppContainerListagem>
    </AppFiltro>

    <AppModal 
        :isOpen="modalDetalhesAberto" 
        title="Detalhes do Lançamento" 
        icon="fa7-solid:circle-info"
        @close="modalDetalhesAberto = false"
    >
      <div class="space-y-6 p-6 font-bold">
          <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Motivo / Justificativa</h4>
              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {{ detalhes.motivo || 'Motivo não informado.' }}
              </p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col gap-1">
                  <span class="text-[8px] font-black text-blue-500 uppercase tracking-widest leading-none">Cadastrado por</span>
                  <span class="text-xs font-black text-blue-700 dark:text-blue-400 uppercase">{{ detalhes.usuarioCadastro }}</span>
              </div>
              <div class="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col gap-1">
                  <span class="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Data Cadastro</span>
                  <span class="text-xs font-black text-emerald-700 dark:text-emerald-400">{{ detalhes.dataCadastro }}</span>
              </div>
          </div>
      </div>
      <template #footer>
          <AppBotao variacao="padrao" @click="modalDetalhesAberto = false" class="w-full h-12 uppercase text-[10px] font-black tracking-widest">Fechar Detalhes</AppBotao>
      </template>
    </AppModal>

    <AppModal 
        :isOpen="modalFuncionarioAberto" 
        title="Funcionários do Lançamento" 
        icon="fa7-solid:users"
        @close="modalFuncionarioAberto = false"
    >
      <div class="p-6">
        <div v-if="listaFuncionariosModal.length > 0" class="space-y-3">
            <div v-for="(func, index) in listaFuncionariosModal" :key="index" 
                class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all group">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 font-black text-sm group-hover:bg-emerald-500/20 transition-all">
                    {{ func.funcionario.charAt(0).toUpperCase() }}
                </div>
                <span class="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">{{ func.funcionario }}</span>
            </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-10 opacity-60">
            <Icon name="fa7-solid:building-user" class="w-16 h-16 text-gray-300 mb-4" />
            <p class="text-lg font-black text-gray-400 uppercase tracking-tighter">Global para o Projeto</p>
            <p class="text-xs font-bold text-gray-500 text-center">Este lançamento foi aplicado a todos os funcionários vinculados.</p>
        </div>
      </div>
      <template #footer>
          <AppBotao variacao="padrao" @click="modalFuncionarioAberto = false" class="w-full h-12 uppercase text-[10px] font-black tracking-widest">Fechar Painel</AppBotao>
      </template>
    </AppModal>

    <AppModalExibicao 
      :aberto="modalExibicaoAberto" 
      :colunas="colunasTemp" 
      :labels="labels" 
      @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" 
    />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, projetos, tiposMovimentacao,
  buscarLista, filtrar, novoRegistro,
  modalDetalhesAberto, detalhes, abrirModalDetalhes,
  modalFuncionarioAberto, listaFuncionariosModal, abrirModalFuncionarios, gerarPdfOficio,
  modalExibicaoAberto, abrirModalExibicao, aplicarExibicao, colunas, labels, colunasTemp, placeholderDinamico,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useLancamentoReembolsoListagem()

const camposFiltro = computed(() => [
  { 
    key: 'projeto', 
    label: 'Projeto', 
    type: 'select' as const, 
    opcoes: projetos.value, 
    itemValue: 'codigo', 
    itemLabel: 'apelido',
    placeholder: 'Projeto...'
  },
  { 
    key: 'tipoMovimentacao', 
    label: 'Tipo', 
    type: 'select' as const, 
    opcoes: tiposMovimentacao.value, 
    itemValue: 'codigo', 
    itemLabel: 'descricao',
    placeholder: 'Tipo...'
  },
  { 
    key: 'dataMovimentacao', 
    label: 'Data', 
    type: 'text' as const, 
    placeholder: 'dd/mm/aaaa',
    mask: '##/##/####',
    icon: 'fa7-solid:calendar-days'
  }
])

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