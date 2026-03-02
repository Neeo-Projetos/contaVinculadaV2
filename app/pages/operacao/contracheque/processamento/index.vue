<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:cog" class="mr-2" />
        Processamento de Contracheque
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-3 top-3 text-gray-400" />
            <input 
              v-model="filtro.mesAno" 
              v-maska data-maska="##/####" 
              placeholder="mm/aaaa" 
              type="text" 
              class="w-full border rounded-md p-2 pl-10 text-center" 
            />
          </div>
        </div>
        
        <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
           <select v-model="filtro.funcionarioId" class="w-full border rounded-md p-2 bg-white">
              <option value="">Todos</option>
              <option v-for="func in funcionarios" :key="func.codigo" :value="func.codigo">
                {{ func.nomeCompleto }}
              </option>
           </select>
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
           <select v-model="filtro.projeto" class="w-full border rounded-md p-2 bg-white">
              <option value="">Todos</option>
              <option v-for="proj in projetos" :key="proj.codigo" :value="proj.codigo">
                {{ proj.apelido }} - {{ proj.descricao }}
              </option>
           </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status de Aprovação</label>
          <select v-model="filtro.status" class="w-full border rounded-md p-2 bg-white">
            <option value="">Todos</option>
            <option value="1">Aprovado</option>
            <option value="0">Reprovado</option>
            <option value="2">Pendente</option>
          </select>
        </div>
      </div>
      
      <div v-show="filtroAberto" class="mt-4 flex justify-between">
        <button @click="irParaImportacao" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Ir para Importação</span>
          <Icon name="fa-solid:upload" class="ml-2" />
        </button>
        
        <div class="flex gap-2">
           <button @click="abrirModalInfo" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center">
            <span>Informações</span>
            <Icon name="fa-solid:info-circle" class="ml-2" />
          </button>
          <button v-show="mostraBotoesProcessamento" @click="processarContracheque(1)" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center">
            <span>Aprovar</span>
            <Icon name="fa-solid:check" class="ml-2" />
          </button>
          <button v-show="mostraBotoesProcessamento" @click="processarContracheque(0)" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center">
            <span>Reprovar</span>
            <Icon name="fa-solid:close" class="ml-2" />
          </button>
          <button @click="buscarProcessamentos" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
            <span>Filtrar</span>
            <Icon name="fa-solid:search" class="ml-2" />
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 border-b text-center w-12">
              <button v-if="mostraBotoesProcessamento" @click="marcarDesmarcarTodos" class="bg-green-500 text-white p-1 rounded text-xs hover:bg-green-600">
                <Icon :name="todosMarcados ? 'fa-solid:times' : 'fa-solid:check'" />
              </button>
            </th>
            <th class="p-3 border-b">Funcionário</th>
            <th class="p-3 border-b">CPF</th>
            <th class="p-3 border-b">Projeto</th>
            <th class="p-3 border-b">Vlr Líquido</th>
            <th class="p-3 border-b">Matrícula</th>
            <th class="p-3 border-b">13º</th>
            <th class="p-3 border-b">Férias</th>
            <th class="p-3 border-b">Multa FGTS</th>
            <th class="p-3 border-b">Submódulo</th>
            <th class="p-3 border-b">Vlr Retido</th>
            <th class="p-3 border-b text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="lista.length === 0">
            <td colspan="12" class="p-4 text-center text-gray-500 font-bold">Nenhum contracheque encontrado</td>
          </tr>
          <tr v-for="item in lista" :key="item.codigo" class="hover:bg-gray-50 border-b">
            <td class="p-3 text-center">
              <input v-if="item.statusAprovacao === 2" type="checkbox" v-model="item.selecionado" class="w-4 h-4 cursor-pointer" />
            </td>
            <td class="p-3">
              <a v-if="item.statusAprovacao !== 2" href="#" @click.prevent="abrirModalDetalhes(item.codigo)" class="text-blue-600 hover:underline">
                {{ item.funcionario }}
              </a>
              <span v-else>{{ item.funcionario }}</span>
            </td>
            <td class="p-3">{{ item.cpf }}</td>
            <td class="p-3">{{ item.projeto }}</td>
            <td class="p-3 font-semibold text-blue-800">R$ {{ formatarMoeda(item.valorLiquido) }}</td>
            <td class="p-3">{{ item.matricula }}</td>
            <td class="p-3 text-gray-600">R$ {{ formatarMoeda(item.decimoTerceiro) }}</td>
            <td class="p-3 text-gray-600">R$ {{ formatarMoeda(item.feriasConstitucional) }}</td>
            <td class="p-3 text-gray-600">R$ {{ formatarMoeda(item.multaFgts) }}</td>
            <td class="p-3 text-gray-600">R$ {{ formatarMoeda(item.submodulo) }}</td>
            <td class="p-3 font-semibold text-red-800">R$ {{ formatarMoeda(item.valorRetencao) }}</td>
            <td class="p-3 text-center">
              <span v-if="item.statusAprovacao === 0" class="text-red-600 font-bold bg-red-100 px-2 py-1 rounded">Reprovado</span>
              <span v-else-if="item.statusAprovacao === 1" class="text-green-600 font-bold bg-green-100 px-2 py-1 rounded">Aprovado</span>
              <span v-else class="text-yellow-600 font-bold bg-yellow-100 px-2 py-1 rounded">Pendente</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal :isOpen="modalDetalhesAberto" title="Detalhamento por Verba" @close="modalDetalhesAberto = false" size="xl">
      <div class="overflow-x-auto p-4">
        <table class="w-full text-center border-collapse whitespace-nowrap">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 border">Verba</th>
              <th class="p-2 border">Vlr Verba</th>
              <th class="p-2 border">Vlr Décimo</th>
              <th class="p-2 border">% Décimo</th>
              <th class="p-2 border">Vlr Férias</th>
              <th class="p-2 border">% Férias</th>
              <th class="p-2 border">Vlr Multa</th>
              <th class="p-2 border">% Multa</th>
              <th class="p-2 border">Vlr Submódulo</th>
              <th class="p-2 border">% Submódulo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="det in detalhesVerba" :key="det.codigo" class="border-b hover:bg-gray-50">
              <td class="p-2 border text-left">{{ det.verbaDescricao }}</td>
              <td class="p-2 border font-semibold">R$ {{ formatarMoeda(det.valorVerba) }}</td>
              <td class="p-2 border">R$ {{ formatarMoeda(det.valorDecimoTerceiro) }}</td>
              <td class="p-2 border">{{ formatarMoeda(det.percentualDecimoTerceiro) }}%</td>
              <td class="p-2 border">R$ {{ formatarMoeda(det.valorFerias) }}</td>
              <td class="p-2 border">{{ formatarMoeda(det.percentualFerias) }}%</td>
              <td class="p-2 border">R$ {{ formatarMoeda(det.valorMultaFgts) }}</td>
              <td class="p-2 border">{{ formatarMoeda(det.percentualMultaFgts) }}%</td>
              <td class="p-2 border">R$ {{ formatarMoeda(det.valorSubmodulo) }}</td>
              <td class="p-2 border">{{ formatarMoeda(det.percentualSubmodulo) }}%</td>
            </tr>
            <tr v-if="detalhesVerba.length === 0">
               <td colspan="10" class="p-4 text-gray-500">Nenhum detalhe encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppModal>

     <AppModal :isOpen="modalInfoAberto" title="Informações de Processamento" @close="modalInfoAberto = false">
      <div class="p-4 text-center">
        <h3 class="font-bold text-lg mb-4">SEGUE ABAIXO AS INFORMAÇÕES PARA REALIZAR O PROCESSAMENTO DE UM CONTRACHEQUE:</h3>
        
        <div class="my-6">
          <p class="text-green-600 font-bold text-xl mb-1">APROVAR</p>
          <p class="text-gray-800 font-semibold">Os contracheques selecionados<br> serão APROVADOS e processados.</p>
        </div>
        
        <div class="my-6">
          <p class="text-red-600 font-bold text-xl mb-1">REPROVAR</p>
          <p class="text-gray-800 font-semibold">Os contracheques selecionados<br> serão REPROVADOS e processados.</p>
        </div>
      </div>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const router = useRouter()
const filtroAberto = ref(true)

const filtro = ref({
  mesAno: '',
  projeto: '',
  funcionarioId: '',
  status: '2' // Padrão: Pendentes
})

const mostraBotoesProcessamento = computed(() => filtro.value.status === '2')

const lista = ref<any[]>([])
const projetos = ref<any[]>([])
const funcionarios = ref<any[]>([])
const detalhesVerba = ref<any[]>([])

const modalDetalhesAberto = ref(false)
const modalInfoAberto = ref(false)

const todosMarcados = computed(() => {
  const pendentes = lista.value.filter(i => i.statusAprovacao === 2)
  return pendentes.length > 0 && pendentes.every(i => i.selecionado)
})

const formatarMoeda = (valor: number) => {
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const carregarCombos = async () => {
  try {
    const resProjetos = await $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos')
    projetos.value = resProjetos.data || []
    
    // Supondo que você criou essa rota de listar funcionários ativos
    const resFuncionarios = await $fetch<{ data: any[] }>('/api/cadastro/funcionario/ativos')
    funcionarios.value = resFuncionarios.data || []
  } catch (e) {
    console.error('Erro ao carregar selects', e)
  }
}

const buscarProcessamentos = async () => {
  if (!filtro.value.mesAno) return alert("Informe o mês/ano no filtro.")

  try {
    const response = await $fetch<{ data: any[] }>('/api/operacao/contracheque/processamento/listagem', {
      method: 'POST',
      body: filtro.value
    })
    
    // Adiciona propriedade reativa pro checkbox
    lista.value = (response.data || []).map(item => ({ ...item, selecionado: true }))
  } catch (error) {
    console.error('Erro ao buscar contracheques:', error)
  }
}

const marcarDesmarcarTodos = () => {
  const novoEstado = !todosMarcados.value
  lista.value.forEach(item => {
    if (item.statusAprovacao === 2) item.selecionado = novoEstado
  })
}

const processarContracheque = async (statusAprovacao: number) => {
  const matriculasSelecionadas = lista.value
    .filter(item => item.statusAprovacao === 2 && item.selecionado)
    .map(item => item.matricula)

  if (matriculasSelecionadas.length === 0) return alert("Selecione pelo menos um contracheque para processar.")

  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/operacao/contracheque/processamento/gravar', {
      method: 'POST',
      body: { 
        matriculas: matriculasSelecionadas,
        statusAprovacao: statusAprovacao 
      }
    })

    if (res.status === 'success') {
      alert('Operação realizada com sucesso!')
      filtro.value.status = statusAprovacao.toString()
      buscarProcessamentos()
    } else {
      alert(res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao processar:', error)
    alert('Erro ao processar contracheques.')
  }
}

const abrirModalDetalhes = async (id: number) => {
  try {
    const response = await $fetch<{ data: any[] }>('/api/operacao/contracheque/processamento/detalhes', {
      method: 'POST',
      body: { codigoContracheque: id }
    })
    detalhesVerba.value = response.data || []
    modalDetalhesAberto.value = true
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error)
  }
}

const abrirModalInfo = () => modalInfoAberto.value = true

const irParaImportacao = () => router.push('/operacao/contracheque/importacao')

carregarCombos()
</script>