<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">

    <AppCabecalhoPagina tituloFino="Gestão de" tituloGrosso="Projetos"
      descricao="Gerenciamento de projetos, contas e verbas do sistema" icone="fa7-solid:briefcase" />

    <AppBarraFerramentas v-model:visaoAtual="visaoAtual">

      <template #entradas>
        <AppInputAutocomplete v-model="filtro.apelidoParam" :sugestoes="sugestoesProjeto" :buscando="buscandoSugestoes"
          :mostrarMenu="mostrandoSugestoes" placeholder="Digite o apelido do projeto..." @buscar="buscarSugestoesProjeto"
          @selecionar="selecionarSugestao" @fechar="fecharSugestoesDelay" @enter="buscarProjetos" />

        <AppDropdownStatus v-model="filtro.ativoParam" @change="buscarProjetos" />
      </template>

      <template #acoes-secundarias>
        <button @click="abrirModalExibicao"
          class="flex items-center gap-2 px-4 h-11 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all shadow-sm">
          <Icon name="fa7-solid:table-columns" class="w-4 h-4 opacity-70" /> Exibição
        </button>

        <button @click="abrirModalFiltroAvancado"
          class="flex items-center gap-2 px-4 h-11 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all shadow-sm">
          <Icon name="fa7-solid:filter" class="w-4 h-4 text-gray-500 dark:text-gray-400" /> Filtros Avançados
        </button>
      </template>

      <template #acoes-principais>
        <NuxtLink to="/cadastro/projeto/cadastro?id=0"
          class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 h-11 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <Icon name="fa7-solid:plus" class="w-5 h-5" /> Novo Projeto
        </NuxtLink>
        <button @click="buscarProjetos"
          class="w-full sm:w-auto flex items-center justify-center gap-3 px-8 h-11 bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <Icon name="fa7-solid:magnifying-glass" class="w-5 h-5" /> Pesquisar Projetos
        </button>
      </template>

    </AppBarraFerramentas>

    <AppContainerListagem :carregando="carregandoTela" :busca-realizada="buscaRealizada" :lista="listaRegistros"
      :visao-atual="visaoAtual" :registro-inicial="registroInicial" :registro-final="registroFinal"
      :total-registros="totalRegistros" :itens-por-pagina="itensPorPagina" :total-paginas="totalPaginas"
      :pagina-atual="paginaAtual" :paginas-exibidas="paginasExibidas" @mudar-pagina="mudarPagina"
      @mudar-itens-por-pagina="mudarItensPorPagina">

      <template #cabecalho-tabela>
        <th class="px-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projeto</th>
        <th v-show="colunasVisiveis.cnpj" class="px-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CNPJ</th>
        <th v-show="colunasVisiveis.contas" class="px-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Contas</th>
        <th v-show="colunasVisiveis.verbas" class="px-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Verbas</th>
        <th v-show="colunasVisiveis.status" class="px-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th v-show="colunasVisiveis.historico" class="px-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-2 max-w-[250px] whitespace-normal">
          <NuxtLink :to="`/cadastro/projeto/cadastro?id=${item.codigo}`" class="flex flex-col group cursor-pointer">
            <span class="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words">
              {{ item.apelido }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-500 break-words">{{ item.descricao }}</span>
          </NuxtLink>
        </td>
        
        <td v-show="colunasVisiveis.cnpj" class="px-6 py-2 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ item.cnpj }}</td>
        
        <td v-show="colunasVisiveis.contas" class="px-6 py-2 text-center whitespace-nowrap">
          <button @click="abrirModalConta(item.codigo)" title="Ver Contas"
            class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50">
            <Icon name="fa7-solid:building-columns" class="w-4 h-4" />
          </button>
        </td>
        
        <td v-show="colunasVisiveis.verbas" class="px-6 py-2 text-center whitespace-nowrap">
          <button @click="abrirModalVerba(item.codigo)" title="Ver Verbas"
            class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50">
            <Icon name="fa7-solid:sack-dollar" class="w-4 h-4" />
          </button>
        </td>
        
        <td v-show="colunasVisiveis.status" class="px-6 py-2 text-center whitespace-nowrap">
          <AppAtivo :ativo="item.ativo" />
        </td>
        
        <td v-show="colunasVisiveis.historico" class="px-6 py-2 text-center whitespace-nowrap">
          <button @click="abrirModalHistorico(item.codigo)" title="Ver Histórico"
            class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50">
            <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4" />
          </button>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.apelido" subtituloNome="CNPJ" :subtituloValor="item.cnpj"
          :ativo="item.ativo" :categoriaTexto="item.descricao" categoriaIcone="fa7-solid:file-signature"
          :mostrarSubtitulo="colunasVisiveis.cnpj" :mostrarStatus="colunasVisiveis.status"
          :mostrarCategoria="true" :mostrarHistorico="colunasVisiveis.historico" 
          :detalhes="[]" 
          @clique-titulo="navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)"
          @ver-detalhes="navigateTo(`/cadastro/projeto/cadastro?id=${item.codigo}`)"
          @ver-historico="abrirModalHistorico(item.codigo)" />
      </template>

    </AppContainerListagem>

    <AppModalHistorico :aberto="modalHistoricoAberto" titulo="Histórico do Projeto"
      :historico="historicoSelecionado" @close="modalHistoricoAberto = false" />
      
    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" 
      @close="modalFiltroAvancadoAberto = false" @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
      
      <AppInputCnpj v-model="filtro.cnpjParam" label="CNPJ do Projeto" />
      
      <AppSelect v-model="filtro.contaParam" label="Conta Vinculada (Banco)" 
        :opcoes="[{ codigo: '1', descricao: 'Banco do Brasil' }, { codigo: '2', descricao: 'Caixa' }]" />
        
      <AppSelect v-model="filtro.verbaParam" label="Verba" 
        :opcoes="[{ codigo: '1', descricao: 'Verba CLT' }, { codigo: '2', descricao: 'Verba Estágio' }]" />
        
    </AppModalFiltroAvancado>
      
    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labelsColunas"
      @close="modalExibicaoAberto = false" @aplicar="aplicarExibicao" />

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const {
  filtro, listaRegistros, carregandoTela, buscaRealizada,
  visaoAtual, registroInicial, registroFinal, totalRegistros,
  itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  colunasVisiveis, colunasTemp, modalExibicaoAberto, aplicarExibicao, abrirModalExibicao,
  labelsColunas, // PUXA O DICIONÁRIO AQUI!
  modalHistoricoAberto, historicoSelecionado, abrirModalHistorico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  sugestoesProjeto, mostrandoSugestoes, buscandoSugestoes, buscarSugestoesProjeto, selecionarSugestao, fecharSugestoesDelay,
  buscarProjetos, mudarPagina, mudarItensPorPagina,
  abrirModalConta, abrirModalVerba
} = useProjetoListagem()

onMounted(() => {
  // buscarProjetos()
})
</script>