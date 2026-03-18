<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Extrato" tituloGrosso="Projeto"
      descricao="Visualize saldos e movimentações detalhadas por projeto" icone="fa7-solid:chart-pie" />

    <div
      class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="flex flex-col xl:flex-row items-center gap-4">
        <div class="flex-1 w-full text-left">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppSelect v-model="filtro.projetoParam" label="Filtrar por Projeto" :opcoes="projetosAtivos.map(p => ({ codigo: p.codigo, descricao: `${p.apelido} - ${p.descricao}` }))" />
            <AppSelect v-model="filtro.contaVinculadaParam" label="Filtrar por Conta" :opcoes="contasAtivas.map(c => ({ codigo: c.codigo, descricao: c.nomeBanco }))" />
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
        </div>
      </div>

      <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <AppBotao variacao="padrao" icone="fa7-solid:user-tag" @click="navigateTo('/operacao/movimentacaoBancaria/extratoFuncionario')">
          Ir para Extrato Funcionário
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Atualizar Saldos
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
        <th v-if="colunas.banco" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Banco Principal</th>
        <th v-if="colunas.saldo" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Saldo Consolidado</th>
        <th v-if="colunas.acoes" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Extrato</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td v-if="colunas.projeto" class="px-6 py-4">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ item.apelido }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ item.projeto }}</span>
          </div>
        </td>
        <td v-if="colunas.banco" class="px-6 py-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.nomeBanco || 'Não vinculado' }}</span>
        </td>
        <td v-if="colunas.saldo" class="px-6 py-4 text-right font-black text-lg" :class="item.saldoProjeto >= 0 ? 'text-emerald-600' : 'text-red-500'">
          R$ {{ formatarMoeda(item.saldoProjeto) }}
        </td>
        <td v-if="colunas.acoes" class="px-6 py-4 text-center">
          <button @click="abrirModalExtrato(item.codigoProjeto)"
            title="Ver Histórico Completo"
            class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all">
            <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5" />
          </button>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.apelido" :subtituloNome="'Projeto'" :subtituloValor="item.projeto"
          :ativo="true" :mostrarStatus="false" :mostrarHistorico="false"
          :detalhes="[
            { icone: 'fa7-solid:building-columns', texto: item.nomeBanco || 'Sem Banco' },
            { icone: 'fa7-solid:sack-dollar', texto: `Saldo: R$ ${formatarMoeda(item.saldoProjeto)}` }
          ]" 
          @ver-detalhes="abrirModalExtrato(item.codigoProjeto)">
          <template #footer-actions>
             <AppBotao variacao="primario" icone="fa7-solid:chart-line" class="flex-1" @click="abrirModalExtrato(item.codigoProjeto)">Ver Extrato</AppBotao>
          </template>
        </AppCardListagem>
      </template>

    </AppContainerListagem>

    <AppExtratoDetalhadoModal
      :isOpen="modalExtratoAberto"
      :id="projetoSelecionado"
      tipo="projeto"
      @close="modalExtratoAberto = false"
    />

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, buscarLista,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  projetosAtivos, contasAtivas,
  modalExtratoAberto, projetoSelecionado, abrirModalExtrato,
  formatarMoeda,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useExtratoProjetoListagem()
</script>