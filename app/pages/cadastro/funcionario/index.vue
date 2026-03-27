<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Base de" tituloGrosso="Funcionários"
      descricao="Gestão e listagem de colaboradores do sistema" icone="fa7-solid:users" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual" mostrar-relatorio @excel="gerarExcel" @pdf="gerarPdf">
      <template #entradas>
        <AppInputAutocomplete 
          v-model="filtro.nomeParam" 
          :sugestoes="sugestoesNome" 
          :buscando="buscandoSugestoes"
          :mostrarMenu="mostrandoSugestoes" 
          :placeholder="placeholderDinamico"
          @buscar="buscarSugestoesNome" 
          @selecionar="selecionarSugestao" 
          @fechar="fecharSugestoesDelay"
          @enter="buscarLista" 
        />
        <AppSelecaoStatus v-model="filtro.ativoParam" />
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:table-columns" @click="abrirModalExibicao">Exibição</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:filter" @click="abrirModalFiltroAvancado">Filtros Avançados</AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="acao" icone="fa7-solid:user-plus" @click="navigateTo('/cadastro/funcionario/cadastro')">
          Novo Funcionário
        </AppBotao>
      </template>

      <template #acoes-pesquisa>
        <AppBotao variacao="acao" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Pesquisar Funcionários
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem v-model:filtro-global="filtroGlobal" :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
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
                  item.nomeAbreviado || item.nomeCompleto }}</span>
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
        <AppCardListagem :titulo="item.nomeAbreviado || item.nomeCompleto" subtituloNome="E-mail" :subtituloValor="item.email"
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
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, sugestoesNome, buscandoSugestoes, mostrandoSugestoes,
  buscarSugestoesNome, selecionarSugestao, fecharSugestoesDelay, buscarLista, filtroGlobal,
  abrirHistorico, modalHistoricoAberto, codigoHistorico, historicoSelecionado, carregandoHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  modalExibicaoAberto, abrirModalExibicao, carregarProjetos, projetosAtivos,
  colunas, labels, aplicarExibicao, colunasTemp,
  placeholderDinamico, projetosFormatados,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useFuncionarioListagem()

const gerarExcel = () => {
    alert('📊 Gerando relatório Excel dos Funcionários...')
}

const gerarPdf = () => {
    alert('📄 Gerando PDF da Base de Funcionários...')
}
</script>