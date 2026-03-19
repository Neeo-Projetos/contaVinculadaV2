<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Histórico de" 
      tituloGrosso="Contracheques"
      descricao="Consulta detalhada de todos os contracheques aprovados e processados" 
      icone="fa7-solid:info-circle" 
    />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
          <div class="md:col-span-2">
            <AppInputTexto v-model="filtro.mesAno" label="Mês/Ano" placeholder="MM/AAAA" v-maska="'##/####'" icone="fa7-solid:calendar-check" />
          </div>
          <div class="md:col-span-3">
            <AppSelect 
                v-model="filtro.projeto" 
                label="Projeto" 
                placeholder="Todos os projetos" 
                :opcoes="projetos" 
                itemValue="codigo" 
                itemLabel="apelido"
                icone="fa7-solid:building-user"
            />
          </div>
          <div class="md:col-span-4">
            <AppSelect 
                v-model="filtro.funcionarioId" 
                label="Funcionário" 
                placeholder="Todos os funcionários" 
                :opcoes="funcionarios" 
                itemValue="codigo" 
                itemLabel="nomeCompleto"
                icone="fa7-solid:user-tie"
            />
          </div>
          <div class="md:col-span-3">
            <AppSelect 
                v-model="filtro.status" 
                label="Situação Final" 
                placeholder="Todas..." 
                :opcoes="[{codigo: '1', descricao: 'Aprovados'}, {codigo: '0', descricao: 'Reprovados'}]" 
                itemValue="codigo" 
                itemLabel="descricao"
                icone="fa7-solid:shield-check"
            />
          </div>
        </div>
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:gears" @click="navigateTo('/operacao/contracheque/processamento')">
            Processamento
        </AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:file-arrow-up" @click="navigateTo('/operacao/contracheque/importacao')">
            Importação
        </AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarRegistros">
          Consultar
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
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Funcionário</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Projeto</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Retenção</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ação</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4">
            <div class="flex flex-col min-w-[200px]">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ item.funcionario }}</span>
                <span class="text-[10px] text-gray-500 font-bold tracking-widest">{{ item.cpf }}</span>
            </div>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">{{ item.projeto }}</span>
        </td>
        <td class="px-6 py-4 text-center">
            <span v-if="item.statusAprovacao === 0" class="px-2 py-1 rounded text-[10px] font-black uppercase bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-500/20">Reprovado</span>
            <span v-else-if="item.statusAprovacao === 1" class="px-2 py-1 rounded text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Aprovado</span>
        </td>
        <td class="px-6 py-4 text-center">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.dataRetencao }}</span>
        </td>
        <td class="px-6 py-4 text-right">
            <button @click="abrirModalDetalhes(item.codigo)" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ver Verbas">
                <Icon name="fa7-solid:sack-dollar" class="w-5 h-5" />
            </button>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.funcionario" 
          :subtituloNome="item.projeto" 
          :subtituloValor="item.dataRetencao"
          :ativo="true"
          :detalhes="[
            { icone: 'fa7-solid:address-card', texto: `CPF: ${item.cpf}` },
            { icone: 'fa7-solid:check-double', texto: item.statusAprovacao === 1 ? 'Aprovado' : 'Reprovado' }
          ]" 
          @ver-detalhes="abrirModalDetalhes(item.codigo)" 
          @clique-titulo="abrirModalDetalhes(item.codigo)" 
        />
      </template>
    </AppContainerListagem>

    <!-- Modal Detalhes Verba -->
    <AppModal :isOpen="modalDetalhesAberto" title="Detalhamento por Verba" icon="fa7-solid:magnifying-glass-dollar" tamanho="5xl" @close="modalDetalhesAberto = false" rodapeEntre>
        <div class="overflow-x-auto p-2 lg:p-4">
            <table class="w-full text-center border-collapse whitespace-nowrap rounded-2xl overflow-hidden">
                <thead class="bg-gray-50 dark:bg-gray-900/50">
                    <tr class="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                        <th class="p-4 text-left">Verba</th>
                        <th class="p-4">Vlr Verba</th>
                        <th class="p-4 bg-emerald-50/20 dark:bg-emerald-500/5">Vlr Décimo</th>
                        <th class="p-4 bg-emerald-50/20 dark:bg-emerald-500/5">%</th>
                        <th class="p-4 bg-blue-50/20 dark:bg-blue-500/5">Vlr Férias</th>
                        <th class="p-4 bg-blue-50/20 dark:bg-blue-500/5">%</th>
                        <th class="p-4 bg-amber-50/20 dark:bg-amber-500/5">Vlr Multa</th>
                        <th class="p-4 bg-amber-50/20 dark:bg-amber-500/5">%</th>
                        <th class="p-4 bg-indigo-50/20 dark:bg-indigo-500/5">Submódulo</th>
                        <th class="p-4 bg-indigo-50/20 dark:bg-indigo-500/5">%</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr v-for="det in detalhesVerba" :key="det.codigo" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 text-xs text-gray-600 dark:text-gray-300 transition-colors">
                        <td class="p-4 text-left font-bold text-gray-900 dark:text-white">{{ det.verbaDescricao }}</td>
                        <td class="p-4 font-black text-gray-700 dark:text-gray-200">
                             {{ Number(det.valorVerba).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/10 dark:bg-emerald-500/5">
                            {{ Number(det.valorDecimoTerceiro).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-[10px] font-bold text-gray-400 bg-emerald-50/10 dark:bg-emerald-500/5">
                            {{ det.percentualDecimoTerceiro }}%
                        </td>
                        <td class="p-4 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/10 dark:bg-blue-500/5">
                            {{ Number(det.valorFerias).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-[10px] font-bold text-gray-400 bg-blue-50/10 dark:bg-blue-500/5">
                            {{ det.percentualFerias }}%
                        </td>
                        <td class="p-4 text-amber-600 dark:text-amber-400 font-bold bg-amber-50/10 dark:bg-amber-500/5">
                            {{ Number(det.valorMultaFgts).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-[10px] font-bold text-gray-400 bg-amber-50/10 dark:bg-amber-500/5">
                            {{ det.percentualMultaFgts }}%
                        </td>
                        <td class="p-4 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/10 dark:bg-indigo-500/5">
                            {{ Number(det.valorSubmodulo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-[10px] font-bold text-gray-400 bg-indigo-50/10 dark:bg-indigo-500/5">
                            {{ det.percentualSubmodulo }}%
                        </td>
                    </tr>
                    <tr v-if="detalhesVerba.length === 0">
                        <td colspan="10" class="p-12 text-center text-gray-400 italic">Nenhum detalhe de verba encontrado.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <template #footer>
            <AppBotao variacao="padrao" @click="modalDetalhesAberto = false" class="px-8">Fechar</AppBotao>
        </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscarRegistros, projetos, funcionarios, detalhesVerba, modalDetalhesAberto, abrirModalDetalhes,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useContrachequeDetalhes()
</script>