<template>
    <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

        <AppFiltro v-model="filtro" v-model:viewMode="visaoAtual" :campos="camposFiltro" titulo="Processamento"
            descricao="Analise e aprove as retenções processadas via importação" icone-titulo="fa7-solid:gears"
            :breadcrumbs="[{ label: 'Início', to: '/' }, { label: 'Operação' }, { label: 'Contracheques' }, { label: 'Processamento' }]"
            :pending="carregando" :erros="erros" @buscar="buscarProcessamentos" @openAdvancedFilter="modalFiltroAvancadoAberto = true">
            <template #acoes>
                <AppBotao variacao="padrao" icone="fa7-solid:file-excel" @click="gerarExcel">Relatório</AppBotao>
                <AppBotao variacao="padrao" icone="fa7-solid:desktop"
                    @click="abrirModalExibicao">Controle de Exibição</AppBotao>
            </template>

            <div class="relative min-h-[400px]">
                <AppSobreposicaoCarregamento :carregando="carregando" mensagem="Buscando registros..." />

                <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
                    v-model:filtroGlobal="filtroGlobal"
                    :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
                    :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
                    :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
                    @mudarItensPorPagina="mudarItensPorPagina"
                    :view="false" :edit="false">
                    <template #cabecalho-tabela>
                        <th v-if="filtro.status === '2'" scope="col" class="px-6 py-4 text-center w-20">
                            <button @click="marcarDesmarcarTodos"
                                class="w-8 h-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-md transition-all flex items-center justify-center mx-auto"
                                title="Selecionar Todos">
                                <Icon name="fa7-solid:check-double" class="w-4 h-4" />
                            </button>
                        </th>
                        <th scope="col"
                            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
                            Funcionário
                        </th>
                        <th v-if="colunas.projeto" scope="col"
                            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
                            {{ labels.projeto }}
                        </th>
                        <th v-if="colunas.valorLiquido" scope="col"
                            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                            {{ labels.valorLiquido }}
                        </th>
                        <th v-if="colunas.valorRetencao" scope="col"
                            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                            {{ labels.valorRetencao }}
                        </th>
                        <th v-if="colunas.status" scope="col"
                            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                            {{ labels.status }}
                        </th>
                        <th scope="col"
                            class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-32">
                            Ações
                        </th>
                    </template>

                    <template #linhas-tabela="{ item }">
                        <td v-if="filtro.status === '2'" class="px-6 py-4 text-center">
                            <input type="checkbox" v-model="item.selecionado"
                                class="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500/50 cursor-pointer transition-all bg-white dark:bg-gray-800" />
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs shrink-0">
                                    {{ item.funcionario.substring(0, 2).toUpperCase() }}
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{
                                        item.funcionario }}</span>
                                    <div
                                        class="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter">
                                        <Icon name="fa7-solid:address-card" class="w-3 h-3 opacity-70" /> {{ item.cpf }}
                                        <span class="opacity-30">|</span>
                                        <Icon name="fa7-solid:fingerprint" class="w-3 h-3 opacity-70" /> {{ item.matricula
                                        }}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td v-if="colunas.projeto" class="px-6 py-4">
                            <span
                                class="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2.5 py-1.5 rounded-xl border border-emerald-500/10 leading-relaxed max-w-[200px] sm:max-w-none">
                                {{ item.projeto }}
                            </span>
                        </td>
                        <td v-if="colunas.valorLiquido" class="px-6 py-4 text-right">
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                                {{ Number(item.valorLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                }}
                            </span>
                        </td>
                        <td v-if="colunas.valorRetencao" class="px-6 py-4 text-right">
                            <div class="flex flex-col items-end">
                                <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                    {{ Number(item.valorRetencao).toLocaleString('pt-BR', {
                                        style: 'currency', currency:
                                    'BRL' }) }}
                                </span>
                                <span
                                    class="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Retenção</span>
                            </div>
                        </td>
                        <td v-if="colunas.status" class="px-6 py-4 text-center">
                            <span v-if="item.statusAprovacao === 0"
                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-500/10">
                                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Reprovado
                            </span>
                            <span v-else-if="item.statusAprovacao === 1"
                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aprovado
                            </span>
                            <span v-else
                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-500/10">
                                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pendente
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <div class="flex items-center justify-center gap-2">
                                <button @click="abrirPainelAuditoria(item)" title="Conferir e Processar"
                                    class="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-all active:scale-95 shadow-sm border border-blue-200/50 dark:border-blue-700/30">
                                    <Icon name="fa7-solid:magnifying-glass-chart" class="w-4 h-4" />
                                </button>
                                <template v-if="item.statusAprovacao === 2">
                                    <button @click="processarIndividual(item, 1)" title="Aprovar Rápido"
                                        class="w-10 h-10 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 rounded-xl transition-all active:scale-95 shadow-sm border border-emerald-200/50 dark:border-emerald-700/30">
                                        <Icon name="fa7-solid:check" class="w-4 h-4" />
                                    </button>
                                    <button @click="processarIndividual(item, 0)" title="Reprovar Rápido"
                                        class="w-10 h-10 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 rounded-xl transition-all active:scale-95 shadow-sm border border-rose-200/50 dark:border-rose-700/30">
                                        <Icon name="fa7-solid:xmark" class="w-4 h-4" />
                                    </button>
                                </template>
                            </div>
                        </td>
                    </template>


                    <template #cards="{ item }">
                        <AppCardListagem :titulo="item.funcionario" :subtituloNome="labels.projeto"
                            :subtituloValor="item.projeto"
                            :ativo="true" :mostrarStatus="colunas.status" 
                            :detalhes="obterDetalhesCard(item)" 
                            @ver-detalhes="abrirPainelAuditoria(item)" 
                            @clique-titulo="abrirPainelAuditoria(item)">
                            <template #badge>
                                <div v-if="filtro.status === '2'" class="absolute top-4 right-4 z-20">
                                    <input type="checkbox" v-model="item.selecionado"
                                        class="w-6 h-6 rounded-xl border-emerald-200 dark:border-emerald-900/50 text-emerald-600 focus:ring-emerald-500 cursor-pointer shadow-md bg-white dark:bg-gray-800" />
                                </div>
                                <div v-else
                                    class="absolute top-4 right-4 bg-white/80 dark:bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 shadow-sm">
                                    <span class="text-[9px] font-black uppercase tracking-tighter"
                                        :class="item.statusAprovacao === 1 ? 'text-emerald-500' : 'text-rose-500'">
                                        {{ item.statusAprovacao === 1 ? 'Aprovado' : 'Reprovado' }}
                                    </span>
                                </div>
                            </template>
                        </AppCardListagem>
                    </template>
                </AppContainerListagem>
            </div>
        </AppFiltro>

        <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
            @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">
            <AppSelect v-model="filtro.projeto" label="Unidade / Projeto" placeholder="Todos os projetos"
                :opcoes="projetos" itemValue="codigo" itemLabel="nomeExibicao" icone="fa7-solid:building-user" />
            <AppSelect v-model="filtro.status" label="Status da Remessa"
                :opcoes="[{ codigo: '2', descricao: 'Pendentes de Aprovação' }, { codigo: '1', descricao: 'Lotes Aprovados' }, { codigo: '0', descricao: 'Lotes Reprovados' }]"
                itemValue="codigo" itemLabel="descricao" icone="fa7-solid:shield-clock" />
        </AppModalFiltroAvancado>

        <!-- Modal Detalhes Verba -->
        <AppModal :isOpen="modalDetalhesAberto" title="Detalhamento Técnico das Verbas"
            icon="fa7-solid:file-invoice-dollar" tamanho="5xl" @close="modalDetalhesAberto = false" rodapeEntre>
            <div
                class="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-3xl group shadow-inner bg-white dark:bg-gray-900/20">
                <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-center border-collapse whitespace-nowrap">
                        <thead class="bg-gray-50/50 dark:bg-gray-950/20">
                            <tr
                                class="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                <th
                                    class="p-5 text-left bg-white dark:bg-gray-900 sticky left-0 z-10 w-48 shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                    Verba Descritiva</th>
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
                            <tr v-for="det in detalhesVerba" :key="det.codigo"
                                class="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 text-xs text-gray-600 dark:text-gray-400 transition-colors group/row">
                                <td
                                    class="p-5 text-left font-black text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 sticky left-0 z-10 shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)] border-r border-gray-50 dark:border-gray-800">
                                    {{ det.verbaDescricao }}
                                </td>
                                <td class="p-5 font-black text-gray-800 dark:text-gray-300">
                                    {{ Number(det.valorVerba).toLocaleString('pt-BR', {
                                        style: 'currency', currency:
                                    'BRL' }) }}
                                </td>
                                <td
                                    class="p-5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/[0.02] dark:bg-emerald-500/[0.03]">
                                    {{ Number(det.valorDecimoTerceiro).toLocaleString('pt-BR', {
                                        style: 'currency',
                                    currency:
                                    'BRL' }) }}
                                </td>
                                <td
                                    class="p-5 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.03]">
                                    {{ det.percentualDecimoTerceiro }}%
                                </td>
                                <td
                                    class="p-5 text-blue-600 dark:text-blue-400 font-bold bg-blue-500/[0.02] dark:bg-blue-500/[0.03]">
                                    {{ Number(det.valorFerias).toLocaleString('pt-BR', {
                                        style: 'currency', currency:
                                    'BRL' })
                                    }}
                                </td>
                                <td
                                    class="p-5 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-blue-500/[0.02] dark:bg-blue-500/[0.03]">
                                    {{ det.percentualFerias }}%
                                </td>
                                <td
                                    class="p-5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/[0.02] dark:bg-amber-500/[0.03]">
                                    {{ Number(det.valorMultaFgts).toLocaleString('pt-BR', {
                                        style: 'currency', currency:
                                    'BRL'
                                    }) }}
                                </td>
                                <td
                                    class="p-5 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-amber-500/[0.02] dark:bg-amber-500/[0.03]">
                                    {{ det.percentualMultaFgts }}%
                                </td>
                                <td
                                    class="p-5 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/[0.02] dark:bg-indigo-500/[0.03]">
                                    {{ Number(det.valorSubmodulo).toLocaleString('pt-BR', {
                                        style: 'currency', currency:
                                    'BRL'
                                    }) }}
                                </td>
                                <td
                                    class="p-5 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.03]">
                                    {{ det.percentualSubmodulo }}%
                                </td>
                            </tr>
                            <tr v-if="detalhesVerba.length === 0">
                                <td colspan="10"
                                    class="p-20 text-center text-gray-300 dark:text-gray-600 italic font-medium backdrop-blur-sm bg-gray-50/10">
                                    <Icon name="fa7-solid:box-open" class="w-12 h-12 block mx-auto mb-4 opacity-30" />
                                    Nenhum detalhamento processado para este registro.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <template #footer>
                <div class="flex items-center justify-between w-full">
                    <AppBotao variacao="padrao" @click="modalDetalhesAberto = false"
                        class="px-10 h-11 border-dashed uppercase tracking-wider text-[10px] font-black">Fechar Painel
                    </AppBotao>
                    <div class="hidden lg:flex items-center gap-3">
                        <Icon name="fa7-solid:circle-info" class="w-5 h-5 text-emerald-500" />
                        <p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.1em]">Cálculos realizados com
                            base nas diretrizes vigentes do projeto.</p>
                    </div>
                </div>
            </template>
        </AppModal>

        <!-- Modal de Sucesso Customizado (Padrão Premium) -->
        <AppModal :isOpen="modalSucessoAberto" tamanho="sm" @close="modalSucessoAberto = false" semCabecalho>
            <div class="flex flex-col items-center py-10 px-8 text-center animate-modal-in">
                <div class="relative mb-8 scale-150">
                    <div class="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-110"></div>
                    <div
                        class="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 border-2 border-white/20">
                        <Icon name="fa7-solid:check" class="w-8 h-8 text-white drop-shadow-md animate-success-pop" />
                    </div>
                </div>

                <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                    Lote Processado!
                </h4>

                <p
                    class="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-[260px] opacity-80 uppercase tracking-wide">
                    Os contracheques selecionados foram atualizados com sucesso no banco de dados.
                </p>

                <AppBotao variacao="primario" @click="modalSucessoAberto = false"
                    class="w-full mt-10 h-14 shadow-xl shadow-emerald-500/20 text-xs font-black uppercase tracking-[0.2em] rounded-2xl">
                    Continuar Operação
                </AppBotao>
            </div>
        </AppModal>

        <!-- Modal de Alerta / Validação (Padrão Premium) -->
        <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels"
            @aplicar="aplicarExibicao" @close="modalExibicaoAberto = false" />

        <AppPainelLateral 
            :aberto="painelAberto" 
            :titulo="itemSelecionado?.funcionario || 'Conferência'"
            subtitulo="Auditoria Detalhada de Verbas"
            @close="fecharPainelAuditoria"
        >
            <div v-if="itemSelecionado" class="space-y-8">
                <!-- Resumo Rápido -->
                <div class="grid grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-800/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                    <div class="flex flex-col gap-1">
                        <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Matrícula</span>
                        <span class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ itemSelecionado?.matricula }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">CPF</span>
                        <span class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ itemSelecionado?.cpf }}</span>
                    </div>
                    <div class="col-span-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex flex-col gap-1">
                        <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Projeto / Unidade</span>
                        <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ itemSelecionado?.projeto }}</span>
                    </div>
                </div>

                <!-- Verbas -->
                <div class="space-y-4">
                    <AppFormularioSecao icone="fa7-solid:list-check">Detalhamento das Verbas</AppFormularioSecao>
                    <div class="overflow-x-auto custom-scrollbar -mx-2">
                        <AppDetalhamentoVerbas :itens="detalhesVerba" />
                    </div>
                </div>

                <!-- Provisões -->
                <div class="space-y-4">
                    <AppFormularioSecao icone="fa7-solid:sack-dollar">Resumo de Provisões</AppFormularioSecao>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl flex flex-col gap-1">
                            <span class="text-[10px] font-black text-emerald-600/60 uppercase">13º Salário</span>
                            <span class="text-lg font-black text-emerald-600">{{ Number(itemSelecionado?.decimoTerceiro || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
                        </div>
                        <div class="p-4 bg-blue-500/[0.03] border border-blue-500/10 rounded-2xl flex flex-col gap-1">
                            <span class="text-[10px] font-black text-blue-600/60 uppercase">Férias</span>
                            <span class="text-lg font-black text-blue-600">{{ Number(itemSelecionado?.feriasConstitucional || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
                        </div>
                        <div class="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl flex flex-col gap-1">
                            <span class="text-[10px] font-black text-amber-600/60 uppercase">Multa FGTS</span>
                            <span class="text-lg font-black text-amber-600">{{ Number(itemSelecionado?.multaFgts || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
                        </div>
                        <div class="p-4 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-2xl flex flex-col gap-1">
                            <span class="text-[10px] font-black text-indigo-600/60 uppercase">Submódulo</span>
                            <span class="text-lg font-black text-indigo-600">{{ Number(itemSelecionado?.submodulo || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex items-center gap-4">
                    <AppBotao 
                        variacao="perigo" 
                        icone="fa7-solid:ban" 
                        @click="processarIndividual(itemSelecionado, 0)"
                        class="flex-1 !h-14 !rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black"
                    >
                        Reprovar
                    </AppBotao>
                    <AppBotao 
                        variacao="primario" 
                        icone="fa7-solid:check-double" 
                        @click="processarIndividual(itemSelecionado, 1)"
                        class="flex-2 !h-14 !rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-none uppercase tracking-[0.2em] text-[10px] font-black shadow-xl shadow-emerald-500/20"
                    >
                        Aprovar Registro
                    </AppBotao>
                </div>
            </template>
        </AppPainelLateral>

        <AppBarraAcoesContracheque 
            :exibir="totalSelecionados > 0" 
            :total="totalSelecionados"
            @aprovar="processarContracheque(1)"
            @reprovar="processarContracheque(0)"
        />

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const {
    carregando, buscaRealizada, visaoAtual, dados, filtro, erros, labelsColunas,
    buscarProcessamentos, projetos, funcionarios, modalDetalhesAberto, abrirModalDetalhes,
    modalSucessoAberto,
    processarContracheque, marcarDesmarcarTodos,
    nomeFuncionarioSearch, sugestoesFuncionarios, buscandoFuncionarios, mostrarMenuFuncionarios,
    buscarFuncionarios, selecionarFuncionario,
    modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
    registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
    mudarPagina, mudarItensPorPagina, filtroGlobal,
    colunas, colunasTemp, labels, modalExibicaoAberto, abrirModalExibicao, aplicarExibicao,
    // Novos
    painelAberto, itemSelecionado, totalSelecionados, abrirPainelAuditoria, fecharPainelAuditoria, processarIndividual, detalhesVerba
} = useContrachequeProcessamento()

const camposFiltro = computed(() => [
  { 
    key: 'mesAno', 
    label: 'Mês/Ano', 
    type: 'text' as const, 
    placeholder: 'Ex: 03/2024', 
    mask: '##/####',
    required: true,
    colSpan: 'md:col-span-3'
  },
  { 
    key: 'nomeFuncionario', 
    label: 'Colaborador', 
    type: 'text' as const, 
    placeholder: 'Digite o nome do colaborador...',
    icon: 'fa6-solid:magnifying-glass',
    colSpan: 'md:col-span-6'
  }
])

const obterDetalhesCard = (item: any) => {
    const d = [
        { icone: 'fa7-solid:address-card', texto: `CPF: ${item.cpf}` },
        { icone: 'fa7-solid:id-badge', texto: `Matricula: ${item.matricula}` }
    ]
    
    if (colunas.valorLiquido) {
        d.push({ 
            icone: 'fa7-solid:money-bill-wave', 
            texto: `Líquido: ${Number(item.valorLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` 
        })
    }
    
    if (colunas.valorRetencao) {
        d.push({ 
            icone: 'fa7-solid:hand-holding-dollar', 
            texto: `Retenção: ${Number(item.valorRetencao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` 
        })
    }
    
    return d
}

const gerarExcel = () => {
    alert('📊 Gerando relatório de processamento (Excel)...')
}

const gerarPdf = () => {
    alert('📄 Gerando espelho de processamento (PDF)...')
}
</script>