<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Extrato por Funcionário"
      descricao="Visualize saldos e movimentações detalhadas por colaborador" 
      icone-titulo="fa7-solid:user-check"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Operação', to: '#' }, { label: 'Tesouraria', to: '#' }, { label: 'Extrato Funcionário', to: '#' }]"
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
        :view="false" :edit="false"
        :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
        @mudarItensPorPagina="mudarItensPorPagina">

        <template #cabecalho-tabela>
          <th v-if="colunas.funcionario" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Funcionário</th>
          <th v-if="colunas.cpf" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-40">CPF</th>
          <th v-if="colunas.projeto" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-60">Projeto Atual</th>
          <th v-if="colunas.saldo" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-48">Saldo Acumulado</th>
          <th v-if="colunas.acoes" scope="col" class="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-28">Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.funcionario" class="px-6 py-4">
            <div @click="verExtrato(item.codigoFuncionario)" class="flex items-center gap-3 group cursor-pointer">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                {{ item.nomeCompleto.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                   {{ item.nomeAbreviado || item.nomeCompleto }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.email || 'N/A' }}</span>
              </div>
            </div>
          </td>
          <td v-if="colunas.cpf" class="px-6 py-4 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums">{{ item.cpf }}</span>
          </td>
          <td v-if="colunas.projeto" class="px-6 py-4 text-center">
            <div class="flex flex-col">
              <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">{{ item.apelido }}</span>
              <span class="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[140px] mx-auto">{{ item.projeto }}</span>
            </div>
          </td>
          <td v-if="colunas.saldo" class="px-6 py-4 text-center">
            <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg tabular-nums border border-emerald-500/10">
              R$ {{ formatarMoeda(item.saldo) }}
            </span>
          </td>
          <td v-if="colunas.acoes" class="px-6 py-4 text-center">
            <button @click.stop="verExtrato(item.codigoFuncionario)"
              class="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
              title="Ver Detalhes do Extrato">
              <Icon name="fa7-solid:eye" class="w-5 h-5" />
            </button>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.nomeCompleto" subtituloNome="CPF" :subtituloValor="item.cpf"
            :ativo="true" :mostrarStatus="false" :mostrarHistorico="false"
            :detalhes="[
              { icone: 'fa7-solid:briefcase', texto: item.apelido },
              { icone: 'fa7-solid:sack-dollar', texto: `Saldo: R$ ${formatarMoeda(item.saldo)}` }
            ]"
            @clique-titulo="verExtrato(item.codigoFuncionario)"
            @ver-detalhes="verExtrato(item.codigoFuncionario)"
          >
            <template #footer-actions>
               <AppBotao variacao="acao" icone="fa7-solid:user-tag" class="flex-1 font-black uppercase tracking-widest text-[10px] h-10" @click="verExtrato(item.codigoFuncionario)">Ver Detalhes</AppBotao>
            </template>
          </AppCardListagem>
        </template>
      </AppContainerListagem>
    </AppFiltro>


    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      <div class="md:col-span-2">
        <AppSelect v-model="filtro.projetoParam" label="Filtrar por Projeto" placeholder="Todos os Projetos"
          itemValue="codigo" itemLabel="descricao"
          :opcoes="projetosFormatados" />
      </div>
      <div class="md:col-span-1">
        <AppInputTexto v-model="filtro.dataInicioParam" label="Início" placeholder="DD/MM/AAAA" mask="##/##/####" icone="fa7-solid:calendar-day" />
      </div>
      <div class="md:col-span-1">
        <AppInputTexto v-model="filtro.dataFimParam" label="Fim" placeholder="DD/MM/AAAA" mask="##/##/####" icone="fa7-solid:calendar-day" />
      </div>
    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, buscarLista,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  projetosAtivos, projetosFormatados,
  verExtrato,
  sugestoesNome, buscandoSugestoes, mostrandoSugestoes,
  buscarSugestoesNome, selecionarSugestao, fecharSugestoesDelay,
  placeholderDinamico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  formatarMoeda,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useExtratoFuncionarioListagem()

const camposFiltro = computed(() => [
  { 
    key: 'nomeParam', 
    label: 'Descrição / Funcionário', 
    type: 'autocomplete' as const, 
    placeholder: placeholderDinamico.value || 'Funcionário...',
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
    alert('📊 Gerando extrato consolidado (Excel)...')
}

const gerarPdf = () => {
    alert('📄 Gerando extrato consolidado (PDF)...')
}
</script>