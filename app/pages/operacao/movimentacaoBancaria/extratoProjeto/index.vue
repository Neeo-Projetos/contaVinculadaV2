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
        :view="false" :edit="false"
        @mudarItensPorPagina="mudarItensPorPagina">

        <template #cabecalho-tabela>
          <th v-if="colunas.projeto" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Projeto</th>
          <th v-if="colunas.conta" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Conta Vinculada</th>
          <th v-if="colunas.saldo" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-40">Saldo Atual</th>
          <th v-if="colunas.ultMov" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-40">Última Mov.</th>
          <th v-if="colunas.acoes" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-28">Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.projeto" class="px-6 py-4">
             <div @click="verExtrato(item.codigoProjeto)" class="flex items-center gap-3 group cursor-pointer">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                  {{ item.apelido.charAt(0).toUpperCase() }}
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                    {{ item.projeto }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.apelido }}</span>
                </div>
             </div>
          </td>
          <td v-if="colunas.conta" class="px-6 py-4">
            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium italic">{{ item.nomeBanco || item.contaVinculada || 'Não vinculada' }}</span>
          </td>
          <td v-if="colunas.saldo" class="px-6 py-4 text-center">
            <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg tabular-nums border border-emerald-500/10 whitespace-nowrap">
              R$ {{ formatarMoeda(item.saldoProjeto) }}
            </span>
          </td>
          <td v-if="colunas.ultMov" class="px-6 py-4 text-center font-bold text-gray-400 tabular-nums text-[10px] uppercase">
            {{ item.dataUltimaMovimentacao || 'Não há' }}
          </td>
          <td v-if="colunas.acoes" class="px-6 py-4 text-center">
            <button @click.stop="verExtrato(item.codigoProjeto)"
              class="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
              title="Ver Extrato Detalhado">
              <Icon name="fa7-solid:eye" class="w-5 h-5" />
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
               <AppBotao variacao="acao" icone="fa7-solid:eye" class="flex-1 font-black uppercase tracking-widest text-[10px] h-10" @click="verExtrato(item.codigoProjeto)">Ver Extrato</AppBotao>
            </template>
          </AppCardListagem>
        </template>
      </AppContainerListagem>
    </AppFiltro>

    <!-- Modais -->
    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />


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
  verExtrato,
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
    label: 'Projeto', 
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