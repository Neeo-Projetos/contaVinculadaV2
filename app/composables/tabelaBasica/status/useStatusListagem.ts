import { ref, reactive, computed, onMounted } from 'vue'

export function useStatusListagem() {
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
  const buscandoStatusSugestao = ref(false)
  const sugestoesStatus = ref<any[]>([])
  const mostrarMenuStatus = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestoesStatus = () => {
    const texto = filtro.value.descricao

    if (texto.length < 2) {
      sugestoesStatus.value = []
      mostrarMenuStatus.value = false
      return
    }

    clearTimeout(timerDebounce)

    timerDebounce = setTimeout(async () => {
      buscandoStatusSugestao.value = true
      mostrarMenuStatus.value = true
      try {
        const resp = await $fetch<any>(`/api/tabelaBasica/status/autocomplete?q=${texto}`)
        sugestoesStatus.value = resp.data || []
      } catch (error) {
        console.error('Erro ao buscar sugestões', error)
      } finally {
        buscandoStatusSugestao.value = false
      }
    }, 400)
  }

  const selecionarSugestaoStatus = (sugestao: any) => {
    filtro.value.descricao = sugestao.descricao
    mostrarMenuStatus.value = false
    buscarLista()
  }

  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrarMenuStatus.value = false
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
    descricao: 'Descrição do Status',
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
      const response = await $fetch<any>('/api/tabelaBasica/status/listagem', {
        method: 'POST', body: filtro.value
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar status', error)
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
      const response = await $fetch<any>('/api/tabelaBasica/status/historico', {
        method: 'POST', body: { status: id }
      })
      
      historicoData.value = response.data || []
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    } finally {
      carregandoHistorico.value = false
    }
  }

  const gerarExcel = () => {
    alert('📊 Gerando relatório Excel de Status...')
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
    buscandoStatusSugestao, sugestoesStatus, mostrarMenuStatus, buscarSugestoesStatus,
    selecionarSugestaoStatus, fecharSugestoesDelay,

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
