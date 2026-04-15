import { ref, reactive, computed, onMounted } from 'vue'
import { usePaginacaoFrontEnd } from '../../../global/usePaginacaoFrontEnd'

export function useParametrosOficioListagem() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = ref({
    projetoNome: '',
    projetoId: '' as string | number,
    comSaldo: ''
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  // Controle de colunas e Exibição
  const colunasVisiveis = reactive({
    projeto: true,
    comSaldo: true,
    historico: true
  })
  const colunasTemp = reactive({ ...colunasVisiveis })
  const labelsColunas = {
    projeto: 'Nome do Projeto',
    comSaldo: 'Contém Saldo',
    historico: 'Histórico de Alterações'
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
    filtro.value = { projetoNome: '', projetoId: '', comSaldo: '' }
    buscarLista()
  }
  const aplicarFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = false
    buscarLista()
  }

  // Autocomplete de Projeto
  const sugestoesProjeto = ref<any[]>([])
  const buscandoProjeto = ref(false)
  const mostrarMenuProjeto = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestaoProjeto = async () => {
    const termo = filtro.value.projetoNome
    
    // Limpa o projetoId ao começar a digitar uma nova busca
    filtro.value.projetoId = ''

    if (!termo || termo.length < 3) {
      sugestoesProjeto.value = []
      mostrarMenuProjeto.value = false
      return
    }

    clearTimeout(timerDebounce)
    mostrarMenuProjeto.value = true

    timerDebounce = setTimeout(async () => {
      buscandoProjeto.value = true
      try {
        const resp = await $fetch<any>('/api/cadastro/projeto/autocomplete', {
          query: { q: termo }
        })
        sugestoesProjeto.value = resp.data || []
      } catch (err) {
        console.error('Erro no autocomplete', err)
      } finally {
        buscandoProjeto.value = false
      }
    }, 400)
  }

  const selecionarSugestaoProjeto = (data: { key: string, sugestao: any }) => {
    filtro.value.projetoNome = data.sugestao.apelido || data.sugestao.descricao
    filtro.value.projetoId = data.sugestao.id
    mostrarMenuProjeto.value = false
    buscarLista()
  }

  const buscarLista = async () => {
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/configuracao/parametros/oficio/listagem', {
        method: 'POST', body: filtro.value
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar ofícios', error)
    } finally {
      carregando.value = false
    }
  }

  // Histórico
  const modalHistoricoAberto = ref(false)
  const carregandoHistorico = ref(false)
  const historicoData = ref<any[]>([])
  const abrirHistorico = async (codigo: number) => {
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    try {
      const response = await $fetch<any>('/api/configuracao/parametros/oficio/historico', {
        method: 'POST', body: { codigo }
      })
      historicoData.value = response.data || []
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    } finally {
      carregandoHistorico.value = false
    }
  }

  return {
    carregando,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarLista,
    
    // Filtros e Exibição
    modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
    modalExibicaoAberto, abrirModalExibicao, aplicarExibicao,
    colunas: colunasVisiveis, colunasTemp, labels: labelsColunas,
    
    // Histórico
    modalHistoricoAberto,
    carregandoHistorico,
    historicoData,
    abrirHistorico,

    // Autocomplete Projeto
    sugestoesProjeto,
    buscandoProjeto,
    mostrarMenuProjeto,
    buscarSugestaoProjeto,
    selecionarSugestaoProjeto,
    fecharSugestaoProjeto: () => mostrarMenuProjeto.value = false,

    // Paginação e Filtro Global
    filtroGlobal: paginacao.filtroGlobal,
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
