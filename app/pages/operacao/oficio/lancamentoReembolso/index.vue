<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Gestão de" 
      tituloGrosso="Lançamento Reembolso"
      descricao="Controle e acompanhamento de ofícios de reembolso" 
      icone="fa7-solid:file-invoice-dollar" 
    />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
          <div class="md:col-span-5">
            <AppSelect 
              v-model="filtro.projeto" 
              label="Projeto" 
              placeholder="Todos os Projetos"
              :opcoes="projetos" 
              itemValue="codigo" 
              itemLabel="apelido" 
            />
          </div>
          <div class="md:col-span-4">
            <AppSelect 
              v-model="filtro.tipoMovimentacao" 
              label="Tipo Movimentação" 
              placeholder="Todas"
              :opcoes="tiposMovimentacao" 
              itemValue="codigo" 
              itemLabel="descricao" 
            />
          </div>
          <div class="md:col-span-3">
              <AppInputTexto 
                  v-model="filtro.dataMovimentacao" 
                  label="Data Mov." 
                  placeholder="dd/mm/aaaa"
                  icone="fa7-solid:calendar-days"
                  v-maska="'##/##/####'"
              />
          </div>
        </div>
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:table-columns" @click="abrirModalExibicao">Exibição</AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="primario" icone="fa7-solid:file-circle-plus" @click="novoRegistro">
          Novo Lançamento
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Pesquisar Lançamentos
        </AppBotao>
      </template>
    </AppBarraFerramentas>

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
        <th v-if="colunas.projeto" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Projeto</th>
        <th v-if="colunas.contaVinculada" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Conta Vinculada</th>
        <th v-if="colunas.tipoMov" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Tipo Mov.</th>
        <th v-if="colunas.vlrMov" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Vlr Mov.</th>
        <th v-if="colunas.dataOficio" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Data Ofício</th>
        <th v-if="colunas.status" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th v-if="colunas.acoes" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td v-if="colunas.projeto" class="px-6 py-4 font-bold text-sm text-gray-900 dark:text-gray-100">{{ item.projeto }}</td>
        <td v-if="colunas.contaVinculada" class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ item.contaVinculada }}</td>
        <td v-if="colunas.tipoMov" class="px-6 py-4 text-center">
            <span class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg font-bold">{{ item.tipoMovimentacao }}</span>
        </td>
        <td v-if="colunas.vlrMov" class="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">R$ {{ item.valorMovimentacao }}</td>
        <td v-if="colunas.dataOficio" class="px-6 py-4 text-center text-sm">{{ item.dataOficio }}</td>
        <td v-if="colunas.status" class="px-6 py-4 text-center">
          <span :class="item.status === 'Aprovado' || item.status === 'Liquidado' ? 'text-green-600 bg-green-50 border-green-200' : 'text-amber-600 bg-amber-50 border-amber-200'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border">
            {{ item.status }}
          </span>
        </td>
        <td v-if="colunas.acoes" class="px-6 py-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <button @click="abrirModalFuncionarios(item.codigo)" 
              :class="item.funcionario === 1 ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 opacity-50 cursor-not-allowed'" 
              class="p-2 rounded-xl transition-all" title="Funcionários">
              <Icon name="fa7-solid:users" class="w-5 h-5" />
            </button>
            <button @click="abrirModalDetalhes(item.codigo)" 
              class="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ver Detalhes">
              <Icon name="fa7-solid:circle-info" class="w-5 h-5" />
            </button>
            <button @click="gerarPdfOficio(item.codigo)" 
              class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all" title="PDF Ofício">
              <Icon name="fa7-solid:file-pdf" class="w-5 h-5" />
            </button>
            <NuxtLink :to="`/operacao/oficio/lancamentoReembolso/cadastro?id=${item.codigo}`"
              class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Editar">
              <Icon name="fa7-solid:pen-to-square" class="w-5 h-5" />
            </NuxtLink>
          </div>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.projeto" 
          :subtituloNome="item.contaVinculada" 
          :subtituloValor="`R$ ${item.valorMovimentacao}`"
          :ativo="true"
          :detalhes="[
            { icone: 'fa7-solid:hashtag', texto: `Tipo: ${item.tipoMovimentacao}` },
            { icone: 'fa7-solid:calendar-check', texto: `Ofício: ${item.dataOficio}` },
            { icone: 'fa7-solid:clock-rotate-left', texto: `Status: ${item.status}` }
          ]" 
          @ver-detalhes="abrirModalDetalhes(item.codigo)"
          @clique-titulo="navigateTo(`/operacao/oficio/lancamentoReembolso/cadastro?id=${item.codigo}`)" 
        />
      </template>
    </AppContainerListagem>

    <AppModal 
        :isOpen="modalDetalhesAberto" 
        title="Detalhes do Lançamento" 
        icon="fa7-solid:circle-info"
        @close="modalDetalhesAberto = false"
    >
      <div class="space-y-6 p-6">
          <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Motivo / Justificativa</h4>
              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
                  {{ detalhes.motivo || 'Motivo não informado.' }}
              </p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col gap-1">
                  <span class="text-[8px] font-black text-blue-500 uppercase tracking-widest leading-none">Cadastrado por</span>
                  <span class="text-xs font-black text-blue-700 dark:text-blue-400 uppercase">{{ detalhes.usuarioCadastro }}</span>
              </div>
              <div class="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col gap-1">
                  <span class="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Data Cadastro</span>
                  <span class="text-xs font-black text-emerald-700 dark:text-emerald-400">{{ detalhes.dataCadastro }}</span>
              </div>
          </div>
      </div>
      <template #footer>
          <AppBotao variacao="primario" @click="modalDetalhesAberto = false" class="w-full">Fechar Detalhes</AppBotao>
      </template>
    </AppModal>

    <AppModal 
        :isOpen="modalFuncionarioAberto" 
        title="Funcionários do Lançamento" 
        icon="fa7-solid:users"
        @close="modalFuncionarioAberto = false"
    >
      <div class="p-6">
        <div v-if="listaFuncionariosModal.length > 0" class="space-y-3">
            <div v-for="(func, index) in listaFuncionariosModal" :key="index" 
                class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all group">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 font-black text-sm group-hover:bg-emerald-500/20 transition-all">
                    {{ func.funcionario.charAt(0).toUpperCase() }}
                </div>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{ func.funcionario }}</span>
            </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-10 opacity-60">
            <Icon name="fa7-solid:building-user" class="w-16 h-16 text-gray-300 mb-4" />
            <p class="text-lg font-black text-gray-400">Global para o Projeto</p>
            <p class="text-xs font-medium text-gray-500">Este lançamento foi aplicado a todos os funcionários.</p>
        </div>
      </div>
      <template #footer>
          <AppBotao variacao="primario" @click="modalFuncionarioAberto = false" class="w-full">Fechar</AppBotao>
      </template>
    </AppModal>

    <AppModalExibicao 
      :aberto="modalExibicaoAberto" 
      :colunas="colunasTemp" 
      :labels="labels" 
      @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" 
    />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, projetos, tiposMovimentacao,
  buscarLista, filtrar, novoRegistro,
  modalDetalhesAberto, detalhes, abrirModalDetalhes,
  modalFuncionarioAberto, listaFuncionariosModal, abrirModalFuncionarios, gerarPdfOficio,
  modalExibicaoAberto, abrirModalExibicao, aplicarExibicao, colunas, labels, colunasTemp, placeholderDinamico,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useLancamentoReembolsoListagem()
</script>