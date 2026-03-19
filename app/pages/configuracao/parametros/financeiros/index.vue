<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    <AppCabecalhoPagina 
      tituloFino="Parâmetros" 
      tituloGrosso="Financeiros"
      descricao="Gerencie as alíquotas e percentuais de retenção por projeto" 
      icone="fa7-solid:percent" 
    />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
          <div class="md:col-span-8">
            <AppInputTexto v-model="filtro.projetoNome" label="Projeto" placeholder="Digite o projeto..." icone="fa7-solid:briefcase" />
          </div>
          <div class="md:col-span-4">
            <AppSelecaoStatus v-model="filtro.ativo" />
          </div>
        </div>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="primario" icone="fa7-solid:plus" @click="novoRegistro">
          Novo Registro
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarFinanceiros">
          Pesquisar
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem 
      :carregando="carregando" 
      :buscaRealizada="true" 
      :lista="financeiros"
      :visaoAtual="visaoAtual" 
      @mudarPagina="() => {}"
    >
      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Projeto</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Taxas</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white">
            <div class="flex flex-col">
                <span>{{ item.apelido }}</span>
                <span class="text-xs text-gray-500 font-medium">{{ item.projeto }}</span>
            </div>
        </td>
        <td class="px-6 py-4 text-center">
          <button @click="abrirModalParametros(item)" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Ver Alíquotas">
            <Icon name="fa7-solid:percent" class="w-5 h-5" />
          </button>
        </td>
        <td class="px-6 py-4 text-center">
            <AppAtivo :ativo="item.ativo === 1" />
        </td>
        <td class="px-6 py-4 text-center">
          <button @click="abrirHistorico(item.codigo)" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Ver Histórico">
            <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5" />
          </button>
        </td>
        <td class="px-6 py-4 text-right">
          <NuxtLink :to="`/configuracao/parametros/financeiros/cadastro?id=${item.codigo}`" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all inline-block" title="Editar">
            <Icon name="fa7-solid:pen-to-square" class="w-5 h-5" />
          </NuxtLink>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.apelido" 
          :subtituloNome="'Projeto'" 
          :subtituloValor="item.projeto"
          :ativo="item.ativo === 1"
          @ver-detalhes="navigateTo(`/configuracao/parametros/financeiros/cadastro?id=${item.codigo}`)"
          @clique-titulo="navigateTo(`/configuracao/parametros/financeiros/cadastro?id=${item.codigo}`)"
        >
            <template #actions-extra>
                <button @click="abrirModalParametros(item)" class="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors border border-gray-100 dark:border-gray-800" title="Alíquotas">
                    <Icon name="fa7-solid:percent" class="w-4 h-4" />
                </button>
                <button @click="abrirHistorico(item.codigo)" class="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors border border-gray-100 dark:border-gray-800" title="Histórico">
                    <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4" />
                </button>
            </template>
        </AppCardListagem>
      </template>
    </AppContainerListagem>

    <AppModalHistorico 
      :aberto="modalHistoricoAberto" 
      :historico="historicoData" 
      @close="modalHistoricoAberto = false" 
    />

    <AppModal :isOpen="modalParametroAberto" title="Detalhamento de Alíquotas" @close="modalParametroAberto = false">
      <div class="grid grid-cols-2 gap-4 p-4" v-if="parametroSelecionado">
          <div class="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
              <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">13º Salário</span>
              <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ parametroSelecionado.decimoTerceiro }}%</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
              <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Férias 1/3</span>
              <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ parametroSelecionado.feriasConstitucional }}%</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
              <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Multa FGTS</span>
              <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ parametroSelecionado.multaFgts }}%</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
              <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Submódulo</span>
              <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ parametroSelecionado.submodulo }}%</span>
          </div>
      </div>
      <template #footer>
          <div class="flex justify-end p-4">
              <AppBotao variacao="padrao" @click="modalParametroAberto = false">Fechar</AppBotao>
          </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()
const visaoAtual = ref('lista')
const carregando = ref(false)
const filtroAberto = ref(true)

const filtro = ref({
  projetoNome: '',
  ativo: '1'
})

interface Financeiro {
  codigo: number
  projeto: string
  apelido: string
  decimoTerceiro: string
  feriasConstitucional: string
  multaFgts: string
  submodulo: string
  ativo: number
}

interface Historico {
  codigo: number
  dataAlteracao: string
  usuarioAlteracao: string
  alteracoes: string[]
}

const financeiros = ref<Financeiro[]>([])
const modalParametroAberto = ref(false)
const parametroSelecionado = ref<Financeiro | null>(null)
const modalHistoricoAberto = ref(false)
const historicoData = ref<Historico[]>([])

const buscarFinanceiros = async () => {
  carregando.value = true
  try {
    const response = await $fetch<{ data: Financeiro[] }>('/api/configuracao/parametros/financeiros/listagem', {
      method: 'POST',
      body: filtro.value
    })
    financeiros.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar parâmetros financeiros:', error)
  } finally {
    carregando.value = false
  }
}

const abrirModalParametros = (item: Financeiro) => {
  parametroSelecionado.value = item
  modalParametroAberto.value = true
}

const abrirHistorico = async (id: number) => {
  try {
    const response = await $fetch<{ data: Historico[] }>('/api/configuracao/parametros/financeiros/historico', {
      method: 'POST',
      body: { parametroFinanceiro: id }
    })
    historicoData.value = response.data || []
    modalHistoricoAberto.value = true
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
  }
}

const novoRegistro = () => {
  router.push('/configuracao/parametros/financeiros/cadastro?id=0')
}

buscarFinanceiros()
</script>