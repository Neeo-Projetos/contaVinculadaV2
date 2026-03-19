<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    <AppCabecalhoPagina 
      tituloFino="Tabela Básica de" 
      tituloGrosso="Bancos"
      descricao="Gerencie as instituições bancárias cadastradas no sistema" 
      icone="fa7-solid:building-columns" 
    />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end w-full">
          <div class="md:col-span-4">
            <AppInputTexto v-model="filtro.codigoBanco" label="Código do Banco" placeholder="Digite o código..." icone="fa7-solid:hashtag" />
          </div>
          <div class="md:col-span-5">
            <AppInputTexto v-model="filtro.nomeBanco" label="Nome da Instituição" placeholder="Digite o nome..." icone="fa7-solid:building" />
          </div>
          <div class="md:col-span-3">
            <AppSelecaoStatus v-model="filtro.ativo" />
          </div>
        </div>
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:list-check" @click="importarApi">Listar Bancos (API)</AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="primario" icone="fa7-solid:plus" @click="novoRegistro">
          Novo Registro
        </AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarBancos">
          Pesquisar
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem 
      :carregando="carregando" 
      :buscaRealizada="true" 
      :lista="bancos"
      :visaoAtual="visaoAtual" 
      @mudarPagina="() => {}"
    >
      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instituição</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white">{{ item.codigoBanco }}</td>
        <td class="px-6 py-4 font-medium text-sm text-gray-600 dark:text-gray-300">{{ item.nomeBanco }}</td>
        <td class="px-6 py-4 text-center">
            <AppAtivo :ativo="item.ativo === 1" />
        </td>
        <td class="px-6 py-4 text-center">
          <button @click="abrirHistorico(item.codigo)" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Ver Histórico">
            <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5" />
          </button>
        </td>
        <td class="px-6 py-4 text-right">
          <NuxtLink :to="`/tabelaBasica/bancos/cadastro?id=${item.codigo}`" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all inline-block" title="Editar">
            <Icon name="fa7-solid:pen-to-square" class="w-5 h-5" />
          </NuxtLink>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.nomeBanco" 
          :subtituloNome="'Cód. Banco'" 
          :subtituloValor="item.codigoBanco"
          :ativo="item.ativo === 1"
          @ver-detalhes="navigateTo(`/tabelaBasica/bancos/cadastro?id=${item.codigo}`)"
          @clique-titulo="navigateTo(`/tabelaBasica/bancos/cadastro?id=${item.codigo}`)"
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
  codigoBanco: '',
  nomeBanco: '',
  ativo: '1'
})

const bancos = ref<any[]>([])
const modalHistoricoAberto = ref(false)
const historicoData = ref<any[]>([])

const buscarBancos = async () => {
  carregando.value = true
  try {
    const response = await $fetch<{ data: any[] }>('/api/tabelaBasica/bancos/listagem', {
      method: 'POST',
      body: filtro.value
    })
    bancos.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar bancos:', error)
  } finally {
    carregando.value = false
  }
}

const abrirHistorico = async (id: number) => {
  try {
    const response = await $fetch<{ data: any[] }>('/api/tabelaBasica/bancos/historico', {
      method: 'POST',
      body: { banco: id }
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

const novoRegistro = () => router.push('/tabelaBasica/bancos/cadastro?id=0')
const importarApi = () => router.push('/tabelaBasica/bancos/importar')

buscarBancos()
</script>