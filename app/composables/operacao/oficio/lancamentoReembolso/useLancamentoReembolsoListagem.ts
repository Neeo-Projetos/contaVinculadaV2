import { ref, reactive, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useLancamentoReembolsoListagem() {
  const router = useRouter()
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  const { width } = useWindowSize()

  // Modais de Detalhes e Funcionários (específicos desta tela)
  const modalDetalhesAberto = ref(false)
  const detalhes = ref({ motivo: '', usuarioCadastro: '', dataCadastro: '' })
  const modalFuncionarioAberto = ref(false)
  const listaFuncionariosModal = ref<any[]>([])

  // Modal de Exibição (Padrão Ouro)
  const modalExibicaoAberto = ref(false)

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Filtrar por projeto...'
    return 'Filtrar por projeto ou tipo de movimentação...'
  })

  const filtro = ref({
    projetoId: '',
    tipoMovimentacao: '',
    dataInicioParam: '',
    dataFimParam: '',
    ativoParam: '1'
  })

  // Autocomplete Projetos
  const projetoSearch = ref('')
  const sugestoesProjetos = ref<any[]>([])
  const buscandoProjetos = ref(false)
  const mostrarMenuProjetos = ref(false)

  const buscarProjetos = async () => {
    if (!projetoSearch.value) {
      sugestoesProjetos.value = []
      return
    }
    buscandoProjetos.value = true
    mostrarMenuProjetos.value = true
    try {
      const resp = await $fetch<any[]>('/api/cadastro/projeto/autocomplete', {
        params: { busca: projetoSearch.value }
      })
      sugestoesProjetos.value = resp
    } catch (error) {
      console.error('Erro ao buscar projetos', error)
    } finally {
      buscandoProjetos.value = false
    }
  }

  const selecionarProjeto = (proj: any) => {
    filtro.value.projetoId = String(proj.projetoId)
    projetoSearch.value = proj.apelido
    mostrarMenuProjetos.value = false
  }

  // Combos
  const projetos = ref<any[]>([])
  const tiposMovimentacao = ref<any[]>([])

  // Colunas para exibição dinâmica
  const colunasVisiveis = reactive({
    projeto: true,
    contaVinculada: true,
    tipoMov: true,
    dataMov: true,
    vlrMov: true,
    dataOficio: true,
    vlrOficio: true,
    dataResposta: true,
    dataEntrada: true,
    status: true,
    acoes: true
  })

  const labelsColunas = {
    projeto: 'Projeto',
    contaVinculada: 'Conta Vinculada',
    tipoMov: 'Tipo Mov.',
    dataMov: 'Data Mov.',
    vlrMov: 'Vlr Mov.',
    dataOficio: 'Data Ofício',
    vlrOficio: 'Vlr Ofício',
    dataResposta: 'Data Resposta',
    dataEntrada: 'Data Entrada',
    status: 'Status',
    acoes: 'Ações'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const carregarCombos = async () => {
    try {
      const [resProj, resTipo] = await Promise.all([
        $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos'),
        $fetch<any[]>('/api/tabelaBasica/tipoMovimentacao/recupera')
      ])
      projetos.value = resProj.data || []
      tiposMovimentacao.value = resTipo || []
    } catch (error) {
      console.error("Erro ao carregar combos", error)
    }
  }

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<{ data: any[] }>('/api/operacao/oficio/lancamentoReembolso/listagem', {
        method: 'POST',
        body: {
          projeto: filtro.value.projetoId,
          tipoMovimentacao: filtro.value.tipoMovimentacao,
          dataInicio: filtro.value.dataInicioParam,
          dataFim: filtro.value.dataFimParam,
          status: filtro.value.ativoParam
        }
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro na listagem', error)
      listaCompleta.value = []
    } finally {
      carregandoTela.value = false
    }
  }

  const filtrar = () => {
    buscarLista()
  }

  const limparFiltros = () => {
    filtro.value = {
      projetoId: '',
      tipoMovimentacao: '',
      dataInicioParam: '',
      dataFimParam: '',
      ativoParam: '1'
    }
    projetoSearch.value = ''
  }

  const abrirModalDetalhes = async (codigo: number) => {
    try {
      const response = await $fetch<{ status: string, data: any }>('/api/operacao/oficio/lancamentoReembolso/detalhes', {
        method: 'POST',
        body: { codigo: codigo }
      })
      if (response.status === 'success') {
        detalhes.value = response.data
        modalDetalhesAberto.value = true
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes", error)
    }
  }

  const abrirModalFuncionarios = async (codigo: number, projetoId: number) => {
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/oficio/lancamentoReembolso/funcionarios', {
        method: 'POST',
        body: { codigo: codigo, projeto: projetoId }
      })
      listaFuncionariosModal.value = response.data || []
      modalFuncionarioAberto.value = true
    } catch (error) {
      console.error("Erro ao buscar funcionários", error)
    }
  }

  const gerarPdfOficio = (codigo: number) => {
    window.open(`/api/configuracao/parametros/oficio/pdf?codigo=${codigo}`, '_blank')
  }

  const novoRegistro = () => router.push('/operacao/oficio/lancamentoReembolso/cadastro?codigo=0')

  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunasVisiveis)
    modalExibicaoAberto.value = true
  }

  const aplicarExibicao = () => {
    Object.assign(colunasVisiveis, colunasTemp)
    modalExibicaoAberto.value = false
  }

  onMounted(() => {
    carregarCombos()
  })

  return {
    carregando: carregandoTela,
    buscaRealizada,
    visaoAtual,
    filtro,
    projetos,
    tiposMovimentacao,
    buscarLista,
    filtrar,
    novoRegistro,

    // Modais específicos
    modalDetalhesAberto,
    detalhes,
    abrirModalDetalhes,
    modalFuncionarioAberto,
    listaFuncionariosModal,
    abrirModalFuncionarios,
    gerarPdfOficio,

    // Exibição e Colunas
    modalExibicaoAberto,
    abrirModalExibicao,
    aplicarExibicao,
    colunas: colunasVisiveis,
    labels: labelsColunas,
    colunasTemp,
    placeholderDinamico,

    // Autocomplete Projetos
    projetoSearch,
    sugestoesProjetos,
    buscandoProjetos,
    mostrarMenuProjetos,
    buscarProjetos,
    selecionarProjeto,
    limparFiltros,

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
