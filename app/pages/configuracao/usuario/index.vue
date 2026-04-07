<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

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
          <th scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Usuário</th>
          <th v-show="colunas.login" scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Login</th>
          <th v-show="colunas.cpf" scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">CPF</th>
          <th v-show="colunas.status" scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
          <th v-show="colunas.historico" scope="col" class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Histórico</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td class="p-4">
            <NuxtLink :to="`/configuracao/usuario/cadastro?codigo=${item.codigo}&modo=visualizar`" class="flex items-center gap-3 group">
              <div class="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-base shrink-0 group-hover:bg-emerald-500/20 transition-all">
                {{ (item.nome || 'U').charAt(0).toUpperCase() }}
              </div>
              <span class="text-base font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-emerald-500 transition-colors uppercase">
                {{ item.nome }}
              </span>
            </NuxtLink>
          </td>
          <td v-show="colunas.login" class="p-4 text-base font-bold text-gray-500 dark:text-gray-400">
            {{ item.login }}
          </td>
          <td v-show="colunas.cpf" class="p-4 text-base font-bold text-gray-500 dark:text-gray-400">
            {{ item.cpf }}
          </td>
          <td v-show="colunas.status" class="p-4 text-center">
            <AppAtivo :ativo="item.ativo" />
          </td>
          <td v-show="colunas.historico" class="p-4 text-center">
            <div class="flex items-center justify-center">
              <button @click.stop="abrirHistorico(item.codigo)" 
                class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ver Histórico">
                <Icon name="fa6-solid:clock-rotate-left" class="w-5 h-5" />
              </button>
            </div>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem :titulo="item.nome" :subtituloNome="'Login'" :subtituloValor="item.login" :ativo="item.ativo"
            :mostrarStatus="colunas.status" :mostrarHistorico="colunas.historico" 
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
