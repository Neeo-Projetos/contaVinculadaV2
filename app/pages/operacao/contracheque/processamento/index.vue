<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Processamento de" 
      tituloGrosso="Contracheques"
      descricao="Analise e aprove as retenções processadas via importação" 
      icone="fa7-solid:gears" 
    />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
          <div class="md:col-span-3">
            <AppInputTexto v-model="filtro.mesAno" label="Mês/Ano" placeholder="MM/AAAA" v-maska="'##/####'" icone="fa7-solid:calendar-circle-exclamation" />
          </div>
          <div class="md:col-span-9">
            <AppInputAutocomplete 
                v-model="nomeFuncionarioSearch" 
                label="Buscar Funcionário" 
                placeholder="Digite o nome do colaborador..." 
                :sugestoes="sugestoesFuncionarios" 
                :buscando="buscandoFuncionarios"
                :mostrarMenu="mostrarMenuFuncionarios"
                @buscar="buscarFuncionarios"
                @selecionar="selecionarFuncionario"
                @fechar="mostrarMenuFuncionarios = false"
                icone="fa7-solid:user-magnifying-glass"
            />
          </div>
        </div>
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:filter-list" @click="modalFiltroAvancadoAberto = true">Avançado</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:file-import" @click="navigateTo('/operacao/contracheque/importacao')">
            Importar
        </AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarProcessamentos">Consultar</AppBotao>
        
        <template v-if="filtro.status === '2' && dados.length > 0">
            <div class="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
            <AppBotao variacao="sucesso" icone="fa7-solid:check-double" @click="processarContracheque(1)">
                Aprovar
            </AppBotao>
            <AppBotao variacao="perigo" icone="fa7-solid:ban" @click="processarContracheque(0)">
                Reprovar
            </AppBotao>
        </template>
      </template>
    </AppBarraFerramentas>

    <div class="flex items-center justify-between px-2" v-if="totalRegistros > 0">
        <div class="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Icon name="fa7-solid:circle-info" class="w-4 h-4 text-emerald-500" />
            <span>{{ totalRegistros }} registros encontrados</span>
        </div>
    </div>

    <!-- Modal de Filtro Avançado Padrão -->
    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false" @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
        <div class="md:col-span-2">
            <AppSelect 
                v-model="filtro.projeto" 
                label="Unidade / Projeto" 
                placeholder="Todos os projetos" 
                :opcoes="projetos" 
                itemValue="codigo" 
                itemLabel="apelido"
                icone="fa7-solid:building-user"
            />
        </div>
        <div class="md:col-span-2 mt-4">
            <AppSelect 
                v-model="filtro.status" 
                label="Status da Remessa" 
                :opcoes="[{codigo: '2', descricao: 'Pendentes de Aprovação'}, {codigo: '1', descricao: 'Lotes Aprovados'}, {codigo: '0', descricao: 'Lotes Reprovados'}]" 
                itemValue="codigo" 
                itemLabel="descricao"
                icone="fa7-solid:shield-clock"
            />
        </div>
    </AppModalFiltroAvancado>

    <div class="relative min-h-[400px]">
        <AppSobreposicaoCarregamento :carregando="carregando" mensagem="Buscando registros de processamento..." />
        
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
            <th v-if="filtro.status === '2'" class="px-6 py-5 text-center w-20">
                <button @click="marcarDesmarcarTodos" class="w-9 h-9 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center mx-auto" title="Selecionar Todos">
                    <Icon name="fa7-solid:check-double" class="w-4 h-4" />
                </button>
            </th>
            <th scope="col" class="px-6 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-left">{{ labelsColunas.funcionario }}</th>
            <th scope="col" class="px-6 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-left">{{ labelsColunas.projeto }}</th>
            <th scope="col" class="px-6 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">{{ labelsColunas.valorLiquido }}</th>
            <th scope="col" class="px-6 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">{{ labelsColunas.valorRetencao }}</th>
            <th scope="col" class="px-6 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center">{{ labelsColunas.status }}</th>
            <th scope="col" class="px-6 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Ação</th>
        </template>

        <template #linhas-tabela="{ item }">
            <td v-if="filtro.status === '2'" class="px-6 py-4 text-center">
                <input type="checkbox" v-model="item.selecionado" class="w-6 h-6 rounded-xl border-gray-200 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer shadow-sm transition-all bg-white dark:bg-gray-800" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-4">
                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700 font-black text-gray-500 dark:text-gray-400 text-xs shadow-sm">
                        {{ item.funcionario.substring(0, 2).toUpperCase() }}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm font-black text-gray-900 dark:text-gray-100 group-hover:text-emerald-500 transition-colors">{{ item.funcionario }}</span>
                        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                           <Icon name="fa7-solid:address-card" class="w-3 h-3 opacity-50" /> {{ item.cpf }} <span class="opacity-20">|</span> <Icon name="fa7-solid:fingerprint" class="w-3 h-3 opacity-50" /> {{ item.matricula }}
                        </span>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-left min-w-[240px]">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                        <Icon name="fa7-solid:building" class="w-3 h-3 text-emerald-500 opacity-50" />
                        <span class="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight leading-tight">{{ item.projeto }}</span>
                    </div>
                    <div class="h-1 w-8 bg-emerald-500/20 rounded-full"></div>
                </div>
            </td>
            <td class="px-6 py-4 text-right font-bold text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                {{ Number(item.valorLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="inline-flex flex-col items-end">
                    <span class="font-black text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {{ Number(item.valorRetencao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                    </span>
                    <span class="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mt-0.5">Retenção Processada</span>
                </div>
            </td>
            <td class="px-6 py-4 text-center">
                <span v-if="item.statusAprovacao === 0" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-500/10 shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Reprovado
                </span>
                <span v-else-if="item.statusAprovacao === 1" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aprovado
                </span>
                <span v-else class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-500/10 shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pendente
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button @click="abrirModalDetalhes(item.codigo)" class="group w-11 h-11 flex items-center justify-center bg-gray-50 hover:bg-emerald-500 dark:bg-gray-800/50 dark:hover:bg-emerald-500 text-gray-400 hover:text-white rounded-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20" title="Ver Verbas Detalhadas">
                    <Icon name="fa7-solid:magnifying-glass-chart" class="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </td>
        </template>


        <template #cards="{ item }">
            <AppCardListagem 
            :titulo="item.funcionario" 
            :subtituloNome="item.projeto" 
            :subtituloValor="Number(item.valorRetencao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })"
            :ativo="true"
            :detalhes="[
                { icone: 'fa7-solid:address-card', texto: `CPF: ${item.cpf}` },
                { icone: 'fa7-solid:id-badge', texto: `Matricula: ${item.matricula}` }
            ]" 
            @ver-detalhes="abrirModalDetalhes(item.codigo)" 
            @clique-titulo="abrirModalDetalhes(item.codigo)" 
            >
                <template #badge>
                    <div v-if="filtro.status === '2'" class="absolute top-4 right-4 z-20">
                        <input type="checkbox" v-model="item.selecionado" class="w-6 h-6 rounded-xl border-emerald-200 dark:border-emerald-900/50 text-emerald-600 focus:ring-emerald-500 cursor-pointer shadow-md bg-white dark:bg-gray-800" />
                    </div>
                    <div v-else class="absolute top-4 right-4 bg-white/80 dark:bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 shadow-sm">
                        <span class="text-[9px] font-black uppercase tracking-tighter" :class="item.statusAprovacao === 1 ? 'text-emerald-500' : 'text-rose-500'">
                           {{ item.statusAprovacao === 1 ? 'Aprovado' : 'Reprovado' }}
                        </span>
                    </div>
                </template>
            </AppCardListagem>
        </template>
        </AppContainerListagem>
    </div>

    <!-- Modal Detalhes Verba -->
    <AppModal :isOpen="modalDetalhesAberto" title="Detalhamento Técnico das Verbas" icon="fa7-solid:file-invoice-dollar" tamanho="5xl" @close="modalDetalhesAberto = false" rodapeEntre>
        <div class="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-3xl group shadow-inner bg-white dark:bg-gray-900/20">
            <div class="overflow-x-auto custom-scrollbar">
                <table class="w-full text-center border-collapse whitespace-nowrap">
                    <thead class="bg-gray-50/50 dark:bg-gray-950/20">
                        <tr class="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                            <th class="p-5 text-left bg-white dark:bg-gray-900 sticky left-0 z-10 w-48 shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)]">Verba Descritiva</th>
                            <th class="p-5">Valor Original</th>
                            <th class="p-5 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">Décimo</th>
                            <th class="p-5 bg-emerald-500/5 text-emerald-400 opacity-50">%</th>
                            <th class="p-5 bg-blue-500/5 text-blue-700 dark:text-blue-400">Férias</th>
                            <th class="p-5 bg-blue-500/5 text-blue-400 opacity-50">%</th>
                            <th class="p-5 bg-amber-500/5 text-amber-700 dark:text-amber-400">FGTS/Multa</th>
                            <th class="p-5 bg-amber-500/5 text-amber-400 opacity-50">%</th>
                            <th class="p-5 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400">Submódulo</th>
                            <th class="p-5 bg-indigo-500/5 text-indigo-400 opacity-50">%</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 dark:divide-gray-800/50">
                        <tr v-for="det in detalhesVerba" :key="det.codigo" class="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 text-xs text-gray-600 dark:text-gray-400 transition-colors group/row">
                            <td class="p-5 text-left font-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 sticky left-0 z-10 shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)] border-r border-gray-50 dark:border-gray-800">
                                {{ det.verbaDescricao }}
                            </td>
                            <td class="p-5 font-black text-gray-800 dark:text-gray-300">
                                {{ Number(det.valorVerba).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                            </td>
                            <td class="p-5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/[0.02] dark:bg-emerald-500/[0.03]">
                                {{ Number(det.valorDecimoTerceiro).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                            </td>
                            <td class="p-5 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.03]">
                                {{ det.percentualDecimoTerceiro }}%
                            </td>
                            <td class="p-5 text-blue-600 dark:text-blue-400 font-bold bg-blue-500/[0.02] dark:bg-blue-500/[0.03]">
                                {{ Number(det.valorFerias).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                            </td>
                            <td class="p-5 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-blue-500/[0.02] dark:bg-blue-500/[0.03]">
                                {{ det.percentualFerias }}%
                            </td>
                            <td class="p-5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/[0.02] dark:bg-amber-500/[0.03]">
                                {{ Number(det.valorMultaFgts).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                            </td>
                            <td class="p-5 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-amber-500/[0.02] dark:bg-amber-500/[0.03]">
                                {{ det.percentualMultaFgts }}%
                            </td>
                            <td class="p-5 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/[0.02] dark:bg-indigo-500/[0.03]">
                                {{ Number(det.valorSubmodulo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                            </td>
                            <td class="p-5 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.03]">
                                {{ det.percentualSubmodulo }}%
                            </td>
                        </tr>
                        <tr v-if="detalhesVerba.length === 0">
                            <td colspan="10" class="p-20 text-center text-gray-300 dark:text-gray-600 italic font-medium backdrop-blur-sm bg-gray-50/10">
                                <Icon name="fa7-solid:box-open" class="w-12 h-12 block mx-auto mb-4 opacity-30" />
                                Nenhum detalhamento processado para este registro.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <template #footer>
            <AppBotao variacao="padrao" @click="modalDetalhesAberto = false" class="px-10 h-11 border-dashed uppercase tracking-wider text-[10px] font-black">Fechar Painel</AppBotao>
            <div class="hidden lg:flex items-center gap-3">
                <Icon name="fa7-solid:circle-info" class="w-5 h-5 text-emerald-500" />
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.1em]">Cálculos realizados com base nas diretrizes vigentes do projeto.</p>
            </div>
        </template>
    </AppModal>

    <!-- Modal de Sucesso Customizado (Padrão Premium) -->
    <AppModal :isOpen="modalSucessoAberto" tamanho="sm" @close="modalSucessoAberto = false" semCabecalho>
      <div class="flex flex-col items-center py-10 px-8 text-center animate-modal-in">
        <div class="relative mb-8 scale-150">
            <div class="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-110"></div>
            <div class="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 border-2 border-white/20">
                <Icon name="fa7-solid:check" class="w-8 h-8 text-white drop-shadow-md animate-success-pop" />
            </div>
        </div>
        
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Lote Processado!
        </h4>
        
        <p class="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-[260px] opacity-80 uppercase tracking-wide">
          Os contracheques selecionados foram atualizados com sucesso no banco de dados.
        </p>

        <AppBotao variacao="primario" @click="modalSucessoAberto = false" class="w-full mt-10 h-14 shadow-xl shadow-emerald-500/20 text-xs font-black uppercase tracking-[0.2em] rounded-2xl">
            Continuar Operação
        </AppBotao>
      </div>
    </AppModal>

    <!-- Modal de Alerta / Validação (Padrão Premium) -->
    <AppModal :isOpen="modalAlertaAberto" tamanho="sm" @close="modalAlertaAberto = false" semCabecalho>
      <div class="flex flex-col items-center py-10 px-8 text-center">
        <div class="relative mb-8">
            <div class="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
            <div class="relative w-16 h-16 bg-white dark:bg-gray-800 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/10 overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/5 to-transparent"></div>
                <Icon name="fa7-solid:triangle-exclamation" class="w-8 h-8 text-amber-500" />
            </div>
        </div>
        
        <h4 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
            {{ modalAlertaTitulo }}
        </h4>
        
        <div class="w-10 h-1 bg-amber-500/20 mb-4 rounded-full mx-auto"></div>

        <p class="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-[280px]">
          {{ modalAlertaMensagem }}
        </p>

        <AppBotao variacao="primario" @click="modalAlertaAberto = false" class="w-full mt-10 h-13 shadow-xl active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
            Entendi
        </AppBotao>
      </div>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, labelsColunas,
  buscarProcessamentos, projetos, funcionarios, detalhesVerba, modalDetalhesAberto, abrirModalDetalhes,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, modalSucessoAberto,
  processarContracheque, marcarDesmarcarTodos,
  nomeFuncionarioSearch, sugestoesFuncionarios, buscandoFuncionarios, mostrarMenuFuncionarios,
  buscarFuncionarios, selecionarFuncionario,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useContrachequeProcessamento()
</script>