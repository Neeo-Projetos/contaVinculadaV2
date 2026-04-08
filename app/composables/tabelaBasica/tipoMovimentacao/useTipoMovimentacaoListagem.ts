import { ref, reactive, computed, onMounted } from 'vue'

export function useTipoMovimentacaoListagem() {
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
  const buscandoSugestao = ref(false)
  const sugestoes = ref<any[]>([])
  const mostrarMenuSugestao = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestao = () => {
    const texto = filtro.value.descricao

    if (texto.length < 2) {
      sugestoes.value = []
      mostrarMenuSugestao.value = false
      return
    }

    clearTimeout(timerDebounce)

    timerDebounce = setTimeout(async () => {
      buscandoSugestao.value = true
      mostrarMenuSugestao.value = true
      try {
        const resp = await $fetch<any>(`/api/tabelaBasica/tipoMovimentacao/autocomplete?q=${texto}`)
        sugestoes.value = resp.data || []
      } catch (error) {
        console.error('Erro ao buscar sugestões', error)
      } finally {
        buscandoSugestao.value = false
      }
    }, 400)
  }

  const selecionarSugestao = (sugestao: any) => {
    filtro.value.descricao = sugestao.descricao
    mostrarMenuSugestao.value = false
    buscarLista()
  }

  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrarMenuSugestao.value = false
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
    descricao: 'Tipo de Movimentação',
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
      const response = await $fetch<any>('/api/tabelaBasica/tipoMovimentacao/listagem', {
        method: 'POST', body: filtro.value
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar tipos de movimentação', error)
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
      const response = await $fetch<any>('/api/tabelaBasica/tipoMovimentacao/historico', {
        method: 'POST', body: { codigo: id }
      })
      
      historicoData.value = (response.data || []).map((item: any) => ({
        ...item,
        usuario: item.usuarioAlteracao,
        dataHora: item.dataAlteracao,
        alteracoes: (item.alteracoes || []).map((alt: any) => {
          if (typeof alt === 'string') return { mensagem: alt }
          return alt
        })
      }))
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    } finally {
      carregandoHistorico.value = false
    }
  }

  const gerarExcel = () => {
    alert('📊 Gerando relatório Excel de Movimentações...')
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
    buscandoSugestao, sugestoes, mostrarMenuSugestao, buscarSugestao,
    selecionarSugestao, fecharSugestoesDelay,

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
