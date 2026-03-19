<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    <AppCabecalhoPagina 
      tituloFino="Tabela Básica de" 
      tituloGrosso="Verbas"
      descricao="Gerencie as verbas salariais e seus códigos de referência" 
      icone="fa7-solid:money-bill-1" 
    />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
          <div class="md:col-span-3">
            <AppInputTexto v-model="filtro.codigoReferencia" label="Cód. Referência" placeholder="Digite o código..." icone="fa7-solid:hashtag" />
          </div>
          <div class="md:col-span-3">
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
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarVerbas">
          Pesquisar
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem 
      :carregando="carregando" 
      :buscaRealizada="true" 
      :lista="verbas"
      :visaoAtual="visaoAtual" 
      @mudarPagina="() => {}"
    >
      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Referência</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Descrição</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Tipo</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white">{{ item.codigoReferencia }}</td>
        <td class="px-6 py-4 font-medium text-sm text-gray-600 dark:text-gray-300">
           <div class="flex flex-col">
               <span>{{ item.descricao }}</span>
               <span class="text-[10px] text-gray-400 truncate max-w-[200px]" v-if="item.observacao">{{ item.observacao }}</span>
           </div>
        </td>
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
          <NuxtLink :to="`/tabelaBasica/verbas/cadastro?id=${item.codigo}`" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all inline-block" title="Editar">
            <Icon name="fa7-solid:pen-to-square" class="w-5 h-5" />
          </NuxtLink>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.descricao" 
          :subtituloNome="'Ref'" 
          :subtituloValor="item.codigoReferencia"
          :ativo="item.ativo === 1"
          @ver-detalhes="navigateTo(`/tabelaBasica/verbas/cadastro?id=${item.codigo}`)"
          @clique-titulo="navigateTo(`/tabelaBasica/verbas/cadastro?id=${item.codigo}`)"
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
  codigoReferencia: '',
  descricao: '',
  tipo: '',
  ativo: '1'
})

interface Verba {
  codigo: number
  codigoReferencia: number
  descricao: string
  tipo: number
  observacao: string
  ativo: number
}

const verbas = ref<Verba[]>([])
const modalHistoricoAberto = ref(false)
const historicoData = ref<any[]>([])

const buscarVerbas = async () => {
  carregando.value = true
  try {
    const response = await $fetch<{ data: Verba[] }>('/api/tabelaBasica/verbas/listagem', {
      method: 'POST',
      body: filtro.value
    })
    verbas.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar verbas:', error)
  } finally {
    carregando.value = false
  }
}

const abrirHistorico = async (id: number) => {
  try {
    const response = await $fetch<{ data: any[] }>('/api/tabelaBasica/verbas/historico', {
      method: 'POST',
      body: { codigoVerba: id }
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

const novoRegistro = () => {
  router.push('/tabelaBasica/verbas/cadastro?id=0')
}

buscarVerbas()
</script>