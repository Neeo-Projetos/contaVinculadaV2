<template>
  <div class="min-h-full flex flex-col gap-4 p-4 md:p-6 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Usuários"
      descricao="Gerenciamento de acessos e permissões do sistema" 
      icone-titulo="fa7-solid:user-gear"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Configuração' }, { label: 'Usuários' }]"
      :pending="carregando"
      @buscar="buscarLista"
      @openAdvancedFilter="abrirModalFiltroAvancado"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="abrirModalExibicao">Controle de Exibição</AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:user-plus" @click="navigateTo('/configuracao/usuario/cadastro')">
          Novo Usuário
        </AppBotao>
      </template>

      <AppContainerListagem 
        ref="listagemRef"
        :carregando="carregando" 
        :buscaRealizada="buscaRealizada" 
        :lista="dados || []"
        :visaoAtual="visaoAtual" 
        :registroInicial="registroInicial" 
        :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" 
        :itensPorPagina="itensPorPagina" 
        :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" 
        :paginasExibidas="paginasExibidas" 
        @mudarPagina="mudarPagina"
        @mudarItensPorPagina="mudarItensPorPagina"
        :history="true"
        nomeTela="Usuário"
        endpointDelete="/api/configuracao/usuario/excluir"
        @view="item => navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}&modo=visualizar`)"
        @edit="item => navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}`)"
        @history="codigo => abrirHistorico(Number(codigo))"
        @delete-success="buscarLista"
      >

        <template #cabecalho-tabela>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
            Usuário</th>
          <th v-if="colunas.login" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
            Login</th>
          <th v-if="colunas.cpf" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
            CPF</th>
          <th v-if="colunas.status" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Status</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td class="px-6 py-4">
            <NuxtLink :to="`/configuracao/usuario/cadastro?codigo=${item.codigo}&modo=visualizar`" class="flex items-center gap-3 group">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                {{ (item.nome || 'U').charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase">
                  {{ item.nome }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">Usuário do Sistema</span>
              </div>
            </NuxtLink>
          </td>
          <td v-if="colunas.login" class="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 text-left">
            {{ item.login }}
          </td>
          <td v-if="colunas.cpf" class="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 text-left">
            {{ item.cpf }}
          </td>
          <td v-if="colunas.status" class="px-6 py-4 text-center">
            <AppAtivo :ativo="item.ativo !== 0" />
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.nome" :subtituloNome="'Login'" :subtituloValor="item.login" :ativo="item.ativo !== 0"
            :mostrarStatus="colunas.status" :mostrarHistorico="true" 
            :detalhes="[
              ...(colunas.cpf ? [{ icone: 'fa7-solid:address-card', texto: `CPF: ${item.cpf}` }] : []),
              ...(colunas.login ? [{ icone: 'fa7-solid:id-badge', texto: `Login: ${item.login}` }] : [])
            ]"
            @ver-detalhes="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}&modo=visualizar`)"
            @editar="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}`)"
            @excluir="() => listagemRef?.triggerDelete(item.codigo)"
            @ver-historico="abrirHistorico(item.codigo)"
            @clique-titulo="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}&modo=visualizar`)" />
        </template>

      </AppContainerListagem>
    </AppFiltro>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoSelecionado"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      <AppInputTexto v-model="filtro.login" label="LOGIN" placeholder="Digite o login..." />
      <AppInputCpf v-model="filtro.cpf" label="CPF" />
      <AppSelect 
        v-model="filtro.projeto" 
        label="PROJETO" 
        placeholder="Selecione o projeto..." 
        :opcoes="[{ codigo: '', descricao: 'Todos os Projetos' }, ...projetosFormatados]" 
        class="md:col-span-2"
      />
    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" 
      @aplicar="aplicarExibicao" @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, filtro, buscarLista, filtrar,
  dados, paginaAtual, itensPorPagina, totalRegistros, totalPaginas,
  registroInicial, registroFinal, paginasExibidas,
  mudarPagina, mudarItensPorPagina,
  modalExibicaoAberto, abrirModalExibicao, aplicarExibicao, colunas, labels, colunasTemp,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  modalHistoricoAberto, abrirHistorico, historicoSelecionado, carregandoHistorico,
  projetosFormatados, placeholderDinamico
} = useUsuarioListagem()

const listagemRef = ref<any>(null)

const camposFiltro = computed(() => [
  { key: 'nome', label: 'Usuário', type: 'text' as const, placeholder: placeholderDinamico.value },
  {
    key: 'ativo',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'Ativos', value: '1' },
      { label: 'Inativos', value: '0' },
      { label: 'Todos', value: '' }
    ]
  }
])
</script>
