<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Extrato" tituloGrosso="Funcionário"
      descricao="Visualize saldos e movimentações detalhadas por colaborador" icone="fa7-solid:user-check" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end w-full">
          <AppSelect v-model="filtro.funcionarioParam" label="Filtrar por Funcionário" :opcoes="funcionariosAtivos.map(f => ({ codigo: f.codigo, descricao: f.nomeCompleto }))" />
          <AppSelect v-model="filtro.projetoParam" label="Filtrar por Projeto" :opcoes="projetosAtivos.map(p => ({ codigo: p.codigo, descricao: `${p.apelido} - ${p.descricao}` }))" />
        </div>
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:table-columns" @click="abrirModalExibicao">Exibição</AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="padrao" icone="fa7-solid:chart-pie" @click="navigateTo('/operacao/movimentacaoBancaria/extratoProjeto')">
          Ir para Extrato Projeto
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
        <th v-if="colunas.funcionario" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Colaborador</th>
        <th v-if="colunas.cpf" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">CPF</th>
        <th v-if="colunas.projeto" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Projeto Atual</th>
        <th v-if="colunas.saldo" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Saldo Acumulado</th>
        <th v-if="colunas.acoes" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td v-if="colunas.funcionario" class="px-6 py-4">
          <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ item.nomeCompleto }}</span>
        </td>
        <td v-if="colunas.cpf" class="px-6 py-4">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.cpf }}</span>
        </td>
        <td v-if="colunas.projeto" class="px-6 py-4">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.apelido }}</span>
            <span class="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{{ item.projeto }}</span>
          </div>
        </td>
        <td v-if="colunas.saldo" class="px-6 py-4 text-right font-black" :class="item.saldo >= 0 ? 'text-emerald-600' : 'text-red-500'">
          R$ {{ formatarMoeda(item.saldo) }}
        </td>
        <td v-if="colunas.acoes" class="px-6 py-4 text-center">
          <button @click="abrirModalExtrato(item.codigoFuncionario)"
            title="Ver Extrato Detalhado"
            class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all">
            <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5" />
          </button>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.nomeCompleto" :subtituloNome="'CPF'" :subtituloValor="item.cpf"
          :ativo="true" :mostrarStatus="false" :mostrarHistorico="false"
          :detalhes="[
            { icone: 'fa7-solid:briefcase', texto: `${item.apelido}` },
            { icone: 'fa7-solid:sack-dollar', texto: `Saldo: R$ ${formatarMoeda(item.saldo)}` }
          ]" 
          @ver-detalhes="abrirModalExtrato(item.codigoFuncionario)">
          <template #footer-actions>
             <AppBotao variacao="primario" icone="fa7-solid:user-tag" class="flex-1" @click="abrirModalExtrato(item.codigoFuncionario)">Ver Extrato</AppBotao>
          </template>
        </AppCardListagem>
      </template>

    </AppContainerListagem>

    <AppExtratoDetalhadoModal 
      :isOpen="modalExtratoAberto" 
      :id="funcionarioSelecionado" 
      tipo="funcionario"
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
  projetosAtivos, funcionariosAtivos,
  modalExtratoAberto, funcionarioSelecionado, abrirModalExtrato,
  formatarMoeda,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useExtratoFuncionarioListagem()
</script>