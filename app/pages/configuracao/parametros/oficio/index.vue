<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppFiltro 
      v-model="filtro" 
      v-model:viewMode="visaoAtual" 
      :campos="camposFiltro" 
      titulo="Parâmetros de Ofício"
      descricao="Gerencie a redação padrão e variáveis dos ofícios gerados pelo sistema" 
      icone-titulo="fa7-solid:file-signature"
      :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Configuração' }, { label: 'Parâmetros' }, { label: 'Ofício' }]"
      :pending="carregando"
      @buscar="buscarLista"
      @openAdvancedFilter="abrirModalFiltroAvancado"
    >
      <template #acoes>
        <AppBotao variacao="padrao" icone="fa7-solid:desktop" @click="abrirModalExibicao">Controle de Exibição</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:pen-nib" @click="navigateTo('/configuracao/parametros/oficio/padrao')">
          Redação Padrão
        </AppBotao>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/configuracao/parametros/oficio/cadastro?id=0')">
            Novo Registro
        </AppBotao>
      </template>

      <AppContainerListagem 
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
      >
        <template #cabecalho-tabela>
          <th v-if="colunas.projeto" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Projeto</th>
          <th v-if="colunas.comSaldo" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Com Saldo</th>
          <th v-if="colunas.historico" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
        </template>

        <template #linhas-tabela="{ item }">
          <td v-if="colunas.projeto" class="px-6 py-4 max-w-[350px]">
            <NuxtLink :to="`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`" class="flex items-center gap-3 group">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0 group-hover:bg-emerald-500/20 transition-all shadow-sm">
                {{ item.apelido ? item.apelido.charAt(0).toUpperCase() : 'P' }}
              </div>
              <div class="flex flex-col min-w-0 justify-center">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {{ item.projeto ? `${item.apelido} - ${item.projeto}` : item.apelido }}
                </span>
              </div>
            </NuxtLink>
          </td>
          <td v-if="colunas.comSaldo" class="px-6 py-4 text-center">
            <span v-if="item.saldoOficio" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">Sim</span>
            <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20 shadow-sm">Não</span>
          </td>
          <td v-if="colunas.historico" class="px-6 py-4 text-center">
            <div class="flex items-center justify-center">
              <button @click.stop="abrirHistorico(item.codigo)" class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ver Histórico">
                <Icon name="fa6-solid:clock-rotate-left" class="w-5 h-5" />
              </button>
            </div>
          </td>
        </template>

        <template #cards="{ item }">
          <AppCardListagem 
            :titulo="item.apelido" 
            :subtituloNome="'Projeto'" 
            :subtituloValor="item.projeto"
            :ativo="true"
            :mostrarHistorico="colunas.historico"
            :detalhes="[
              { icone: 'fa7-solid:barcode', texto: `Cód: ${item.codigo}` }
            ]" 
            @ver-detalhes="navigateTo(`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`)" 
            @ver-historico="abrirHistorico(item.codigo)"
            @clique-titulo="navigateTo(`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`)" 
          >
          </AppCardListagem>
        </template>
      </AppContainerListagem>
    </AppFiltro>

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
        <div class="md:col-span-2">
          <AppInputTexto v-model="filtro.projetoNome" label="NOME DO PROJETO" placeholder="Buscar por projeto..." icone="fa7-solid:magnifying-glass" />
        </div>
        <div class="md:col-span-2">
          <AppSelect 
            v-model="filtro.comSaldo" 
            label="POSSUI SALDO?" 
            placeholder="Selecione..."
            :opcoes="[{codigo: '', descricao: 'Todos'}, {codigo: '1', descricao: 'Sim'}, {codigo: '0', descricao: 'Não'}]" 
            itemValue="codigo" 
            itemLabel="descricao" 
          />
        </div>
    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoData"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscarLista, modalHistoricoAberto, historicoData, abrirHistorico, carregandoHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  modalExibicaoAberto, abrirModalExibicao, colunas, labels, aplicarExibicao, colunasTemp,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useParametrosOficioListagem()

const camposFiltro = computed(() => [
  { key: 'projetoNome', label: 'Projeto', type: 'text' as const, placeholder: 'Digite o nome do projeto...' }
])
</script>