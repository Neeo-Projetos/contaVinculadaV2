import { ref, reactive, computed, onMounted } from 'vue'

export function useBancosListagem() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = ref({
    nomeBanco: '',
    codigoBanco: '',
    ativo: '1'
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  // Autocomplete
  const buscandoBancosSugestao = ref(false)
  const sugestoesBancos = ref<any[]>([])
  const mostrarMenuBancos = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestoesBancos = () => {
    const texto = filtro.value.nomeBanco

    if (texto.length < 2) {
      sugestoesBancos.value = []
      mostrarMenuBancos.value = false
      return
    }

    clearTimeout(timerDebounce)

    timerDebounce = setTimeout(async () => {
      buscandoBancosSugestao.value = true
      mostrarMenuBancos.value = true
      try {
        const resp = await $fetch<any>(`/api/tabelaBasica/bancos/autocomplete?q=${texto}`)
        sugestoesBancos.value = resp.data || []
      } catch (error) {
        console.error('Erro ao buscar sugestões', error)
      } finally {
        buscandoBancosSugestao.value = false
      }
    }, 400)
  }

  const selecionarSugestaoBancos = (sugestao: any) => {
    filtro.value.nomeBanco = sugestao.descricao
    mostrarMenuBancos.value = false
    buscarLista()
  }

  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrarMenuBancos.value = false
    }, 200)
  }

  // Controle de colunas e Exibição
  const colunasVisiveis = reactive({
    codigoBanco: true,
    descricao: true,
    status: true,
    historico: true
  })
  const colunasTemp = reactive({ ...colunasVisiveis })
  const labelsColunas = {
    codigoBanco: 'Código',
    descricao: 'Banco',
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
    filtro.value = { nomeBanco: '', codigoBanco: '', ativo: '1' }
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
      const response = await $fetch<any>('/api/tabelaBasica/bancos/listagem', {
        method: 'POST', body: filtro.value
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar bancos', error)
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
      const response = await $fetch<any>('/api/tabelaBasica/bancos/historico', {
        method: 'POST', body: { banco: id }
      })
      
      historicoData.value = response.data || []
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    } finally {
      carregandoHistorico.value = false
    }
  }

  const gerarExcel = () => {
    alert('📊 Gerando relatório Excel de Bancos...')
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
    buscandoBancosSugestao, sugestoesBancos, mostrarMenuBancos, buscarSugestoesBancos,
    selecionarSugestaoBancos, fecharSugestoesDelay,

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
