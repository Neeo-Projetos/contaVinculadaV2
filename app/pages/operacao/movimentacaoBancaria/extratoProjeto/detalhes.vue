<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    
    <AppBarraNavegacao 
      icone="fa7-solid:chart-pie" 
      :links="linksBreadcrumbs"
      :paginaAtual="projeto.apelido || 'Carregando Extrato...'"
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregando || carregandoProjeto" mensagem="Processando movimentações do projeto..." />

      <div v-if="!carregandoProjeto" class="space-y-8 relative z-0">
        
        <!-- Cabeçalho de Identificação do Projeto -->
        <AppFormularioSecao icone="fa7-solid:briefcase">
          Identificação do Projeto
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6">
          <div class="md:col-span-6">
            <AppInputTexto v-model="projeto.descricao" label="Descrição do Projeto" icone="fa7-solid:file-signature" somenteLeitura />
          </div>
          <div class="md:col-span-2">
            <AppInputTexto v-model="projeto.apelido" label="Apelido" icone="fa7-solid:tag" somenteLeitura />
          </div>
          <div class="md:col-span-4">
            <AppInputTexto v-model="projeto.nomeBanco" label="Conta Vinculada" icone="fa7-solid:building-columns" somenteLeitura />
          </div>
          
          <div class="md:col-span-8 flex items-center">
            <div class="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-500/10 w-full flex items-center gap-4">
               <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Icon name="fa7-solid:circle-info" class="w-5 h-5" />
               </div>
               <p class="text-xs text-blue-600 dark:text-blue-400 font-bold leading-relaxed">
                  Esta visão consolidada apresenta todos os lançamentos bancários vinculados ao projeto, incluindo rendimentos, tarifas e alocações de colaboradores.
               </p>
            </div>
          </div>

          <div class="md:col-span-4">
             <div class="flex flex-col gap-1.5">
                <label class="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Saldo Consolidado</label>
                <div class="h-[54px] px-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 flex items-center justify-between group transition-all shadow-sm">
                   <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                         <Icon name="fa7-solid:sack-dollar" class="w-4 h-4 text-emerald-500" />
                      </div>
                      <span class="text-xs font-black text-gray-400 uppercase tracking-tighter">Disponível</span>
                   </div>
                   <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {{ formatarMoeda(projeto.saldo) }}</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Área de Filtros Dinâmicos -->
        <div class="p-6 bg-gray-50/40 dark:bg-black/10 rounded-3xl border border-gray-100 dark:border-white/5 space-y-6 shadow-sm">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <span class="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Filtrar por:</span>
              <div class="flex gap-1.5 p-1.5 bg-white dark:bg-black/20 rounded-2xl border border-gray-200/50 dark:border-white/5 inline-flex shadow-sm">
                <button v-for="t in tiposFiltro" :key="t.v"
                  @click="mudarTipo(t.v)"
                  :class="filtro.tipo === t.v ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'"
                  class="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">
                  {{ t.l }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-3">
               <AppBotao variacao="primario" icone="fa7-solid:file-excel" :carregando="gerandoExcel" @click="exportarExcel" class="shadow-lg shadow-emerald-500/20 px-8">
                  Exportar Relatório
               </AppBotao>
               <AppBotao variacao="padrao" icone="fa7-solid:rotate-right" @click="buscarDetalhes" class="h-10 w-10 !p-0 flex items-center justify-center outline-none rounded-xl" title="Atualizar dados" />
            </div>
          </div>

          <AppFormularioSecao icone="fa7-solid:sliders" class="!mt-2">
            Parâmetros de Busca
          </AppFormularioSecao>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <AppSelect v-model="filtro.periodoAtalho" label="Atalho Temporal" :opcoes="[
              { codigo: '', descricao: 'Personalizado' },
              { codigo: '7', descricao: 'Últimos 7 dias' },
              { codigo: '15', descricao: '2 Semanas' },
              { codigo: '30', descricao: 'Último Mês' },
              { codigo: '90', descricao: 'Trimestre' }
            ]" @change="aplicarAtalhoPeriodo" />
            
            <AppInputTexto v-model="filtro.dataInicial" label="Data Início" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-day" />
            <AppInputTexto v-model="filtro.dataFinal" label="Data Fim" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-check" />
            
            <AppSelect v-model="filtro.lancamento" label="Categoria" :opcoes="[
                { codigo: '', descricao: 'Todos' },
                { codigo: '1', descricao: 'Contracheque' },
                { codigo: '2', descricao: 'Manual' },
                { codigo: '3', descricao: 'Reembolso' },
                { codigo: '8', descricao: 'Submódulo' }
              ]" @change="buscarDetalhes" />
              
            <AppSelect v-model="filtro.ordenar" label="Ordenação" :opcoes="[{ codigo: '1', descricao: 'Mais Recente' }, { codigo: '0', descricao: 'Antigos' }]" @change="buscarDetalhes" />
          </div>
        </div>

        <!-- Tabela de Movimentações -->
        <div class="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
          <div class="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50 dark:bg-black/20 sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-white/5">
                <tr>
                  <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Origem / Funcionário</th>
                  <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tipo / Descrição</th>
                  <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Data</th>
                  <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Valor</th>
                  <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Saldo Acum.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-white/5">
                <tr v-if="detalhes.length === 0 && !carregando">
                  <td colspan="5" class="px-8 py-20 text-center">
                    <div class="flex flex-col items-center gap-4 opacity-30">
                      <Icon name="fa7-solid:box-open" class="w-16 h-16" />
                      <p class="text-xs font-black uppercase tracking-widest">Nenhuma movimentação encontrada</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="(item, idx) in detalhes" :key="idx" class="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td class="px-8 py-5">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight group-hover:text-emerald-600 transition-colors uppercase">
                         {{ item.nomeFuncionario || 'AUTOMÁTICO / SISTEMA' }}
                      </span>
                      <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {{ item.usuarioCadastro || 'N/A' }}</span>
                    </div>
                  </td>
                  <td class="px-8 py-5">
                    <div class="flex flex-col gap-1">
                      <span class="text-[10px] font-black text-emerald-500 bg-emerald-500/10 self-start px-2 py-0.5 rounded-full uppercase tracking-tighter">{{ item.tipoLancamentoDesc }}</span>
                      <p class="text-[11px] text-gray-500 dark:text-gray-400 font-medium italic line-clamp-1 max-w-[250px]" :title="item.detalhes">
                        {{ item.detalhes || 'Sem detalhes' }}
                      </p>
                    </div>
                  </td>
                  <td class="px-8 py-5 text-center">
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                      {{ item.dataCadastroFormatada }}
                    </span>
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-xs tabular-nums" :class="item.tipoMovimentacao === 1 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'">
                      <Icon :name="item.tipoMovimentacao === 1 ? 'fa7-solid:chevron-up' : 'fa7-solid:chevron-down'" class="w-2 h-2" />
                      R$ {{ formatarMoeda(item.valorMovimentacao) }}
                    </div>
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="inline-block px-3 py-1 rounded-lg font-black text-xs min-w-[100px] border tabular-nums" 
                         :class="item.saldoAcumulado >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-500/10 dark:bg-rose-500/10 dark:text-rose-400'">
                      R$ {{ formatarMoeda(item.saldoAcumulado) }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Rodapé de Ações (Estilo Cadastro) -->
        <AppRodapeFormulario 
          :visualizar="true"
          :ocultarEditar="true"
          @voltar="voltarParaLista"
        />

      </div>
    </AppCartaoFormulario>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useExtratoProjetoDetalhes } from '~/composables/operacao/movimentacaoBancaria/extratoProjeto/useExtratoProjetoDetalhes'

const {
  detalhes, carregando, carregandoProjeto, gerandoExcel,
  projeto, filtro, formatarMoeda, mudarTipo, aplicarAtalhoPeriodo,
  carregarDadosProjeto, buscarDetalhes, exportarExcel, voltarParaLista
} = useExtratoProjetoDetalhes()

const linksBreadcrumbs = [
  { label: 'Início', to: '/' }, 
  { label: 'Operação', to: '#' }, 
  { label: 'Extrato Projeto', to: '/operacao/movimentacaoBancaria/extratoProjeto' }
]

const tiposFiltro = [
  { v: 0, l: 'Consolidado' },
  { v: 1, l: 'Créditos' },
  { v: 2, l: 'Débitos' }
]

onMounted(async () => {
  await carregarDadosProjeto()
  await buscarDetalhes()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.4);
}
</style>
