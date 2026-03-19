<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Extrato" tituloGrosso="Projeto"
      descricao="Visualize saldos e movimentações detalhadas por projeto" icone="fa7-solid:chart-pie" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end w-full">
          <AppSelect v-model="filtro.projetoParam" label="Filtrar por Projeto" :opcoes="projetosAtivos.map(p => ({ codigo: p.codigo, descricao: `${p.apelido} - ${p.descricao}` }))" />
          <AppSelect v-model="filtro.contaVinculadaParam" label="Filtrar por Conta" :opcoes="contasAtivas.map(c => ({ codigo: c.codigo, descricao: c.nomeBanco }))" />
        </div>
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:table-columns" @click="abrirModalExibicao">Exibição</AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="padrao" icone="fa7-solid:user-tag" @click="navigateTo('/operacao/movimentacaoBancaria/extratoFuncionario')">
          Ir para Extrato Funcionário
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Atualizar Saldos
        </AppBotao>
      </template>
    </AppBarraFerramentas>

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