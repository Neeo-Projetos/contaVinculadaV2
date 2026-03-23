<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Histórico de" tituloGrosso="Contracheques"
      descricao="Consulta detalhada de todos os contracheques aprovados e processados" icone="fa7-solid:info-circle" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="w-44">
          <AppInputTexto v-model="filtro.mesAno" placeholder="Mês/Ano" v-maska="'##/####'" centralizado required icone="fa7-solid:calendar-days" />
        </div>

        <AppInputAutocomplete v-model="nomeFuncionarioSearch" placeholder="Digite o nome do colaborador..."
          :sugestoes="sugestoesFuncionarios" :buscando="buscandoFuncionarios" :mostrarMenu="mostrarMenuFuncionarios"
          @buscar="buscarFuncionarios" @selecionar="selecionarFuncionario" @fechar="mostrarMenuFuncionarios = false"
          icone="fa7-solid:user-magnifying-glass" />
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:filter" @click="modalFiltroAvancadoAberto = true">Filtro Avançado
        </AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="padrao" icone="fa7-solid:gears" @click="navigateTo('/operacao/contracheque/processamento')">
          Processamento
        </AppBotao>
      </template>

      <template #acoes-pesquisa>
        <AppBotao variacao="acao" icone="fa7-solid:magnifying-glass" @click="buscarRegistros">
          Consultar
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
      :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
      :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
      :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
      @mudarItensPorPagina="mudarItensPorPagina">
      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Funcionário</th>
        <th scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Projeto</th>
        <th scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Status</th>
        <th scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Retenção</th>
        <th scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ação
        </th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4">
          <div class="flex items-center gap-4 min-w-[300px]">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-500/10 shrink-0 uppercase">
              {{item.funcionario.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}}
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{ item.funcionario }}</span>
              <span class="text-[10px] text-gray-500 font-bold tracking-widest">{{ item.cpf }}</span>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">{{
            item.projeto }}</span>
        </td>
        <td class="px-6 py-4 text-center">
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
        <td class="px-6 py-4 text-center">
          <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.dataRetencao }}</span>
        </td>
        <td class="px-6 py-4 text-right">
          <button @click="abrirModalDetalhes(item.codigo)"
            class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
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

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscarRegistros, projetos, funcionarios, detalhesVerba, modalDetalhesAberto, abrirModalDetalhes,

  // Filtro Avançado
  modalFiltroAvancadoAberto, limparFiltrosAvancados,

  // Autocomplete Funcionário
  nomeFuncionarioSearch, sugestoesFuncionarios, buscandoFuncionarios, mostrarMenuFuncionarios,
  buscarFuncionarios, selecionarFuncionario,

  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useContrachequeDetalhes()
</script>