<template>
  <AppModal :isOpen="isOpen" :title="tituloDinamico" :icon="iconeDinamico" @close="fechar" tamanho="5xl">
    
    <div class="space-y-10 p-1">
      
      <!-- 💎 Dashboard de Resumo (Design Ultra-Premium com Glow) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Saldo Disponível -->
        <div class="relative group bg-emerald-500 dark:bg-emerald-600/20 p-7 rounded-[2.5rem] border border-emerald-400/30 overflow-hidden shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-95 cursor-default">
           <!-- Efeito de Brilho de Fundo -->
           <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 dark:bg-emerald-500/10 rounded-full blur-3xl transition-all group-hover:scale-150"></div>
           
           <div class="flex items-center gap-6 relative z-10">
              <div class="w-14 h-14 flex-shrink-0 rounded-2xl bg-white/20 dark:bg-emerald-500 flex items-center justify-center shadow-lg border border-white/20">
                 <Icon name="fa7-solid:sack-dollar" class="w-7 h-7 text-white" />
              </div>
              <div class="flex flex-col">
                 <span class="text-[10px] font-black uppercase tracking-[0.25em] text-white/70 dark:text-emerald-400/90 mb-1">Saldo em Conta</span>
                 <span class="text-3xl font-black text-white tracking-tighter">R$ {{ formatarMoeda(saldoFinal) }}</span>
              </div>
           </div>
        </div>

        <!-- Total Entradas -->
        <div class="group bg-white dark:bg-[#1e2029] p-7 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-blue-500/40">
           <div class="flex items-center gap-6">
              <div class="w-14 h-14 flex-shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                 <Icon name="fa7-solid:circle-arrow-up" class="w-7 h-7" />
              </div>
              <div class="flex flex-col">
                 <span class="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">Total Créditos</span>
                 <span class="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">R$ {{ formatarMoeda(totalEntradas) }}</span>
              </div>
           </div>
        </div>

        <!-- Total Saídas -->
        <div class="group bg-white dark:bg-[#1e2029] p-7 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-rose-500/40">
           <div class="flex items-center gap-6">
              <div class="w-14 h-14 flex-shrink-0 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-all">
                 <Icon name="fa7-solid:circle-arrow-down" class="w-7 h-7" />
              </div>
              <div class="flex flex-col">
                 <span class="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">Total Débitos</span>
                 <span class="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">R$ {{ formatarMoeda(totalSaidas) }}</span>
              </div>
           </div>
        </div>
      </div>

      <!-- 🛠️ Central de Inteligência de Filtros (Look Minimal) -->
      <div class="space-y-8">
        <!-- Cabeçalho & Segmentação -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-50 dark:border-gray-800 pb-8">
           <div class="flex items-center gap-4">
              <div class="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
              <div>
                 <h4 class="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest">Painel de Auditoria</h4>
                 <p class="text-[11px] text-gray-400 font-bold">Consulte o histórico completo de movimentações bancárias</p>
              </div>
           </div>
           
           <div class="flex p-1.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/50">
              <button v-for="t in [{v:0, l:'Consolidado'}, {v:1, l:'Créditos'}, {v:2, l:'Débitos'}]" :key="t.v"
                @click="mudarTipo(t.v)"
                :class="filtro.tipo === t.v ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-xl' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'"
                class="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300">
                {{ t.l }}
              </button>
           </div>
        </div>

        <!-- Grid de Filtros Master -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <AppSelect v-model="filtro.periodoAtalho" label="Intervalo Pré-definido" :opcoes="[
              { codigo: '', descricao: 'Personalizado' },
              { codigo: '7', descricao: 'Última Semana' },
              { codigo: '15', descricao: 'Últimas 2 Semanas' },
              { codigo: '30', descricao: 'Último Mês' }
            ]" @change="aplicarAtalhoPeriodo" />

           <AppInputTexto v-model="filtro.dataInicial" label="Data de Início" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-circle-plus" @blur="buscarDetalhes" />
           <AppInputTexto v-model="filtro.dataFinal" label="Data de Término" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar-circle-minus" @blur="buscarDetalhes" />
           
           <div class="flex items-end">
              <AppBotao variacao="primario" icone="fa7-solid:shuffle" @click="buscarDetalhes" class="w-full h-[54px] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-emerald-500/20 active:scale-95">
                 Processar Filtros
              </AppBotao>
           </div>
        </div>

        <!-- Filtros Especializados -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div class="lg:col-span-2">
              <AppSelect v-model="filtro.lancamento" label="Categorização" :opcoes="[
                  { codigo: '', descricao: 'Todos os tipos de registro' },
                  { codigo: '1', descricao: 'Contracheque' },
                  { codigo: '2', descricao: 'Lançamento Manual' },
                  { codigo: '3', descricao: 'Reembolso' },
                  { codigo: '5', descricao: 'Décimo Terceiro' },
                  { codigo: '6', descricao: 'Férias' },
                  { codigo: '7', descricao: 'Multa FGTS' },
                  { codigo: '8', descricao: 'Submódulo' }
                ]" @change="buscarDetalhes" />
           </div>
           
           <div class="grid grid-cols-2 gap-4">
              <AppSelect v-if="tipo === 'projeto'" v-model="filtro.agrupar" label="Modo Agrupado" :opcoes="[{ codigo: '1', descricao: 'Sim' }, { codigo: '0', descricao: 'Não' }]" @change="buscarDetalhes" />
              <AppSelect v-model="filtro.detalhar" label="Ver Detalhes" :opcoes="[{ codigo: '0', descricao: 'Não' }, { codigo: '1', descricao: 'Sim' }]" @change="buscarDetalhes" />
           </div>
        </div>
      </div>

      <!-- ⚡ Registros Bancários (Ultra Clean Table) -->
      <div class="bg-white dark:bg-[#1e2029]/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/[0.01]">
        <div class="overflow-x-auto max-h-[550px]">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead class="bg-gray-50/50 dark:bg-gray-900 sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 first:rounded-tl-[2.5rem]">Origem do Lançamento</th>
                <th class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Classificação</th>
                <th class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Data</th>
                <th class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Valor</th>
                <th class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right last:rounded-tr-[2.5rem]">Saldo Final</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-800/80">
              <tr v-if="carregando">
                 <td colspan="5" class="py-40 text-center">
                    <div class="inline-flex flex-col items-center gap-6">
                       <Icon name="fa7-solid:database" class="w-10 h-10 text-emerald-500 animate-pulse" />
                       <span class="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">Processando...</span>
                    </div>
                 </td>
              </tr>
              <tr v-else-if="detalhes.length === 0">
                <td colspan="5" class="py-40 text-center">
                   <Icon name="fa7-solid:box-open" class="w-14 h-14 text-gray-200 dark:text-gray-800 mb-6 mx-auto transition-transform hover:scale-110" />
                   <p class="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">Nenhum registro encontrado para<br/>os filtros selecionados no sistema.</p>
                </td>
              </tr>
              <tr v-for="(item, idx) in detalhes" :key="idx" class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all duration-300 group cursor-default">
                <td class="px-10 py-8">
                  <div class="flex flex-col" v-if="tipo === 'projeto'">
                    <span class="text-sm font-black text-gray-700 dark:text-gray-100 group-hover:text-emerald-500 transition-colors tracking-tight">{{ item.nomeFuncionario }}</span>
                    <div class="flex items-center gap-2 mt-2 opacity-50 group-hover:opacity-100 transition-all">
                       <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">ID: {{ item.usuarioCadastro || 'Autosys' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-4" v-else>
                    <div class="w-11 h-11 rounded-[15px] bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner border border-transparent dark:border-gray-700/50">
                       <Icon name="fa7-solid:id-badge" class="w-5 h-5" />
                    </div>
                    <span class="text-sm font-black text-gray-700 dark:text-gray-200 tracking-tight">{{ item.usuarioCadastro || 'AUTOMÁTICO' }}</span>
                  </div>
                </td>
                <td class="px-10 py-8">
                   <div class="flex flex-col gap-1.5">
                      <span class="text-[9px] font-black text-emerald-500 bg-emerald-500/10 self-start px-2 py-0.5 rounded-full uppercase tracking-tighter">{{ item.tipoLancamentoDesc }}</span>
                      <p class="text-[11px] text-gray-500 dark:text-gray-400 font-bold italic line-clamp-2 max-w-[280px]" :title="item.detalhes || item.tipoLancamentoDesc">
                        {{ item.detalhes || 'Sem descrição detalhada' }}
                      </p>
                   </div>
                </td>
                <td class="px-10 py-8 text-center">
                   <div class="inline-flex px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-black/20 text-xs font-black text-gray-500 dark:text-gray-400 tabular-nums">
                      {{ item.dataCadastroFormatada }}
                   </div>
                </td>
                <td class="px-10 py-8 text-right">
                   <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl font-black text-xs tabular-nums group-hover:scale-105 transition-all shadow-sm" :class="item.tipoMovimentacao === 1 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'">
                     <Icon :name="item.tipoMovimentacao === 1 ? 'fa7-solid:caret-up' : 'fa7-solid:caret-down'" class="w-2.5 h-2.5" />
                     R$ {{ formatarMoeda(item.valorMovimentacao) }}
                   </div>
                </td>
                <td class="px-10 py-8 text-right">
                   <div class="flex flex-col items-end">
                      <span class="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase mb-0.5 tracking-widest">Post-Balance</span>
                      <span class="text-sm font-black tabular-nums" :class="item.saldoAcumulado >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                        R$ {{ formatarMoeda(item.saldoAcumulado) }}
                      </span>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 🚀 Painel de Ação Final (Bottom) -->
    <template #footer>
      <div class="flex w-full justify-between items-center gap-6 px-4">
        <AppBotao variacao="primario" icone="fa7-solid:file-pdf" :carregando="gerandoExcel" :disabled="detalhes.length === 0" @click="exportarExcel" class="px-12 h-[56px] text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:translate-y-0.5">
          Exportar Excel Bancário
        </AppBotao>
        <AppBotao variacao="padrao" @click="fechar" class="font-black px-14 h-[56px] text-gray-400 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-all uppercase tracking-[0.25em] text-[10px]">
          Sair
        </AppBotao>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  id: Number,
  tipo: {
    type: String as () => 'projeto' | 'funcionario',
    required: true
  }
})

const emit = defineEmits(['close'])

const detalhes = ref<any[]>([])
const carregando = ref(false)
const gerandoExcel = ref(false)

const filtro = ref({
  tipo: 0, 
  periodoAtalho: '',
  dataInicial: '',
  dataFinal: '',
  agrupar: '1', 
  detalhar: '0',
  ordenar: '1',
  lancamento: ''
})

// Cálculos de Auditoria em Tempo Real
const totalEntradas = computed(() => detalhes.value.reduce((acc, i) => i.tipoMovimentacao === 1 ? acc + Number(i.valorMovimentacao) : acc, 0))
const totalSaidas = computed(() => detalhes.value.reduce((acc, i) => i.tipoMovimentacao === 2 ? acc + Number(i.valorMovimentacao) : acc, 0))
const saldoFinal = computed(() => {
  if (detalhes.value.length === 0) return 0
  const sorted = [...detalhes.value].sort((a,b) => b.codigo - a.codigo)
  return sorted[0]?.saldoAcumulado || 0
})

const tituloDinamico = computed(() => props.tipo === 'projeto' ? "Visão Consolidada do Projeto" : "Auditoria Detalhada de Funcionário")
const iconeDinamico = computed(() => props.tipo === 'projeto' ? "fa7-solid:briefcase" : "fa7-solid:user-shield")

const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const mudarTipo = (tipo: number) => {
  filtro.value.tipo = tipo
  buscarDetalhes()
}

const formatarDataInput = (dataObj: Date) => {
  const dia = String(dataObj.getDate()).padStart(2, '0')
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
  const ano = dataObj.getFullYear()
  return `${dia}/${mes}/${ano}`
}

const aplicarAtalhoPeriodo = () => {
  if (!filtro.value.periodoAtalho) {
    filtro.value.dataInicial = ''
    filtro.value.dataFinal = ''
  } else {
    const dias = parseInt(filtro.value.periodoAtalho)
    const hoje = new Date()
    const inicio = new Date()
    inicio.setDate(hoje.getDate() - dias)

    filtro.value.dataFinal = formatarDataInput(hoje)
    filtro.value.dataInicial = formatarDataInput(inicio)
  }
  buscarDetalhes()
}

const buscarDetalhes = async () => {
  if (!props.id) return
  carregando.value = true
  
  const endpoint = props.tipo === 'projeto' 
    ? '/api/operacao/movimentacaoBancaria/extratoProjeto/detalhes'
    : '/api/operacao/movimentacaoBancaria/extratoFuncionario/detalhes'
    
  const payload = {
    [props.tipo]: props.id,
    ...filtro.value
  }

  try {
    const response = await $fetch<{ status: string, data: any[] }>(endpoint, {
      method: 'POST',
      body: payload
    })
    detalhes.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar detalhes do extrato:', error)
  } finally {
    carregando.value = false
  }
}

const exportarExcel = async () => {
  gerandoExcel.value = true
  const endpoint = props.tipo === 'projeto' 
    ? '/api/operacao/movimentacaoBancaria/extratoProjeto/excel'
    : '/api/operacao/movimentacaoBancaria/extratoFuncionario/excel'
    
  const payload = { [props.tipo]: props.id, ...filtro.value }

  try {
    const response: Blob = await $fetch(endpoint, { method: 'POST', body: payload, responseType: 'blob' })
    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Auditoria_${props.tipo}_${props.id}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
  } finally {
    gerandoExcel.value = false
  }
}

const fechar = () => emit('close')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    filtro.value = { tipo: 0, periodoAtalho: '', dataInicial: '', dataFinal: '', agrupar: '1', detalhar: '0', ordenar: '1', lancamento: '' }
    buscarDetalhes()
  }
})
</script>
