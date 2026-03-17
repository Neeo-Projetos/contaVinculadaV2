<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Gestão de" tituloGrosso="Projetos"
      descricao="Gerenciamento de projetos, contas e verbas do sistema" icone="fa7-solid:briefcase" />

    <div
      class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="flex flex-col xl:flex-row items-center gap-4">
        <div class="flex-1 w-full text-left">
          <AppInputAutocomplete v-model="filtro.apelidoParam" :sugestoes="sugestoesProjeto" :buscando="buscandoSugestoes"
            :mostrarMenu="mostrandoSugestoes" :placeholder="placeholderDinamico"
            @buscar="buscarSugestoesProjeto" @selecionar="selecionarSugestao" @fechar="fecharSugestoesDelay"
            @enter="buscarProjetos" />
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
        <AppBotao variacao="primario" icone="fa7-solid:plus" @click="navigateTo('/cadastro/projeto/cadastro?id=0')">
          Novo Projeto
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarProjetos">
          Pesquisar Projetos
        </AppBotao>
      </div>
    </div>

    <AppContainerListagem :carregando="carregandoTela" :buscaRealizada="buscaRealizada" :lista="listaRegistros"
      :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
      :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
      :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
      @mudarItensPorPagina="mudarItensPorPagina">

      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Projeto</th>
        <th v-if="colunasVisiveis.cnpj" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          CNPJ</th>
        <th v-if="colunasVisiveis.contas" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Contas</th>
        <th v-if="colunasVisiveis.verbas" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Verbas</th>
        <th v-if="colunasVisiveis.status" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Status</th>
        <th v-if="colunasVisiveis.historico" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Histórico</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4 max-w-[300px]">
          <NuxtLink :to="`/cadastro/projeto/cadastro?id=${item.codigo}`" class="flex items-center gap-3 group">
            <div
              class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
              {{ item.apelido.charAt(0).toUpperCase() }}
            </div>
            <div class="flex flex-col min-w-0">
              <span
                class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{
                  item.apelido }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.descricao }}</span>
            </div>
          </NuxtLink>
        </td>
        <td v-if="colunasVisiveis.cnpj" class="px-6 py-4 text-center">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ item.cnpj }}</span>
        </td>
        <td v-if="colunasVisiveis.contas" class="px-6 py-4 text-center">
          <button @click="abrirModalConta(item.codigo)"
            class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
            title="Ver Contas">
            <Icon name="fa7-solid:building-columns" class="w-5 h-5" />
          </button>
        </td>
        <td v-if="colunasVisiveis.verbas" class="px-6 py-4 text-center">
          <button @click="abrirModalVerba(item.codigo)"
            class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
            title="Ver Verbas">
            <Icon name="fa7-solid:sack-dollar" class="w-5 h-5" />
          </button>
        </td>
        <td v-if="colunasVisiveis.status" class="px-6 py-4 text-center">
          <AppAtivo :ativo="item.ativo" />
        </td>
        <td v-if="colunasVisiveis.historico" class="px-6 py-4 text-center">
          <button @click="abrirHistorico(item.codigo)"
            class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
            title="Ver Histórico">
            <Icon name="fa6-solid:clock-rotate-left" class="w-5 h-5" />
          </button>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.apelido" subtituloNome="Descrição" :subtituloValor="item.descricao"
          :ativo="item.ativo" :mostrarStatus="colunasVisiveis.status"
          :mostrarHistorico="colunasVisiveis.historico" :detalhes="[
            ...(colunasVisiveis.cnpj ? [{ icone: 'fa7-solid:address-card', texto: `CNPJ: ${item.cnpj}` }] : [])
          ]" @ver-detalhes="navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)"
          @ver-historico="abrirHistorico(item.codigo)"
          @clique-titulo="navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)" />
      </template>

    </AppContainerListagem>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoSelecionado"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">

      <AppInputCnpj v-model="filtro.cnpjParam" label="CNPJ do Projeto" />

      <AppSelect v-model="filtro.contaParam" label="Conta Vinculada (Banco)" 
        :opcoes="[{ codigo: '1', descricao: 'Banco do Brasil' }, { codigo: '2', descricao: 'Caixa' }]" />
        
      <AppSelect v-model="filtro.verbaParam" label="Verba" 
        :opcoes="[{ codigo: '1', descricao: 'Verba CLT' }, { codigo: '2', descricao: 'Verba Estágio' }]" />

    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labelsColunas" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  filtro, listaRegistros, carregandoTela, buscaRealizada,
  visaoAtual, registroInicial, registroFinal, totalRegistros,
  itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  colunasVisiveis, colunasTemp, modalExibicaoAberto, aplicarExibicao, abrirModalExibicao,
  labelsColunas, placeholderDinamico,
  modalHistoricoAberto, historicoSelecionado, carregandoHistorico, abrirHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  sugestoesProjeto, mostrandoSugestoes, buscandoSugestoes, buscarSugestoesProjeto, selecionarSugestao, fecharSugestoesDelay,
  buscarProjetos, mudarPagina, mudarItensPorPagina,
  abrirModalConta, abrirModalVerba
} = useProjetoListagem()
</script>