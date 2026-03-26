<template>
  <div class="min-h-full flex flex-col gap-6 p-2 md:p-6 animate-fade-in transition-colors duration-500">
    <div class="relative overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-gradient-to-r dark:from-[#1a1c23] dark:to-[#0f172a] p-8 border border-gray-100 dark:border-gray-800 transition-all duration-500 group">
      <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full border-[30px] border-emerald-500/5 dark:border-emerald-500/10 blur-sm pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
      <div class="absolute -right-10 top-20 w-32 h-32 rounded-full border-[15px] border-emerald-500/5 dark:border-emerald-500/10 blur-sm pointer-events-none group-hover:-translate-y-4 transition-all duration-700"></div>
      
      <div class="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        
        <div>
          <h2 class="text-3xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
            {{ saudacao }}, <span class="text-emerald-500 dark:text-emerald-400 opacity-90 underline decoration-emerald-200 underline-offset-8">{{ userName }}</span>
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm md:text-base font-bold flex items-center gap-2">
            <Icon name="fa7-solid:shield-halved" class="text-emerald-500" />
            Visão Geral do Sistema Conta Vinculada
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 bg-gray-50/80 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:px-6 border border-gray-200/50 dark:border-white/10 shadow-sm shrink-0 w-full xl:w-auto">
          
          <div class="flex items-center gap-3 sm:border-r border-gray-200 dark:border-white/10 sm:pr-5 w-full justify-center sm:justify-start">
            <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner shrink-0">
              <Icon name="fa7-solid:calendar-day" class="w-4 h-4 text-emerald-500" />
            </div>
            <div class="text-left">
              <div class="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Data Atual</div>
              <div class="text-gray-900 dark:text-white font-black text-sm whitespace-nowrap">{{ dataCompleta }}</div>
            </div>
          </div>

          <div class="w-full h-px bg-gray-200 dark:bg-white/10 block sm:hidden"></div>

          <div class="flex items-center gap-3 sm:pl-1 w-full justify-center sm:justify-start">
            <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner shrink-0">
              <Icon name="fa7-solid:clock" class="w-4 h-4 text-blue-500" />
            </div>
            <div class="text-left">
              <div class="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Horário Local</div>
              <div class="text-gray-900 dark:text-white font-black text-lg tabular-nums tracking-tighter">{{ horaCompleta }}</div>
            </div>
          </div>

        </div>

      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <NuxtLink to="/cadastro/funcionario" class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div class="flex items-start justify-between relative z-10">
          <div>
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Funcionários Ativos</p>
            <div v-if="loading" class="mt-3 h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <h3 v-else class="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{{ stats.funcionariosAtivos }}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30">
            <Icon name="fa7-solid:users" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-xs font-medium text-gray-400 group-hover:text-emerald-500 transition-colors relative z-10">
          <span>Total de {{ stats.funcionariosTotal }} cadastrados</span>
          <Icon name="fa7-solid:arrow-right" class="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </NuxtLink>

      <NuxtLink to="/operacao/contracheque/processamento" class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div class="flex items-start justify-between relative z-10">
          <div>
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contracheques</p>
            <div v-if="loading" class="mt-3 h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <h3 v-else class="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{{ stats.totalContracheques }}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30">
            <Icon name="fa7-solid:file-invoice-dollar" class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-xs font-medium text-gray-400 group-hover:text-indigo-500 transition-colors relative z-10">
          <span>Ir para processamento</span>
          <Icon name="fa7-solid:arrow-right" class="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/lancamentoManual" class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div class="flex items-start justify-between relative z-10">
          <div>
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lançamentos Lote</p>
            <div v-if="loading" class="mt-3 h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <h3 v-else class="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{{ stats.totalLancamentosManuais }}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30">
            <Icon name="fa7-solid:cash-register" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-xs font-medium text-gray-400 group-hover:text-amber-500 transition-colors relative z-10">
          <span>Ver lançamentos manuais</span>
          <Icon name="fa7-solid:arrow-right" class="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </NuxtLink>

      <NuxtLink to="/operacao/oficio/lancamentoReembolso" class="group relative bg-white dark:bg-[#1e2029] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-[#a8cf45]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div class="flex items-start justify-between relative z-10">
          <div>
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reembolsos</p>
            <div v-if="loading" class="mt-3 h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <h3 v-else class="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">{{ stats.totalReembolsos }}</h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#a8cf45]/10 flex items-center justify-center shrink-0 border border-[#a8cf45]/30">
            <Icon name="fa7-solid:hand-holding-dollar" class="w-6 h-6 text-[#8cc63f]" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-xs font-medium text-gray-400 hover:text-[#8cc63f] transition-colors relative z-10">
          <span>Acessar controles de ofício</span>
          <Icon name="fa7-solid:arrow-right" class="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col min-h-[400px]">
        <div class="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Icon name="fa7-solid:chart-line" class="text-emerald-500" /> Fluxo de Caixa Mensal
          </h3>
          <div class="flex items-center gap-3">
             <div class="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Entradas
                <span class="w-2 h-2 rounded-full bg-rose-500 ml-2"></span> Saídas
             </div>
          </div>
        </div>
        
        <div class="flex-1 min-h-0">
          <client-only>
            <apexchart v-if="chartSeries.length > 0" type="area" height="100%" width="100%" :options="chartOptions" :series="chartSeries" />
            <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-center py-10">
              <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200 dark:border-gray-700">
                <Icon name="fa7-solid:wand-magic-sparkles" class="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p class="font-medium text-gray-600 dark:text-gray-300">Carregando dados financeiros...</p>
            </div>
          </client-only>
        </div>
      </div>

      <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
          <Icon name="fa7-solid:bolt" class="text-amber-500" /> Ações Rápidas
        </h3>
        
        <div class="flex flex-col gap-3">
          <NuxtLink to="/cadastro/funcionario/cadastro?id=0" class="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30 group">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="fa7-solid:user-plus" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Novo Funcionário</span>
              <span class="text-xs text-gray-500">Cadastrar no sistema</span>
            </div>
          </NuxtLink>

          <NuxtLink to="/operacao/movimentacaoBancaria/lancamentoManual/cadastro?id=0" class="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30 group">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="fa7-solid:plus" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Lançamento em Lote</span>
              <span class="text-xs text-gray-500">Operação financeira</span>
            </div>
          </NuxtLink>

          <NuxtLink to="/operacao/contracheque/importacao" class="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30 group">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="fa7-solid:upload" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Importar Contracheque</span>
              <span class="text-xs text-gray-500">Processamento em massa</span>
            </div>
          </NuxtLink>

          <NuxtLink to="/configuracao/usuario" class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group mt-2 bg-gray-50 dark:bg-gray-800/40">
            <div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:rotate-90">
              <Icon name="fa7-solid:gear" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200">Configurações</span>
              <span class="text-xs text-gray-500">Ajustes do sistema</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const userName = ref('Usuário')
const loading = ref(true)
const dataAtual = ref(new Date())
let timerTempo: ReturnType<typeof setInterval>

const stats = ref({
  funcionariosAtivos: 0,
  funcionariosTotal: 0,
  totalContracheques: 0,
  totalLancamentosManuais: 0,
  totalReembolsos: 0,
})

const chartData = ref<any[]>([])

const saudacao = computed(() => {
  const hora = dataAtual.value.getHours()
  if (hora >= 5 && hora < 12) return 'Bom dia'
  if (hora >= 12 && hora < 18) return 'Boa tarde'
  return 'Boa noite'
})

const dataCompleta = computed(() => {
  const opcoes: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long' }
  let textoStr = dataAtual.value.toLocaleDateString('pt-BR', opcoes)
  return textoStr.charAt(0).toUpperCase() + textoStr.slice(1)
})

const horaCompleta = computed(() => {
  return dataAtual.value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

// ApexCharts Config
const chartSeries = computed(() => {
  if (chartData.value.length === 0) return []
  return [
    { name: 'Entradas', data: chartData.value.map(d => d.entradas) },
    { name: 'Saídas', data: chartData.value.map(d => d.saidas) }
  ]
})

const chartOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Inter, sans-serif' },
  colors: ['#10b981', '#ef4444'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 95, 100] } },
  xaxis: {
    categories: chartData.value.map(d => d.mesAno),
    axisBorder: { show: false }, axisTicks: { show: false },
    labels: { style: { colors: '#94a3b8', fontWeight: 700, fontSize: '10px' } }
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontWeight: 700, fontSize: '10px' },
      formatter: (v: number) => `R$ ${Math.floor(v / 1000)}k`
    }
  },
  grid: { borderColor: 'rgba(148, 163, 184, 0.05)', strokeDashArray: 4 },
  legend: { show: false },
  tooltip: { theme: 'dark' }
}))

onMounted(async () => {
  timerTempo = setInterval(() => {
    dataAtual.value = new Date()
  }, 1000)

  if (process.client) {
    try {
      const userRaw = localStorage.getItem('user')
      if (userRaw) {
        const user = JSON.parse(userRaw)
        let nome = user.nome || user.login || 'Usuário'
        userName.value = nome.charAt(0).toUpperCase() + nome.slice(1)
      }
    } catch {}
  }

  try {
    const [resStats, resChart] = await Promise.all([
      $fetch<any>('/api/dashboard/stats'),
      $fetch<any>('/api/dashboard/movimentacaoMensal')
    ])
    
    if (resStats?.status === 'success') stats.value = resStats.data
    if (resChart?.status === 'success') chartData.value = resChart.data

  } catch (e) {
    console.error('Erro ao buscar dados do dashboard:', e)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  clearInterval(timerTempo)
})
</script>

<style scoped src="./index.style.css"></style>