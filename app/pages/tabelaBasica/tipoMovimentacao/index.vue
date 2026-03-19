<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    <AppCabecalhoPagina 
      tituloFino="Tabela Básica de" 
      tituloGrosso="Tipo de Movimentação"
      descricao="Gerencie as categorias de crédito e débito do sistema" 
      icone="fa7-solid:shuffle" 
    />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
          <div class="md:col-span-6">
            <AppInputTexto v-model="filtro.descricao" label="Descrição" placeholder="Digite a descrição..." icone="fa7-solid:tag" />
          </div>
          <div class="md:col-span-3">
            <AppSelect v-model="filtro.tipo" label="Tipo" :opcoes="[{ codigo: '', descricao: 'Todos' }, { codigo: '1', descricao: 'Crédito' }, { codigo: '0', descricao: 'Débito' }]" />
          </div>
          <div class="md:col-span-3">
            <AppSelecaoStatus v-model="filtro.ativo" />
          </div>
        </div>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="primario" icone="fa7-solid:plus" @click="novoRegistro">
          Novo Registro
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarTipos">
          Pesquisar
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem 
      :carregando="carregando" 
      :buscaRealizada="true" 
      :lista="tipos"
      :visaoAtual="visaoAtual" 
      @mudarPagina="() => {}"
    >
      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white">{{ item.descricao }}</td>
        <td class="px-6 py-4">
            <span :class="item.tipo === 1 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'" class="px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                {{ item.tipo === 1 ? 'Crédito' : 'Débito' }}
            </span>
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
          <NuxtLink :to="`/tabelaBasica/tipoMovimentacao/cadastro?id=${item.codigo}`" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all inline-block" title="Editar">
            <Icon name="fa7-solid:pen-to-square" class="w-5 h-5" />
          </NuxtLink>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.descricao" 
          :subtituloNome="'Tipo'" 
          :subtituloValor="item.tipo === 1 ? 'Crédito' : 'Débito'"
          :ativo="item.ativo === 1"
          @ver-detalhes="navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?id=${item.codigo}`)"
          @clique-titulo="navigateTo(`/tabelaBasica/tipoMovimentacao/cadastro?id=${item.codigo}`)"
        >
            <template #actions-extra>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()
const visaoAtual = ref('lista')
const carregando = ref(false)
const filtroAberto = ref(true)

const filtro = ref({
  descricao: '',
  tipo: '',
  ativo: '1'
})

interface TipoMovimentacao {
  codigo: number
  descricao: string
  tipo: number
  ativo: number
}

const tipos = ref<TipoMovimentacao[]>([])
const modalHistoricoAberto = ref(false)
const historicoData = ref<any[]>([])

const buscarTipos = async () => {
  carregando.value = true
  try {
    const response = await $fetch<{ data: TipoMovimentacao[] }>('/api/tabelaBasica/tipoMovimentacao/listagem', {
      method: 'POST',
      body: filtro.value
    })
    tipos.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar tipos de movimentação:', error)
  } finally {
    carregando.value = false
  }
}

const abrirHistorico = async (id: number) => {
  try {
    const response = await $fetch<{ data: any[] }>('/api/tabelaBasica/tipoMovimentacao/historico', {
      method: 'POST',
      body: { tipoMovimentacao: id }
    })
    
    // Mapeio os dados para o formato esperado pelo componente AppModalHistorico
    historicoData.value = (response.data || []).map(h => ({
      dataHora: h.dataAlteracao,
      usuario: h.usuarioAlteracao,
      alteracoes: h.alteracoes.map((st: string) => ({
        tipo: 'texto',
        mensagem: st
      }))
    }))
    
    modalHistoricoAberto.value = true
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
  }
}

const novoRegistro = () => router.push('/tabelaBasica/tipoMovimentacao/cadastro?id=0')

buscarTipos()
</script>