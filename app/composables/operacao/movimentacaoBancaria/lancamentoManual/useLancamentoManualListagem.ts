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

  const filtro = reactive({
    nomeParam: '', // Termo de busca principal (Autocomplete)
    projetoParam: '',
    tipoMovimentacaoParam: '',
    dataMovimentacaoParam: '',
    ativoParam: '1'
  })

  const colunasVisiveis = reactive({
    valor: true,
    projeto: true,
    conta: true,
    tipo: true,
    classificacao: true,
    data: true,
    funcionarios: true,
    detalhes: true
  })

  const labelsColunas = {
    valor: 'Valor da Movimentação',
    projeto: 'Projeto',
    conta: 'Conta Vinculada',
    tipo: 'Tipo da Movimentação',
    classificacao: 'Classificação',
    data: 'Data Movimentação',
    funcionarios: 'Vínculo Func.',
    detalhes: 'Detalhes'
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

  const buscarSugestoes = () => {
    const texto = filtro.nomeParam
    if (texto.length < 2) {
      sugestoesBusca.value = []
      mostrandoSugestoes.value = false
      return
    }

    clearTimeout(timerDebounce)
    timerDebounce = setTimeout(async () => {
      buscandoSugestoes.value = true
      mostrandoSugestoes.value = true
      // Aqui poderíamos ter um endpoint de autocomplete específico, 
      // mas por enquanto vamos simular ou usar parte da busca.
      try {
        // Simulação rápida ou buscar da lista local se já carregada
        sugestoesBusca.value = listaCompleta.value
          .filter(i => i.projeto.toLowerCase().includes(texto.toLowerCase()) || i.tipoMovimentacao.toLowerCase().includes(texto.toLowerCase()))
          .slice(0, 5)
          .map(i => ({ codigo: i.codigo, descricao: `${i.projeto} - ${i.tipoMovimentacao}` }))
      } finally {
        buscandoSugestoes.value = false
      }
    }, 300)
  }

  const selecionarSugestao = (sugestao: any) => {
    filtro.nomeParam = sugestao.descricao
    mostrandoSugestoes.value = false
    buscarLista()
  }

  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrandoSugestoes.value = false
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
          projeto: filtro.projetoParam,
          tipoMovimentacao: filtro.tipoMovimentacaoParam,
          dataMovimentacao: filtro.dataMovimentacaoParam,
          termo: filtro.nomeParam
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
    filtro.projetoParam = ''
    filtro.tipoMovimentacaoParam = ''
    filtro.dataMovimentacaoParam = ''
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
    placeholderDinamico,
    sugestoesBusca,
    buscandoSugestoes,
    mostrandoSugestoes,
    buscarSugestoes,
    selecionarSugestao,
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
