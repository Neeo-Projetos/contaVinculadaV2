<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">

    <AppCabecalhoPagina tituloFino="Base de" tituloGrosso="Funcionários"
      descricao="Gestão e listagem de colaboradores do sistema" icone="fa7-solid:users" />

    <AppBarraFerramentas v-model:visaoAtual="visaoAtual">

      <template #entradas>
        <AppInputAutocomplete v-model="filtro.nomeParam" :sugestoes="sugestoesNome" :buscando="buscandoSugestoes"
          :mostrarMenu="mostrandoSugestoes" placeholder="Digite o nome do funcionário..." @buscar="buscarSugestoesNome"
          @selecionar="selecionarSugestao" @fechar="fecharSugestoesDelay" @enter="buscarLista" />

        <div class="w-full sm:w-44 shrink-0 relative">
          <select v-model="filtro.ativoParam" @change="buscarLista"
            class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer appearance-none">
            <option value="" class="bg-white dark:bg-[#1e2029] text-gray-700 dark:text-gray-300">Status: Todos</option>
            <option value="1" class="bg-white dark:bg-[#1e2029] text-gray-700 dark:text-gray-300">Status: Ativos
            </option>
            <option value="0" class="bg-white dark:bg-[#1e2029] text-gray-700 dark:text-gray-300">Status: Inativos
            </option>
          </select>
          <Icon name="fa7-solid:chevron-down"
            class="absolute right-4 top-4 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>
      </template>

      <template #acoes-secundarias>
        <button @click="abrirModalExibicao"
          class="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all shadow-sm">
          <Icon name="fa7-solid:table-columns" class="w-4 h-4 opacity-70" /> Exibição
        </button>

        <button @click="abrirModalFiltroAvancado"
          class="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all shadow-sm">
          <Icon name="fa7-solid:filter" class="w-4 h-4 text-gray-500 dark:text-gray-400" /> Filtros Avançados
        </button>
      </template>

      <template #acoes-principais>
        <NuxtLink to="/cadastro/funcionario/cadastro"
          class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <Icon name="fa7-solid:user-plus" class="w-5 h-5" /> Novo Funcionário
        </NuxtLink>
        <button @click="buscarLista"
          class="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <Icon name="fa7-solid:magnifying-glass" class="w-5 h-5" /> Pesquisar Funcionários
        </button>
      </template>

    </AppBarraFerramentas>

    <AppContainerListagem :carregando="carregandoTela" :busca-realizada="buscaRealizada" :lista="listaRegistros"
      :visao-atual="visaoAtual" :registro-inicial="registroInicial" :registro-final="registroFinal"
      :total-registros="totalRegistros" :itens-por-pagina="itensPorPagina" :total-paginas="totalPaginas"
      :pagina-atual="paginaAtual" :paginas-exibidas="paginasExibidas" @mudar-pagina="mudarPagina"
      @mudar-itens-por-pagina="mudarItensPorPagina">

      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Nome do Funcionário</th>
        <th v-show="colunasVisiveis.cpf" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documento (CPF)
        </th>
        <th v-show="colunasVisiveis.matricula" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Matrícula</th>
        <th v-show="colunasVisiveis.projeto" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Projeto / Alocação</th>
        <th v-show="colunasVisiveis.status" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Status</th>
        <th v-show="colunasVisiveis.historico" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Histórico</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4">
          <NuxtLink :to="`/cadastro/funcionario/cadastro?codigo=${item.codigo}`"
            class="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity">
            <div
              class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-transparent group-hover:border-emerald-300 transition-colors">
              {{ item.nomeCompleto.charAt(0).toUpperCase() }}
            </div>
            <div class="flex flex-col">
              <span
                class="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{
                  item.nomeCompleto }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-500">{{ item.email }}</span>
            </div>
          </NuxtLink>
        </td>
        <td v-show="colunasVisiveis.cpf" class="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">{{ item.cpf }}
        </td>
        <td v-show="colunasVisiveis.matricula"
          class="px-6 py-4 font-medium text-gray-600 dark:text-gray-400 text-center">{{ item.matricula }}</td>
        <td v-show="colunasVisiveis.projeto" class="px-6 py-4 font-medium text-gray-600 dark:text-gray-400 text-center">
          <div
            class="inline-block bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-2xl text-xs font-semibold leading-relaxed max-w-[250px] whitespace-normal break-words border border-gray-200/50 dark:border-gray-700/50 shadow-sm text-center">
            {{ item.projeto || "Não Alocado" }}
          </div>
        </td>
        <td v-show="colunasVisiveis.status" class="px-6 py-4 text-center">
          <AppAtivo :ativo="item.ativo" />
        </td>
        <td v-show="colunasVisiveis.historico" class="px-6 py-4 text-center">
          <button @click="abrirModalHistorico(item.codigo)" title="Ver Histórico"
            class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50">
            <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4" />
          </button>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.nomeCompleto" subtituloNome="Matrícula" :subtituloValor="item.matricula"
          :ativo="item.ativo" :categoriaTexto="item.projeto || 'Não Alocado'" categoriaIcone="fa7-solid:building"
          :mostrarSubtitulo="colunasVisiveis.matricula" :mostrarStatus="colunasVisiveis.status"
          :mostrarCategoria="colunasVisiveis.projeto" :mostrarHistorico="colunasVisiveis.historico" :detalhes="[
            ...(colunasVisiveis.cpf ? [{ icone: 'fa7-solid:address-card', texto: item.cpf }] : []),
            { icone: 'fa7-solid:envelope', texto: item.email || 'Sem e-mail' }
          ]" @clique-titulo="navigateTo(`/cadastro/funcionario/cadastro?codigo=${item.codigo}`)"
          @ver-detalhes="navigateTo(`/cadastro/funcionario/cadastro?codigo=${item.codigo}`)"
          @ver-historico="abrirModalHistorico(item.codigo)" />
      </template>

    </AppContainerListagem>

    <AppModalHistorico :aberto="modalHistoricoAberto" titulo="Histórico do Funcionário"
      :historico="historicoSelecionado" @close="modalHistoricoAberto = false" />
    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" :filtroObj="filtro" :projetos="projetosAtivos"
      @close="modalFiltroAvancadoAberto = false" @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado" />
    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" @close="modalExibicaoAberto = false"
      @aplicar="aplicarExibicao" />

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const {
  carregandoTela, buscaRealizada, listaRegistros, filtro, sugestoesNome, mostrandoSugestoes, buscandoSugestoes,
  buscarSugestoesNome, selecionarSugestao, fecharSugestoesDelay, visaoAtual, abrirModalFiltroAvancado,
  abrirModalExibicao, modalHistoricoAberto, historicoSelecionado, abrirModalHistorico, modalFiltroAvancadoAberto,
  limparFiltrosAvancados, aplicarFiltroAvancado, projetosAtivos, carregarProjetos, modalExibicaoAberto,
  colunasVisiveis, colunasTemp, aplicarExibicao, paginaAtual, itensPorPagina, totalRegistros, totalPaginas,
  registroInicial, registroFinal, mudarPagina, mudarItensPorPagina, paginasExibidas, buscarLista
} = useFuncionarioListagem();

onMounted(() => {
  carregarProjetos();
});
</script>