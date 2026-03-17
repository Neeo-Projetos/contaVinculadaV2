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
  const filtro = reactive({
    nomeParam: '', // Termo de busca principal (Autocomplete opcional)
    projetoParam: '',
    funcionarioParam: '',
    tipoLancamentoParam: '',
    dataInicioParam: '',
    dataFimParam: '',
    estornadoParam: '0'
  })

  const colunasVisiveis = reactive({
    projeto: true,
    conta: true,
    tipoLancamento: true,
    tipoMovimentacao: true,
    valor: true,
    data: true,
    classificacao: true,
    funcionarios: true,
    estornar: true
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
    estornar: 'Estornar'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

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
    if (!filtro.dataInicioParam || !filtro.dataFimParam) {
      // Usando modal ou alerta padronizado no futuro, por enquanto o alert básico do componente
      return 'datas_obrigatorias'
    }

    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/listagem', {
        method: 'POST', 
        body: {
          projeto: filtro.projetoParam,
          funcionarioId: filtro.funcionarioParam,
          tipoLancamento: filtro.tipoLancamentoParam,
          dataInicio: filtro.dataInicioParam,
          dataFim: filtro.dataFimParam,
          estornado: filtro.estornadoParam
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
    filtro.funcionarioParam = ''
    filtro.tipoLancamentoParam = ''
    filtro.estornadoParam = '0'
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

  // Lógica de Modais Específicos
  const modalFuncionarioAberto = ref(false)
  const listaFuncionariosModal = ref<any[]>([])

  const abrirModalFuncionarios = async (codigo: number, tipo: number) => {
    try {
      const response = await $fetch<{ status: string, data: any[] } | any[]>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/funcionarios', {
        method: 'POST', body: { codigoLancamento: codigo, tipoLancamento: tipo }
      })
      // Ajuste para suportar os dois formatos (antes e depois da padronização da API)
      listaFuncionariosModal.value = Array.isArray(response) ? response : (response.data || [])
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
    codigoLancamento: 0,
    tipoLancamento: 0,
    motivo: '',
    pin: ''
  })

  const atualizarRelogio = () => {
    const agora = new Date()
    dataEstornoDisplay.value = `${agora.toLocaleDateString('pt-BR')} - ${agora.toLocaleTimeString('pt-BR')}`
  }

  const prepararEstorno = (item: any) => {
    estornoObj.codigoLancamento = item.codigo
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
