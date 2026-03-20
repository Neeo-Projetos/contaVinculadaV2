import { ref, reactive, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useUsuarioListagem() {
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  const { width } = useWindowSize()

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Nome...'
    return 'Digite o nome do usuário...'
  })

  const filtro = reactive({
    login: '',
    nome: '',
    cpf: '',
    ativo: '1'
  })

  const colunasVisiveis = reactive({
    login: true,
    nome: true,
    cpf: true,
    status: true,
    acoes: true
  })

  const labelsColunas = {
    login: 'Login',
    nome: 'Nome Completo',
    cpf: 'CPF',
    status: 'Status',
    acoes: 'Ações'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const data = await $fetch<any>('/api/configuracao/usuario/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = data?.results || []
      paginacao.mudarPagina(1)
    } catch (err: any) {
      console.error(err)
    } finally {
      carregandoTela.value = false
    }
  }

  const filtrar = () => {
    buscarLista()
  }

  const modalExibicaoAberto = ref(false)
  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunasVisiveis)
    modalExibicaoAberto.value = true
  }

  const aplicarExibicao = () => {
    Object.assign(colunasVisiveis, colunasTemp)
    modalExibicaoAberto.value = false
  }

  onMounted(() => {
    // Regra de Busca Ativa (Zero Auto-Load): Não buscar automaticamente
  })

  return {
    carregando: carregandoTela,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarLista,
    filtrar,
    placeholderDinamico,
    
    // Exibição e Colunas
    modalExibicaoAberto,
    abrirModalExibicao,
    aplicarExibicao,
    colunas: colunasVisiveis,
    labels: labelsColunas,
    colunasTemp,

    // Paginação
    dados: paginacao.listaPaginada,
    paginaAtual: paginacao.paginaAtual,
    itensPorPagina: paginacao.itensPorPagina,
    totalRegistros: paginacao.totalRegistros,
    totalPaginas: paginacao.totalPaginas,
    registroInicial: paginacao.registroInicial,
    registroFinal: paginacao.registroFinal,
    paginasExibidas: paginacao.paginasExibidas,
    mudarPagina: paginacao.mudarPagina,
    mudarItensPorPagina: paginacao.mudarItensPorPagina
  }
}
