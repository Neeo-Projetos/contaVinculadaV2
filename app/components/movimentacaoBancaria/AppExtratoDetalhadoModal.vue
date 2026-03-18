<template>
  <AppModal :isOpen="isOpen" :title="tituloDinamico" :icon="iconeDinamico" @close="fechar" tamanho="2xl">
    
    <div class="space-y-6">
      <div class="p-6 bg-white dark:bg-[#1a1c23] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <span class="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Visualizar:</span>
          <div class="flex gap-1.5 p-1.5 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 inline-flex">
            <button v-for="t in [{v:0, l:'Todas'}, {v:1, l:'Entradas'}, {v:2, l:'Saídas'}]" :key="t.v"
              @click="mudarTipo(t.v)"
              :class="filtro.tipo === t.v ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/5'"
              class="px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300">
              {{ t.l }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-5">
          <div class="md:col-span-2 lg:col-span-1">
            <AppSelect v-model="filtro.periodoAtalho" label="Atalho" :opcoes="[
              { codigo: '', descricao: 'Selecione...' },
              { codigo: '7', descricao: 'Últimos 7 dias' },
              { codigo: '15', descricao: 'Últimos 15 dias' },
              { codigo: '30', descricao: 'Últimos 30 dias' }
            ]" @change="aplicarAtalhoPeriodo" />
          </div>
          <AppInputTexto v-model="filtro.dataInicial" label="Data Inicial" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar" @blur="buscarDetalhes" />
          <AppInputTexto v-model="filtro.dataFinal" label="Data Final" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar" @blur="buscarDetalhes" />
          
          <AppSelect v-if="tipo === 'projeto'" v-model="filtro.agrupar" label="Agrupamento" :opcoes="[{ codigo: '1', descricao: 'Agrupado (Total)' }, { codigo: '0', descricao: 'Individ. (Func.)' }]" @change="buscarDetalhes" />
          
          <AppSelect v-model="filtro.ordenar" label="Ordem" :opcoes="[{ codigo: '1', descricao: 'Mais recente' }, { codigo: '0', descricao: 'Mais antigo' }]" @change="buscarDetalhes" />
          
          <div v-if="tipo === 'funcionario'" class="flex items-end pb-1">
            <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarDetalhes" class="w-full shadow-lg shadow-emerald-500/20">
              Filtrar
            </AppBotao>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2 border-t border-gray-100 dark:border-white/5">
          <div class="md:col-span-3">
             <AppSelect v-model="filtro.lancamento" label="Tipo de Lançamento" :opcoes="[
                { codigo: '', descricao: 'Todos os tipos' },
                { codigo: '1', descricao: 'Contracheque' },
                { codigo: '2', descricao: 'Lançamento Manual' },
                { codigo: '3', descricao: 'Reembolso' },
                { codigo: '5', descricao: 'Décimo Terceiro' },
                { codigo: '6', descricao: 'Férias' },
                { codigo: '7', descricao: 'Multa FGTS' },
                { codigo: '8', descricao: 'Submódulo' }
              ]" @change="buscarDetalhes" />
          </div>
          <AppSelect v-model="filtro.detalhar" label="Ver Detalhes?" :opcoes="[{ codigo: '0', descricao: 'Não' }, { codigo: '1', descricao: 'Sim' }]" @change="buscarDetalhes" />
        </div>
      </div>

      <div class="bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto max-h-[450px] custom-scrollbar">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50/90 dark:bg-[#1e2029]/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 dark:border-white/5">
              <tr>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {{ tipo === 'projeto' ? 'Participantes' : 'Autor / Usuário' }}
                </th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Lançamento / Descrição</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-center">Data</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right">Valor</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right">
                  {{ tipo === 'projeto' ? 'Saldo do Projeto' : 'Saldo Acumulado' }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-white/5">
              
              <tr v-if="carregando">
                <td colspan="5" class="py-24 text-center">
                   <Icon name="fa7-solid:circle-notch" class="w-10 h-10 text-emerald-500 animate-spin mb-4 mx-auto" />
                   <p class="text-sm text-gray-400 dark:text-gray-500 font-bold tracking-wide">Processando extrato...</p>
                </td>
              </tr>
              
              <tr v-else-if="detalhes.length === 0">
                <td colspan="5" class="py-24 text-center flex flex-col items-center">
                   <div class="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-full flex items-center justify-center mb-5 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-white/5 shadow-inner">
                      <Icon name="fa7-solid:ghost" class="w-10 h-10" />
                   </div>
                   <p class="text-sm text-gray-500 dark:text-gray-400 font-bold">Nenhuma movimentação encontrada.</p>
                   <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Tente ajustar os filtros acima.</p>
                </td>
              </tr>

              <tr v-for="(item, idx) in detalhes" :key="idx" class="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                <td class="px-6 py-5">
                  <div class="flex flex-col" v-if="tipo === 'projeto'">
                    <span class="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ item.nomeFuncionario }}</span>
                    <span class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Usuário: {{ item.usuarioCadastro || '-' }}</span>
                  </div>
                  <div class="flex items-center gap-4" v-else>
                    <div class="w-10 h-10 rounded-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                       <Icon name="fa7-solid:user-shield" class="w-4 h-4" />
                    </div>
                    <span class="text-sm font-bold text-gray-700 dark:text-gray-200">{{ item.usuarioCadastro || '-' }}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                   <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed truncate max-w-[280px]" :title="item.detalhes || item.tipoLancamentoDesc">
                     {{ item.detalhes || item.tipoLancamentoDesc }}
                   </p>
                </td>
                <td class="px-6 py-5 text-center">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                    <Icon name="fa7-regular:calendar" class="w-3 h-3 text-gray-400" />
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-400">{{ item.dataCadastroFormatada }}</span>
                  </div>
                </td>
                <td class="px-6 py-5 text-right">
                  <span class="text-sm font-black" :class="item.tipoMovimentacao === 1 ? 'text-emerald-500' : 'text-rose-500'">
                    {{ item.tipoMovimentacao === 1 ? '+' : '-' }} R$ {{ formatarMoeda(item.valorMovimentacao) }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                   <div class="inline-block px-3.5 py-1.5 rounded-lg font-bold text-sm" 
                        :class="item.saldoAcumulado >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'">
                     R$ {{ formatarMoeda(item.saldoAcumulado) }}
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full justify-between items-center gap-4 pt-2">
        <AppBotao variacao="primario" icone="fa7-solid:file-excel" :carregando="gerandoExcel" :disabled="detalhes.length === 0" @click="exportarExcel" class="shadow-lg shadow-emerald-500/20">
          Exportar para Excel
        </AppBotao>
        <AppBotao variacao="padrao" @click="fechar" class="hover:bg-gray-100 dark:hover:bg-white/5 border-transparent">
          Fechar Extrato
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

const tituloDinamico = computed(() => props.tipo === 'projeto' ? "Extrato Detalhado do Projeto" : "Extrato Detalhado do Funcionário")
const iconeDinamico = computed(() => props.tipo === 'projeto' ? "fa7-solid:clipboard-list" : "fa7-solid:user-clock")

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
    
  const payload = {
    [props.tipo]: props.id,
    ...filtro.value
  }

  try {
    const response: Blob = await $fetch(endpoint, {
      method: 'POST',
      body: payload,
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url
    const nomeBase = props.tipo === 'projeto' ? 'Projeto' : 'Funcionario'
    link.setAttribute('download', `Extrato_${nomeBase}_${props.id}.xlsx`)
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