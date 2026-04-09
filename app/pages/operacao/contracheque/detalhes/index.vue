<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Histórico de Contracheques"
      descricao="Consulta detalhada de todos os contracheques aprovados e processados" 
      icone-titulo="fa7-solid:info-circle"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Operação' }, { label: 'Contracheques' }, { label: 'Histórico' }]"
      :pending="carregando"
      @buscar="buscarRegistros"
      @openAdvancedFilter="modalFiltroAvancadoAberto = true"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="abrirModalExibicao" class="whitespace-nowrap">Controle de Exibição</AppBotao>
      </template>

      <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
        :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
        :view="false" :edit="false"
        @mudarItensPorPagina="mudarItensPorPagina">
        <template #cabecalho-tabela>
          <th v-if="colunas.funcionario" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left font-black">
            Funcionário</th>
          <th v-if="colunas.projeto" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left font-black">
            Projeto</th>
          <th v-if="colunas.status" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center font-black">
            Status</th>
          <th v-if="colunas.competencia" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center font-black">
            Competência</th>
          <th v-if="colunas.acoes" scope="col"
            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right font-black">Ações
          </th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.funcionario" class="px-6 py-4">
            <div class="flex items-center gap-4 min-w-[300px]">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-500/10 shrink-0 uppercase tracking-tighter">
                {{item.funcionario.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}}
              </div>
              <div class="flex flex-col overflow-hidden text-left">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{ item.funcionario }}</span>
                <span class="text-[10px] text-gray-500 font-bold tracking-widest">{{ item.cpf }}</span>
              </div>
            </div>
          </td>
          <td v-if="colunas.projeto" class="px-6 py-4 text-left">
            <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">{{
              item.projeto }}</span>
          </td>
          <td v-if="colunas.status" class="px-6 py-4 text-center">
            <span v-if="item.statusAprovacao === 0"
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 animate-pulse"></span>
              Reprovado
            </span>
            <span v-else-if="item.statusAprovacao === 1"
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Aprovado
            </span>
          </td>
          <td v-if="colunas.competencia" class="px-6 py-4 text-center">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono tracking-tighter tabular-nums">{{ item.dataRetencao }}</span>
          </td>
          <td v-if="colunas.acoes" class="px-6 py-4 text-right">
            <button @click="abrirModalDetalhes(item.codigo)"
              class="w-10 h-10 ml-auto flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 rounded-xl transition-all shadow-sm"
              title="Ver Verbas">
              <Icon name="fa7-solid:sack-dollar" class="w-5 h-5" />
            </button>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.funcionario" :subtituloNome="item.projeto" :subtituloValor="item.dataRetencao"
            :ativo="true" :detalhes="[
              { icone: 'fa7-solid:address-card', texto: `CPF: ${item.cpf}` },
              { icone: 'fa7-solid:check-double', texto: item.statusAprovacao === 1 ? 'Aprovado' : 'Reprovado' }
            ]" @ver-detalhes="abrirModalDetalhes(item.codigo)" @clique-titulo="abrirModalDetalhes(item.codigo)" />
        </template>
      </AppContainerListagem>
    </AppFiltro>

    <!-- Modal de Filtro Avançado -->
    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @aplicar="buscarRegistros" @limpar="limparFiltrosAvancados">
      <AppSelect v-model="filtro.projeto" label="Projeto" placeholder="Todos os projetos" :opcoes="projetos"
        itemValue="codigo" itemLabel="nomeExibicao" icone="fa7-solid:building-user" />
      <AppSelect v-model="filtro.status" label="Situação Final" placeholder="Todas..."
        :opcoes="[{ codigo: '1', descricao: 'Aprovados' }, { codigo: '0', descricao: 'Reprovados' }]" itemValue="codigo"
        itemLabel="descricao" icone="fa7-solid:shield-check" />
    </AppModalFiltroAvancado>

    <!-- Modal Detalhes Verba -->
    <AppModal :isOpen="modalDetalhesAberto" title="Detalhamento Técnico das Verbas"
      icon="fa7-solid:magnifying-glass-dollar" tamanho="xl" @close="modalDetalhesAberto = false" rodapeEntre>
      <div class="p-2 lg:p-4">
        <AppDetalhamentoVerbas :itens="detalhesVerba" />
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalDetalhesAberto = false" class="px-8">Fechar</AppBotao>
      </template>
    </AppModal>
    
    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscarRegistros, projetos, funcionarios, detalhesVerba, modalDetalhesAberto, abrirModalDetalhes,

  // Filtro Avançado
  modalFiltroAvancadoAberto, limparFiltrosAvancados,

  // Exibição (Padrão Ouro)
  modalExibicaoAberto, abrirModalExibicao, aplicarExibicao, colunas, labels, colunasTemp,

  // Autocomplete Funcionário
  nomeFuncionarioSearch, sugestoesFuncionarios, buscandoFuncionarios, mostrarMenuFuncionarios,
  buscarFuncionarios, selecionarFuncionario,

  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useContrachequeDetalhes()

const camposFiltro = computed(() => [
  { 
    key: 'mesAno', 
    label: 'Mês/Ano', 
    type: 'text' as const, 
    placeholder: 'Ex: 03/2024', 
    mask: '##/####',
    colSpan: 'md:col-span-3'
  },
  { 
    key: 'nomeFuncionario', 
    label: 'Colaborador', 
    type: 'text' as const, 
    placeholder: 'Filtrar por nome...',
    icon: 'fa6-solid:magnifying-glass',
    colSpan: 'md:col-span-6'
  }
])

const gerarExcel = () => {
    alert('📊 Gerando relatório de histórico (Excel)...')
}

const gerarPdf = () => {
    alert('📄 Gerando espelho de histórico (PDF)...')
}
</script>