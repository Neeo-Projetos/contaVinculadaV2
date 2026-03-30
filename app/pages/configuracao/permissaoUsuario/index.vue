<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Permissões"
      descricao="Controle de acessos e privilégios dos usuários do sistema" 
      icone-titulo="fa7-solid:shield-halved"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Configuração' }, { label: 'Permissões' }]"
      :pending="carregando"
      @buscar="buscarUsuarios"
      @openAdvancedFilter="abrirModalFiltroAvancado"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="abrirModalExibicao">Controle de Exibição</AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:user-plus" @click="navigateTo('/configuracao/permissaoUsuario/cadastro?id=0')">
          Novo Acesso
        </AppBotao>
      </template>

      <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
        :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
        :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
        :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
        @mudarItensPorPagina="mudarItensPorPagina">
        
        <template #cabecalho-tabela>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Login</th>
          <th v-if="colunas.usuario" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Usuário</th>
          <th v-if="colunas.cpf" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            CPF</th>
          <th v-if="colunas.historico" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Histórico</th>
          <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
            Ações</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td class="px-6 py-4 max-w-[300px]">
            <NuxtLink :to="`/configuracao/permissaoUsuario/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all">
                <Icon name="fa7-solid:shield-halved" class="w-5 h-5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ item.login }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate">Configurar permissões</span>
              </div>
            </NuxtLink>
          </td>
          <td v-if="colunas.usuario" class="px-6 py-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.nomeUsuario }}</span>
          </td>
          <td v-if="colunas.cpf" class="px-6 py-4 text-center">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ item.cpf }}</span>
          </td>
          <td v-if="colunas.historico" class="px-6 py-4 text-center">
            <button @click.stop="abrirHistorico(item.codigo)" class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ver Histórico">
              <Icon name="fa6-solid:clock-rotate-left" class="w-5 h-5" />
            </button>
          </td>
          <td class="px-6 py-4 text-center">
            <NuxtLink :to="`/configuracao/permissaoUsuario/cadastro?codigo=${item.codigo}`" class="p-2.5 inline-flex items-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ir para edição de permissão">
              <Icon name="fa7-solid:user-shield" class="w-5 h-5" />
            </NuxtLink>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.login" :subtituloNome="'E-mail ou Documento'" :subtituloValor="item.cpf" :ativo="true"
            :mostrarHistorico="colunas.historico"
            :detalhes="[
              ...(colunas.usuario ? [{ icone: 'fa7-solid:user', texto: `Usuário: ${item.nomeUsuario}` }] : [])
            ]" 
            @ver-detalhes="navigateTo(`/configuracao/permissaoUsuario/cadastro?codigo=${item.codigo}`)"
            @ver-historico="abrirHistorico(item.codigo)"
            @clique-titulo="navigateTo(`/configuracao/permissaoUsuario/cadastro?codigo=${item.codigo}`)">
          </AppCardListagem>
        </template>

      </AppContainerListagem>
    </AppFiltro>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoData" :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />
    
    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      <AppInputCpf v-model="filtro.cpf" label="Documento (CPF)" placeholder="Digite o CPF..." />
      <AppInputTexto v-model="filtro.nomeUsuario" label="Nome do Usuário" placeholder="Nome do usuário" icone="fa7-solid:user" />
    </AppModalFiltroAvancado>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscarUsuarios, modalHistoricoAberto, historicoData, carregandoHistorico, abrirHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  modalExibicaoAberto, colunas, colunasTemp, labels, abrirModalExibicao, aplicarExibicao,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = usePermissaoUsuarioListagem()

const camposFiltro = computed(() => [
  { key: 'login', label: 'Login', type: 'text' as const, placeholder: 'Filtrar por login...' },
  {
    key: 'ativoParam',
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