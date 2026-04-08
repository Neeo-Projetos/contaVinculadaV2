<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    
    <AppBarraNavegacao 
      icone="fa7-solid:user-clock" 
      :links="linksBreadcrumbs"
      :paginaAtual="funcionario.nomeCompleto || 'Carregando Extrato...'"
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregando || carregandoFuncionario" mensagem="Processando movimentações..." />

      <div v-if="!carregandoFuncionario" class="space-y-8 relative z-0">
        
        <!-- Cabeçalho de Identificação (Estilo Cadastro) -->
        <AppFormularioSecao icone="fa7-solid:id-card-clip">
          Identificação do Colaborador
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6">
          <div class="md:col-span-6">
            <AppInputTexto v-model="funcionario.nomeCompleto" label="Nome Completo" icone="fa7-solid:user" somenteLeitura />
          </div>
          <div class="md:col-span-3">
            <AppInputTexto v-model="funcionario.cpf" label="CPF" icone="fa7-solid:address-card" somenteLeitura />
          </div>
          <div class="md:col-span-3">
            <AppInputTexto v-model="funcionario.matricula" label="Matrícula" icone="fa7-solid:id-badge" somenteLeitura />
          </div>
          <div class="md:col-span-8">
            <AppInputTexto v-model="funcionario.projetoNome" label="Projeto Atual / Alocação" icone="fa7-solid:briefcase" somenteLeitura />
          </div>
          <div class="md:col-span-4">
             <div class="flex flex-col gap-1.5">
                <label class="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Saldo Acumulado</label>
                <div class="h-[42px] px-4 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 flex items-center justify-between group transition-all">
                   <Icon name="fa7-solid:sack-dollar" class="w-4 h-4 text-emerald-500" />
                   <span class="text-lg font-black text-emerald-600 dark:text-emerald-400">R$ {{ formatarMoeda(funcionario.saldo) }}</span>
                </div>
             </div>
          </div>
        </div>

        <AppFormularioSecao icone="fa7-solid:filter-list">
          Filtros de Movimentação
        </AppFormularioSecao>

        <!-- Área de Filtros Dinâmicos -->
        <div class="p-6 bg-gray-50/50 dark:bg-black/10 rounded-2xl border border-gray-100 dark:border-white/5 space-y-6">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <span class="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Visualizar:</span>
              <div class="flex gap-1.5 p-1.5 bg-white dark:bg-black/20 rounded-xl border border-gray-200/50 dark:border-white/5 inline-flex shadow-sm">
                <button v-for="t in tiposFiltro" :key="t.v"
                  @click="mudarTipo(t.v)"
                  :class="filtro.tipo === t.v ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'"
                  class="px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300">
                  {{ t.l }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
               <AppBotao variacao="primario" icone="fa7-solid:file-excel" :carregando="gerandoExcel" @click="exportarExcel" class="shadow-lg shadow-emerald-500/20">
                  Exportar Excel
               </AppBotao>
               <AppBotao variacao="padrao" icone="fa7-solid:rotate-right" @click="buscarDetalhes" class="h-10 w-10 !p-0 flex items-center justify-center outline-none" title="Atualizar dados" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AppSelect v-model="filtro.periodoAtalho" label="Atalho de Período" :opcoes="[
              { codigo: '', descricao: 'Personalizado' },
              { codigo: '7', descricao: 'Últimos 7 dias' },
              { codigo: '15', descricao: 'Últimos 15 dias' },
              { codigo: '30', descricao: 'Últimos 30 dias' },
              { codigo: '90', descricao: 'Últimos 90 dias' }
            ]" @change="aplicarAtalhoPeriodo" />
            
            <AppInputTexto v-model="filtro.dataInicial" label="Data Inicial" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-day" />
            <AppInputTexto v-model="filtro.dataFinal" label="Data Final" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-check" />
            
            <AppSelect v-model="filtro.lancamento" label="Tipo de Lançamento" :opcoes="[
                { codigo: '', descricao: 'Todos' },
                { codigo: '1', descricao: 'Contracheque' },
                { codigo: '2', descricao: 'Lançamento Manual' },
                { codigo: '3', descricao: 'Reembolso' },
                { codigo: '5', descricao: 'Décimo Terceiro' },
                { codigo: '6', descricao: 'Férias' },
                { codigo: '7', descricao: 'Multa FGTS' }
              ]" @change="buscarDetalhes" />
              
            <AppSelect v-model="filtro.ordenar" label="Ordenação" :opcoes="[{ codigo: '1', descricao: 'Mais recente' }, { codigo: '0', descricao: 'Mais antigo' }]" @change="buscarDetalhes" />
          </div>
        </div>

        <!-- Tabela de Movimentações -->
        <div class="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50/90 dark:bg-[#1e2029]/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
                <tr>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Usuário Responsável</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Descrição do Lançamento</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-center">Data / Hora</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right">Valor Movimentado</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right">Saldo na Data</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-white/5">
                
                <tr v-if="detalhes.length === 0 && !carregando" class="animate-fade-in">
                  <td colspan="5" class="py-24 text-center">
                     <div class="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-full flex items-center justify-center mb-5 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-white/5 shadow-inner mx-auto">
                        <Icon name="fa7-solid:ghost" class="w-10 h-10" />
                     </div>
                     <p class="text-sm text-gray-500 dark:text-gray-400 font-bold">Nenhuma movimentação encontrada.</p>
                     <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Ajuste os filtros ou o período de busca.</p>
                  </td>
                </tr>

                <tr v-for="(item, idx) in detalhes" :key="idx" class="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-black/20 border border-gray-200/50 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                         <Icon name="fa7-solid:user-shield" class="w-3.5 h-3.5" />
                      </div>
                      <span class="text-xs font-bold text-gray-600 dark:text-gray-300">{{ item.usuarioCadastro || 'Sistema' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                     <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-semibold" :title="item.detalhes || item.tipoLancamentoDesc">
                       {{ item.detalhes || item.tipoLancamentoDesc }}
                     </p>
                     <span v-if="item.tipoLancamentoDesc" class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{{ item.tipoLancamentoDesc }}</span>
                  </td>
                  <td class="px-6 py-5 text-center">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200/50 dark:border-white/5">
                      <Icon name="fa7-regular:calendar" class="w-3 h-3 text-emerald-500" />
                      <span class="text-[11px] font-black text-gray-500 dark:text-gray-400 tabular-nums">{{ item.dataCadastroFormatada }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-right">
                    <div class="flex flex-col items-end">
                      <span class="text-sm font-black tabular-nums" :class="item.tipoMovimentacao === 1 ? 'text-emerald-500' : 'text-rose-500'">
                        {{ item.tipoMovimentacao === 1 ? '+' : '-' }} R$ {{ formatarMoeda(item.valorMovimentacao) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-right">
                     <div class="inline-block px-3 py-1 rounded-lg font-black text-xs min-w-[100px] border" 
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
          @voltar="voltarParaLista"
        />

      </div>
    </AppCartaoFormulario>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useExtratoFuncionarioDetalhes } from '~/composables/operacao/movimentacaoBancaria/extratoFuncionario/useExtratoFuncionarioDetalhes'

const {
  detalhes, carregando, carregandoFuncionario, gerandoExcel,
  funcionario, filtro, formatarMoeda, mudarTipo, aplicarAtalhoPeriodo,
  carregarDadosFuncionario, buscarDetalhes, exportarExcel, voltarParaLista
} = useExtratoFuncionarioDetalhes()

const linksBreadcrumbs = [
  { label: 'Início', to: '/' }, 
  { label: 'Operação', to: '#' }, 
  { label: 'Extrato Funcionário', to: '/operacao/movimentacaoBancaria/extratoFuncionario' }
]

const tiposFiltro = [
  { v: 0, l: 'Todas' },
  { v: 1, l: 'Entradas' },
  { v: 2, l: 'Saídas' }
]

onMounted(async () => {
  await carregarDadosFuncionario()
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
