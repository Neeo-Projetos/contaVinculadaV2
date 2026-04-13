import { ref, reactive, computed, onMounted } from 'vue'

export function useLancamentoListagem() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = ref({
    descricao: '',
    ativo: '1'
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  // Autocomplete
  const buscandoLancamentoSugestao = ref(false)
  const sugestoesLancamento = ref<any[]>([])
  const mostrarMenuLancamento = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestoesLancamento = () => {
    const texto = filtro.value.descricao

    if (texto.length < 2) {
      sugestoesLancamento.value = []
      mostrarMenuLancamento.value = false
      return
    }

    clearTimeout(timerDebounce)

    timerDebounce = setTimeout(async () => {
      buscandoLancamentoSugestao.value = true
      mostrarMenuLancamento.value = true
      try {
        const resp = await $fetch<any>(`/api/tabelaBasica/lancamento/autocomplete?q=${texto}`)
        sugestoesLancamento.value = resp.data || []
      } catch (error) {
        console.error('Erro ao buscar sugestões', error)
      } finally {
        buscandoLancamentoSugestao.value = false
      }
    }, 400)
  }

  const selecionarSugestaoLancamento = (sugestao: any) => {
    filtro.value.descricao = sugestao.descricao
    mostrarMenuLancamento.value = false
    buscarLista()
  }

  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrarMenuLancamento.value = false
    }, 200)
  }

  // Controle de colunas e Exibição
  const colunasVisiveis = reactive({
    descricao: true,
    status: true,
    historico: true
  })
  const colunasTemp = reactive({ ...colunasVisiveis })
  const labelsColunas = {
    descricao: 'Tipo de Lançamento',
    status: 'Status',
    historico: 'Histórico'
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

  // Filtros Avançados
  const modalFiltroAvancadoAberto = ref(false)
  const abrirModalFiltroAvancado = () => modalFiltroAvancadoAberto.value = true
  const limparFiltrosAvancados = () => {
    filtro.value = { descricao: '', ativo: '1' }
    buscarLista()
  }
  const aplicarFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = false
    buscarLista()
  }

  const buscarLista = async () => {
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/tabelaBasica/lancamento/listagem', {
        method: 'POST', body: filtro.value
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar lançamentos', error)
    } finally {
      carregando.value = false
    }
  }

  // Histórico
  const modalHistoricoAberto = ref(false)
  const carregandoHistorico = ref(false)
  const historicoData = ref<any[]>([])
  const abrirHistorico = async (id: number) => {
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    try {
      const response = await $fetch<any>('/api/tabelaBasica/lancamento/historico', {
        method: 'POST', body: { codigo: id }
      })
      
      historicoData.value = response.data || []
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    } finally {
      carregandoHistorico.value = false
    }
  }

  const gerarExcel = () => {
    alert('📊 Gerando relatório Excel de Lançamentos...')
  }

  return {
    carregando,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarLista,
    
    // Filtros e Exibição
    modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
    modalExibicaoAberto, abrirModalExibicao,
    aplicarExibicao,
    colunas: colunasVisiveis, colunasTemp, labels: labelsColunas,
    
    // Autocomplete
    buscandoLancamentoSugestao, sugestoesLancamento, mostrarMenuLancamento, buscarSugestoesLancamento,
    selecionarSugestaoLancamento, fecharSugestoesDelay,

    // Histórico
    modalHistoricoAberto,
    carregandoHistorico,
    historicoData,
    abrirHistorico,

    // Outros
    gerarExcel,
    filtroGlobal: paginacao.filtroGlobal,

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
