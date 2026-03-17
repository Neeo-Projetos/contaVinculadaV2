<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Lançamento" tituloGrosso="Manual"
      descricao="Gerencie movimentações bancárias manuais e vinculações com funcionários" icone="fa7-solid:file-invoice-dollar" />

    <div
      class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="flex flex-col xl:flex-row items-center gap-4">
        <div class="flex-1 w-full text-left">
          <!-- Main Search (Autocomplete) -->
          <AppInputAutocomplete v-model="filtro.nomeParam" :sugestoes="sugestoesBusca" :buscando="buscandoSugestoes"
            :mostrarMenu="mostrandoSugestoes" :placeholder="placeholderDinamico"
            @buscar="buscarSugestoes" @selecionar="selecionarSugestao" @fechar="fecharSugestoesDelay"
            @enter="buscarLista" />
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto shrink-0">
          <AppSelecaoStatus v-model="filtro.ativoParam" />

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

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <AppBotao variacao="primario" icone="fa7-solid:plus" @click="novoRegistro">
          Novo Lançamento
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarLista">
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
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
          Projeto / Conta
        </th>
        <th v-if="colunas.valor" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Valor</th>
        <th v-if="colunas.tipo" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
          Movimentação</th>
        <th v-if="colunas.data" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Data</th>
        <th v-if="colunas.funcionarios" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Funcionários</th>
        <th v-if="colunas.detalhes" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Detalhes</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4">
          <NuxtLink :to="`/operacao/movimentacaoBancaria/lancamentoManual/cadastro?id=${item.codigo}`" class="flex flex-col group">
            <span class="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 transition-colors">{{ item.projeto }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.contaVinculada }}</span>
          </NuxtLink>
        </td>
        <td v-if="colunas.valor" class="px-6 py-4 text-center">
          <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
            R$ {{ formatarMoeda(item.valorMovimentacao) }}
          </span>
        </td>
        <td v-if="colunas.tipo" class="px-6 py-4">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ item.tipoMovimentacao }}</span>
            <span v-if="colunas.classificacao" class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{{ item.classificacao }}</span>
          </div>
        </td>
        <td v-if="colunas.data" class="px-6 py-4 text-center">
          <span class="text-xs font-bold text-gray-600 dark:text-gray-400">{{ item.dataMovimentacao }}</span>
        </td>
        <td v-if="colunas.funcionarios" class="px-6 py-4 text-center">
          <button @click="abrirModalFuncionarios(item.codigo)"
            class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
            :class="{ 'text-emerald-500 bg-emerald-50': item.funcionario === 1 }">
            <Icon name="fa7-solid:users" class="w-5 h-5" />
          </button>
        </td>
        <td v-if="colunas.detalhes" class="px-6 py-4 text-center">
          <button @click="abrirModalDetalhes(item.codigo)"
            class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all">
            <Icon name="fa7-solid:list-ul" class="w-5 h-5" />
          </button>
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
          @clique-titulo="navigateTo(`/operacao/movimentacaoBancaria/lancamentoManual/cadastro?id=${item.codigo}`)" />
      </template>

    </AppContainerListagem>

    <AppModal :isOpen="modalDetalhesAberto" title="Datalhes do Lançamento" icon="fa7-solid:circle-info" @close="modalDetalhesAberto = false" tamanho="md">
       <div class="space-y-6">
        <div class="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Motivo do Lançamento</label>
          <p class="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{{ detalhes.motivo }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800">
            <span class="text-[9px] font-black uppercase text-gray-400 block mb-1">Usuário</span>
            <span class="font-bold text-gray-700 dark:text-gray-300">{{ detalhes.usuarioCadastro }}</span>
          </div>
          <div class="p-4 bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800">
            <span class="text-[9px] font-black uppercase text-gray-400 block mb-1">Data Registro</span>
            <span class="font-bold text-gray-700 dark:text-gray-300">{{ detalhes.dataCadastro }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalDetalhesAberto = false" class="w-full">Fechar</AppBotao>
      </template>
    </AppModal>

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
           <Icon name="fa7-solid:circle-exclamation" class="w-12 h-12 text-amber-500" />
           <p class="font-bold">Lançamento feito para todos funcionários do projeto.</p>
        </div>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalFuncionarioAberto = false" class="w-full">Fechar</AppBotao>
      </template>
    </AppModal>

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      <AppSelect v-model="filtro.projetoParam" label="Projeto" :opcoes="projetosAtivos.map(p => ({ codigo: p.codigo, descricao: `${p.apelido} - ${p.descricao}` }))" />
      <AppSelect v-model="filtro.tipoMovimentacaoParam" label="Tipo de Movimentação" :opcoes="tiposMovimentacao.map(t => ({ codigo: t.codigo, descricao: t.descricao }))" />
      <AppInputTexto v-model="filtro.dataMovimentacaoParam" label="Data da Movimentação" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-days" />
    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, sugestoesBusca, buscandoSugestoes, mostrandoSugestoes,
  buscarSugestoes, selecionarSugestao, fecharSugestoesDelay, buscarLista,
  abrirModalFiltroAvancado, modalFiltroAvancadoAberto, limparFiltrosAvancados, aplicarFiltroAvancado,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  placeholderDinamico, projetosAtivos, tiposMovimentacao,
  modalDetalhesAberto, detalhes, modalFuncionarioAberto, listaFuncionariosModal,
  abrirModalDetalhes, abrirModalFuncionarios,
  formatarMoeda, novoRegistro,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useLancamentoManualListagem()
</script>