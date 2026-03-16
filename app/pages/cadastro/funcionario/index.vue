<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Base de" tituloGrosso="Funcionários"
      descricao="Gestão e listagem de colaboradores do sistema" icone="fa7-solid:users" />

    <div
      class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="flex flex-col xl:flex-row items-center gap-4">
        <div class="flex-1 w-full text-left">
          <AppInputAutocomplete v-model="filtro.nomeParam" :sugestoes="sugestoesNome" :buscando="buscandoSugestoes"
            :mostrarMenu="mostrandoSugestoes" placeholder="Digite o nome do funcionário..."
            @buscar="buscarSugestoesNome" @selecionar="selecionarSugestao" @fechar="fecharSugestoesDelay"
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
        <AppBotao variacao="primario" icone="fa7-solid:user-plus" @click="navigateTo('/cadastro/funcionario/cadastro')">
          Novo Funcionário
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Pesquisar Funcionários
        </AppBotao>
      </div>
    </div>

    <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
      :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
      :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
      :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
      @mudarItensPorPagina="mudarItensPorPagina">

      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Funcionário</th>
        <th v-if="colunas.matricula" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Matrícula</th>
        <th v-if="colunas.projeto" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Projeto</th>
        <th v-if="colunas.cpf" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          CPF</th>
        <th v-if="colunas.status" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Status</th>
        <th v-if="colunas.historico" scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Histórico</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4 max-w-[300px]">
          <NuxtLink :to="`/cadastro/funcionario/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
            <div
              class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
              {{ item.nomeCompleto.charAt(0).toUpperCase() }}
            </div>
            <div class="flex flex-col min-w-0">
              <span
                class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{
                  item.nomeCompleto }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.email }}</span>
            </div>
          </NuxtLink>
        </td>
        <td v-if="colunas.matricula" class="px-6 py-4 text-center">
          <span
            class="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{{
              item.matricula }}</span>
        </td>
        <td v-if="colunas.projeto" class="px-6 py-4 text-center">
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">{{ item.projeto || 'Sem Projeto'
          }}</span>
        </td>
        <td v-if="colunas.cpf" class="px-6 py-4 text-center">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ item.cpf }}</span>
        </td>
        <td v-if="colunas.status" class="px-6 py-4 text-center">
          <AppAtivo :ativo="Number(item.ativo) === 1 || item.ativo === true" />
        </td>
        <td v-if="colunas.historico" class="px-6 py-4 text-center">
          <div class="flex items-center justify-center">
            <button @click.stop="abrirHistorico(item.codigo)"
              class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
              title="Ver Histórico">
              <Icon name="fa6-solid:clock-rotate-left" class="w-5 h-5" />
            </button>
          </div>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.nomeCompleto" subtituloNome="E-mail" :subtituloValor="item.email"
          :ativo="Number(item.ativo) === 1 || item.ativo === true" :mostrarStatus="colunas.status"
          :mostrarHistorico="colunas.historico" :detalhes="[
            ...(colunas.matricula ? [{ icone: 'fa7-solid:id-badge', texto: `Matrícula: ${item.matricula}` }] : []),
            ...(colunas.projeto ? [{ icone: 'fa7-solid:id-card', texto: `Projeto: ${item.projeto || 'Sem Projeto'}` }] : []),
            ...(colunas.cpf ? [{ icone: 'fa7-solid:address-card', texto: `CPF: ${item.cpf}` }] : [])
          ]" @ver-detalhes="navigateTo(`/cadastro/funcionario/cadastro?codigo=${item.codigo}`)"
          @ver-historico="abrirHistorico(item.codigo)"
          @clique-titulo="navigateTo(`/cadastro/funcionario/cadastro?codigo=${item.codigo}`)" />
      </template>

    </AppContainerListagem>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoSelecionado"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">

      <AppInputCpf v-model="filtro.cpfParam" label="Documento (CPF)" placeholder="Digite o CPF..." />

      <AppInputTexto v-model="filtro.matriculaParam" label="Matrícula" placeholder="Ex: 31758"
        icone="fa7-solid:id-badge" />

      <AppSelect v-model="filtro.projetoParam" label="Projeto / Alocação" placeholder="Todos os Projetos"
        :opcoes="projetosFormatados" />

      <AppInputEmail v-model="filtro.emailParam" label="E-mail" placeholder="email@empresa.com" />

    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, sugestoesNome, buscandoSugestoes, mostrandoSugestoes,
  buscarSugestoesNome, selecionarSugestao, fecharSugestoesDelay, buscarLista,
  abrirHistorico, modalHistoricoAberto, codigoHistorico, historicoSelecionado, carregandoHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  modalExibicaoAberto, abrirModalExibicao, carregarProjetos, projetosAtivos,
  colunas, labels, aplicarExibicao, colunasTemp,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useFuncionarioListagem()

const projetosFormatados = computed(() => {
  const lista = projetosAtivos.value || []
  return lista.map(p => ({
    codigo: p.codigo,
    descricao: `${p.apelido} - ${p.descricao}`
  }))
})
</script>