import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useLancamentoEstornoListagem() {
  const { width } = useWindowSize()

  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Buscar estorno...'
    return 'Digite o projeto ou tipo de movimentação...'
  })

  // Filtros padrão segundo Padrão Ouro
  const filtro = ref({
    nomeParam: '', // Termo de busca principal
    projetoParam: '', // ID do Projeto (Interno)
    projetoNomeParam: '', // Texto do Autocomplete (Exibição)
    funcionarioParam: '',
    tipoLancamentoParam: '',
    dataInicioParam: '',
    dataFimParam: '',
    estornadoParam: '0'
  })

  const filtroGlobal = ref('')

  // Autocomplete Projetos (Padrão Ouro - Baseado em Cadastro/Projeto)
  const sugestoesProjetos = ref<any[]>([])
  const mostrandoSugestoes = ref(false)
  const buscandoSugestoes = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestoesProjeto = (termo: string) => {
    // Limpa o projeto ID (interno) ao começar a digitar uma nova busca
    filtro.value.projetoParam = ''

    if (!termo || termo.length < 2) {
      sugestoesProjetos.value = []
      mostrandoSugestoes.value = false
      return
    }

    clearTimeout(timerDebounce)
    mostrandoSugestoes.value = true

    timerDebounce = setTimeout(async () => {
      buscandoSugestoes.value = true
      try {
        const resposta = await $fetch<any>(`/api/cadastro/projeto/autocomplete?q=${termo}`)
        sugestoesProjetos.value = resposta?.data || resposta || []
      } catch (e) {
        console.error('Erro no autocomplete de projeto:', e)
      } finally {
        buscandoSugestoes.value = false
      }
    }, 400)
  }

  const selecionarProjetoAutocomplete = (sugestao: any) => {
    // Seta o ID para o filtro de busca e o nome para exibição no campo
    filtro.value.projetoParam = String(sugestao.projetoId || sugestao.id)
    filtro.value.projetoNomeParam = sugestao.apelido || sugestao.descricao
    mostrandoSugestoes.value = false
    buscarLista()
  }

  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrandoSugestoes.value = false
    }, 200)
  }

  const colunasVisiveis = reactive({
    projeto: true,
    conta: true,
    tipoLancamento: true,
    tipoMovimentacao: true,
    valor: true,
    data: true,
    classificacao: true,
    funcionarios: true,
    acoes: true
  })

  const labelsColunas = {
    projeto: 'Projeto',
    conta: 'Conta Vinculada',
    tipoLancamento: 'Origem',
    tipoMovimentacao: 'Movimentação',
    valor: 'Valor',
    data: 'Data',
    classificacao: 'Classificação',
    funcionarios: 'Funcionários',
    acoes: 'Ações'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  const listaFiltrada = computed(() => {
    if (!filtroGlobal.value) return listaCompleta.value
    const term = filtroGlobal.value.toLowerCase()
    return listaCompleta.value.filter(item =>
      String(item.projeto).toLowerCase().includes(term) ||
      String(item.apelido).toLowerCase().includes(term) ||
      String(item.classificacao).toLowerCase().includes(term) ||
      String(item.tipoMovimentacao).toLowerCase().includes(term)
    )
  })
  const paginacao = usePaginacaoFrontEnd(listaFiltrada, visaoAtual)

  const projetosAtivos = ref<any[]>([])
  const funcionariosAtivos = ref<any[]>([])

  const carregarCombos = async () => {
    try {
      const [resProj, resFunc] = await Promise.all([
        $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos'),
        $fetch<{ data: any[] }>('/api/cadastro/funcionario/ativos')
      ])
      projetosAtivos.value = resProj.data || []
      funcionariosAtivos.value = resFunc.data || []
    } catch (error) {
      console.error("Erro combos", error)
    }
  }

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/listagem', {
        method: 'POST',
        body: {
          projeto: filtro.value.projetoParam,
          funcionarioId: filtro.value.funcionarioParam,
          tipoLancamento: filtro.value.tipoLancamentoParam,
          dataInicio: filtro.value.dataInicioParam,
          dataFim: filtro.value.dataFimParam,
          estornado: filtro.value.estornadoParam
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
    filtro.value.projetoParam = ''
    filtro.value.projetoNomeParam = ''
    filtro.value.funcionarioParam = ''
    filtro.value.tipoLancamentoParam = ''
    filtro.value.estornadoParam = '0'
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

  const modalDetalhesAberto = ref(false)
  const detalhes = ref({ motivo: '', usuarioCadastro: '', dataCadastro: '' })

  const modalFuncionarioAberto = ref(false)
  const listaFuncionariosModal = ref<any[]>([])

  const abrirModalDetalhes = async (codigo: number, tipo: number) => {
    try {
      const response = await $fetch<{ status: string, data: any }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/detalhes', {
        method: 'POST', body: { codigo, tipoLancamento: tipo }
      })
      detalhes.value = response.data
      modalDetalhesAberto.value = true
    } catch (error) { console.error(error) }
  }

  const abrirModalFuncionarios = async (codigo: number, tipo: number, projetoId: number) => {
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/funcionarios', {
        method: 'POST', body: { codigo, tipoLancamento: tipo, projeto: projetoId }
      })
      listaFuncionariosModal.value = response.data || []
      modalFuncionarioAberto.value = true
    } catch (error) { console.error(error) }
  }

  const modalEstornoAberto = ref(false)
  const modalPinAberto = ref(false)
  const mostrarPin = ref(false)
  const processandoEstorno = ref(false)
  const dataEstornoDisplay = ref('')
  let timerRelogio: any = null

  const estornoObj = reactive({
    codigo: 0,
    tipoLancamento: 0,
    motivo: '',
    pin: ''
  })

  const atualizarRelogio = () => {
    const agora = new Date()
    dataEstornoDisplay.value = `${agora.toLocaleDateString('pt-BR')} - ${agora.toLocaleTimeString('pt-BR')}`
  }

  const prepararEstorno = (item: any) => {
    estornoObj.codigo = item.codigo
    estornoObj.tipoLancamento = item.tipoLancamento
    estornoObj.motivo = ''
    estornoObj.pin = ''
    mostrarPin.value = false

    atualizarRelogio()
    timerRelogio = setInterval(atualizarRelogio, 1000)
    modalEstornoAberto.value = true
  }

  const avancarParaPin = () => {
    if (!estornoObj.motivo.trim()) return 'motivo_obrigatorio'
    modalEstornoAberto.value = false
    modalPinAberto.value = true
    return 'ok'
  }

  const finalizarEstorno = async () => {
    if (!estornoObj.pin) return 'pin_obrigatorio'

    processandoEstorno.value = true
    try {
      // 1. Valida PIN
      const resPin = await $fetch<{ status: string }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/validaPin', {
        method: 'POST', body: { pin: estornoObj.pin }
      })

      if (resPin.status !== 'success') {
        estornoObj.pin = ''
        return 'pin_incorreto'
      }

      // 2. Grava Estorno
      const resGravar = await $fetch<{ status: string, mensagem: string }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/gravar', {
        method: 'POST', body: estornoObj
      })

      if (resGravar.status === 'success') {
        modalPinAberto.value = false
        buscarLista()
        return 'sucesso'
      } else {
        return resGravar.mensagem
      }
    } catch (error) {
      console.error('Erro ao estornar', error)
      return 'erro_interno'
    } finally {
      processandoEstorno.value = false
    }
  }

  const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  onMounted(() => {
    carregarCombos()
  })

  onUnmounted(() => {
    if (timerRelogio) clearInterval(timerRelogio)
  })

  return {
    carregando: carregandoTela,
    buscaRealizada,
    visaoAtual,
    filtro,
    filtroGlobal,
    sugestoesProjetos,
    buscandoSugestoes,
    mostrandoSugestoes,
    buscarSugestoesProjeto,
    selecionarProjetoAutocomplete,
    fecharSugestoesDelay,
    placeholderDinamico,
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
    funcionariosAtivos,

    // Modais específicos
    modalDetalhesAberto,
    detalhes,
    abrirModalDetalhes,
    modalFuncionarioAberto,
    listaFuncionariosModal,
    abrirModalFuncionarios,

    modalEstornoAberto,
    modalPinAberto,
    mostrarPin,
    processandoEstorno,
    dataEstornoDisplay,
    estornoObj,
    prepararEstorno,
    avancarParaPin,
    finalizarEstorno,

    formatarMoeda,

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
