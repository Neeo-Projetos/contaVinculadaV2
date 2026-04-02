<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100 font-bold">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Extrato por Projeto"
      descricao="Analise o fluxo financeiro e o saldo consolidado de projetos específicos" 
      icone-titulo="fa7-solid:chart-pie"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Operação' }, { label: 'Tesouraria' }, { label: 'Extrato Projeto' }]"
      :pending="carregando"
      @buscar="buscarLista"
      @openAdvancedFilter="abrirModalFiltroAvancado"
      @buscarSugestao="buscarSugestoesNome"
      @selecionarSugestao="(data: any) => selecionarSugestao(data.sugestao)"
      @fecharSugestao="fecharSugestoesDelay"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="visaoAtual = visaoAtual === 'lista' ? 'cards' : 'lista'">Controle de Exibição</AppBotao>

      </template>

      <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
        :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
        @mudarItensPorPagina="mudarItensPorPagina">

        <template #cabecalho-tabela>
          <th v-if="colunas.projeto" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Projeto</th>
          <th v-if="colunas.conta" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Conta Vinculada</th>
          <th v-if="colunas.saldo" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Saldo Atual</th>
          <th v-if="colunas.ultMov" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Última Mov.</th>
          <th v-if="colunas.acoes" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-28">Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.projeto" class="px-6 py-4">
             <div class="flex flex-col">
               <span class="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">{{ item.projeto }}</span>
               <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{{ item.apelido }}</span>
             </div>
          </td>
          <td v-if="colunas.conta" class="px-6 py-4">
            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium italic">{{ item.contaVinculada }}</span>
          </td>
          <td v-if="colunas.saldo" class="px-6 py-4 text-center">
            <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg tabular-nums border border-emerald-500/10">
              R$ {{ formatarMoeda(item.saldoProjeto) }}
            </span>
          </td>
          <td v-if="colunas.ultMov" class="px-6 py-4 text-center font-bold text-gray-500 tabular-nums text-xs">
            {{ item.dataUltimaMovimentacao }}
          </td>
          <td v-if="colunas.acoes" class="px-6 py-4 text-center">
            <button @click.stop="abrirModalExtrato(item.codigoProjeto)"
              class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
              title="Ver Extrato Detalhado">
              <Icon name="fa7-solid:chart-line" class="w-5 h-5" />
            </button>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.projeto" subtituloNome="Conta" :subtituloValor="item.contaVinculada"
            :ativo="true" :mostrarStatus="false" :mostrarHistorico="false"
            :detalhes="[
              { icone: 'fa7-solid:piggy-bank', texto: `Saldo: R$ ${formatarMoeda(item.saldoProjeto)}` },
              { icone: 'fa7-solid:calendar-check', texto: `Última Mov: ${item.dataUltimaMovimentacao}` }
            ]">
            <template #footer-actions>
               <AppBotao variacao="acao" icone="fa7-solid:chart-line" class="flex-1 font-black uppercase tracking-widest text-[10px] h-10" @click="abrirModalExtrato(item.codigoProjeto)">Ver Extrato</AppBotao>
            </template>
          </AppCardListagem>
        </template>
      </AppContainerListagem>
    </AppFiltro>

    <!-- Modais -->
    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

    <AppExtratoDetalhadoModal
      :isOpen="modalExtratoAberto"
      tipo="projeto"
      :id="projetoSelecionado"
      @close="modalExtratoAberto = false"
    />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      <div class="md:col-span-2">
         <AppSelect v-model="filtro.projetoParam" label="Filtrar por Projeto" placeholder="Todos os Projetos"
          itemValue="codigo" itemLabel="descricao"
          :opcoes="projetosFormatados" />
      </div>
      <div class="md:col-span-2">
        <AppSelect v-model="filtro.contaVinculadaParam" label="Filtrar por Conta" placeholder="Todas as Contas"
          itemValue="codigo" itemLabel="descricao"
          :opcoes="contasAtivas.map(c => ({ codigo: c.codigo, descricao: c.nomeBanco }))" />
      </div>
      <div class="md:col-span-1">
        <AppInputTexto v-model="filtro.dataInicioParam" label="Início" placeholder="DD/MM/AAAA" mask="##/##/####" icone="fa7-solid:calendar-day" />
      </div>
      <div class="md:col-span-1">
        <AppInputTexto v-model="filtro.dataFimParam" label="Fim" placeholder="DD/MM/AAAA" mask="##/##/####" icone="fa7-solid:calendar-day" />
      </div>
    </AppModalFiltroAvancado>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, buscarLista,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  projetosAtivos, contasAtivas, projetosFormatados,
  modalExtratoAberto, projetoSelecionado, abrirModalExtrato,
  sugestoesNome, buscandoSugestoes, mostrandoSugestoes,
  buscarSugestoesNome, selecionarSugestao, fecharSugestoesDelay, placeholderDinamico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  formatarMoeda,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useExtratoProjetoListagem()

const camposFiltro = computed(() => [
  { 
    key: 'nomeParam', 
    label: 'Descrição / Projeto', 
    type: 'autocomplete' as const, 
    placeholder: placeholderDinamico.value || 'Projeto...',
    icon: 'fa7-solid:magnifying-glass',
    sugestoes: sugestoesNome.value,
    buscando: buscandoSugestoes.value,
    mostrarMenu: mostrandoSugestoes.value,
    colSpan: 'md:col-span-7'
  },
  {
    key: 'comSaldoParam',
    label: 'Com Saldo',
    type: 'select' as const,
    placeholder: 'Todos',
    options: [
      { value: '', label: 'Todos' },
      { value: 'S', label: 'Sim' },
      { value: 'N', label: 'Não' }
    ],
    colSpan: 'md:col-span-2'
  }
])

const gerarExcel = () => {
    alert('📊 Gerando extrato de projetos (Excel)...')
}

const gerarPdf = () => {
    alert('📄 Gerando extrato de projetos (PDF)...')
}
</script>