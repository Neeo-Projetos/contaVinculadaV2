import { ref, reactive, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useLancamentoManualListagem() {
  const router = useRouter()
  const { width } = useWindowSize()
  
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  
  const modalHistoricoAberto = ref(false)
  const historicoSelecionado = ref<any[]>([])
  const carregandoHistorico = ref(false)
  
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Buscar lançamento...'
    return 'Digite o projeto ou tipo de movimentação...'
  })

  const filtro = ref({
    projetoId: '',
    tipoMovimentacaoParam: '',
    dataInicioParam: '',
    dataFimParam: '',
    ativoParam: '1'
  })

  // Autocomplete Projetos (Padrão Ouro)
  const projetoSearch = ref('')
  const sugestoesProjetos = ref<any[]>([])
  const buscandoProjetos = ref(false)
  const mostrarMenuProjetos = ref(false)

  const buscarProjetosAutocomplete = async () => {
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

  const selecionarProjetoAutocomplete = (proj: any) => {
    filtro.value.projetoId = String(proj.projetoId)
    projetoSearch.value = proj.apelido
    mostrarMenuProjetos.value = false
  }

  const colunasVisiveis = reactive({
    valor: true,
    projeto: true,
    conta: true,
    tipo: true,
    classificacao: true,
    data: true,
    funcionarios: true,
    detalhes: true,
    acoes: true
  })

  const labelsColunas = {
    valor: 'Valor da Movimentação',
    projeto: 'Projeto',
    conta: 'Conta Vinculada',
    tipo: 'Tipo da Movimentação',
    classificacao: 'Classificação',
    data: 'Data Movimentação',
    funcionarios: 'Vínculo Func.',
    detalhes: 'Detalhes',
    acoes: 'Ações'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  
  // Como o sistema parece usar uma paginação front-end padrão
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const projetosAtivos = ref<any[]>([])
  const tiposMovimentacao = ref<any[]>([])

  // Autocomplete
  const sugestoesBusca = ref<any[]>([])
  const mostrandoSugestoes = ref(false)
  const buscandoSugestoes = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>


  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrarMenuProjetos.value = false
    }, 200)
  }

  const carregarCombos = async () => {
    try {
      const [resProj, resTipo] = await Promise.all([
        $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos'),
        $fetch<any[]>('/api/tabelaBasica/tipoMovimentacao/recupera')
      ])
      projetosAtivos.value = resProj.data || []
      tiposMovimentacao.value = resTipo || []
    } catch (error) {
       console.error("Erro combos", error)
    }
  }

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/operacao/movimentacaoBancaria/lancamentoManual/listagem', {
        method: 'POST', 
        body: {
          projeto: filtro.value.projetoId,
          tipoMovimentacao: filtro.value.tipoMovimentacaoParam,
          dataInicio: filtro.value.dataInicioParam,
          dataFim: filtro.value.dataFimParam,
          status: filtro.value.ativoParam
        }
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro listagem', error)
    } finally {
      carregandoTela.value = false
    }
  }

  const abrirModalFiltroAvancado = () => { modalFiltroAvancadoAberto.value = true }
  const aplicarFiltroAvancado = () => { modalFiltroAvancadoAberto.value = false; buscarLista() }
  const limparFiltrosAvancados = () => {
    filtro.value = {
        projetoId: '',
        tipoMovimentacaoParam: '',
        dataInicioParam: '',
        dataFimParam: '',
        ativoParam: '1'
    }
    projetoSearch.value = ''
    modalFiltroAvancadoAberto.value = false
    buscarLista()
  }

  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunasVisiveis)
    modalExibicaoAberto.value = true
  }

  const aplicarExibicao = () => {
    Object.assign(colunasVisiveis, colunasTemp)
    modalExibicaoAberto.value = false
  }

  // Modais de Detalhes e Funcionários (mantidos da lógica anterior mas padronizados)
  const modalDetalhesAberto = ref(false)
  const detalhes = ref({ motivo: '', usuarioCadastro: '', dataCadastro: '' })

  const modalFuncionarioAberto = ref(false)
  const listaFuncionariosModal = ref<any[]>([])

  const abrirModalDetalhes = async (id: number) => {
    try {
      const response = await $fetch<{ status: string, data: any }>('/api/operacao/movimentacaoBancaria/lancamentoManual/detalhes', {
        method: 'POST', body: { lancamentoManual: id }
      })
      detalhes.value = response.data
      modalDetalhesAberto.value = true
    } catch (error) { console.error(error) }
  }

  const abrirModalFuncionarios = async (id: number) => {
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoManual/funcionarios', {
        method: 'POST', body: { lancamentoManual: id }
      })
      listaFuncionariosModal.value = response.data || []
      modalFuncionarioAberto.value = true
    } catch (error) { console.error(error) }
  }

  const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  const novoRegistro = () => router.push('/operacao/movimentacaoBancaria/lancamentoManual/cadastro?id=0')

  onMounted(() => {
    carregarCombos()
    // buscarLista() // Opcional carregar ao iniciar
  })

  return {
    carregando: carregandoTela,
    buscaRealizada,
    visaoAtual,
    filtro,
    // Autocomplete Projetos
    projetoSearch,
    sugestoesProjetos,
    buscandoProjetos,
    mostrarMenuProjetos,
    buscarProjetosAutocomplete,
    selecionarProjetoAutocomplete,
    fecharSugestoesDelay,
    buscarLista,
    abrirModalFiltroAvancado,
    modalFiltroAvancadoAberto,
    limparFiltrosAvancados,
    aplicarFiltroAvancado,
    abrirModalExibicao,
    modalExibicaoAberto,
    colunas: colunasVisiveis,
    labels: labelsColunas,
    colunasTemp,
    aplicarExibicao,
    projetosAtivos,
    tiposMovimentacao,
    
    // Antigos modais mantidos
    modalDetalhesAberto,
    detalhes,
    modalFuncionarioAberto,
    listaFuncionariosModal,
    abrirModalDetalhes,
    abrirModalFuncionarios,
    
    formatarMoeda,
    novoRegistro,

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
