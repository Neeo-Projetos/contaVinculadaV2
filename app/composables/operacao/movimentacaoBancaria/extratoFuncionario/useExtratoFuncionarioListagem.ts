import { ref, reactive, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useExtratoFuncionarioListagem() {
  const { width } = useWindowSize()
  
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)
  
  const sugestoesNome = ref<string[]>([])
  const buscandoSugestoes = ref(false)
  const mostrandoSugestoes = ref(false)

  const projetosAtivos = ref<any[]>([])
  const funcionariosAtivos = ref<any[]>([])

  const filtro = reactive({
    nomeParam: '', // Termo de busca principal (Autocomplete)
    projetoParam: '',
    funcionarioParam: '',
    dataInicioParam: '',
    dataFimParam: ''
  })

  const colunasVisiveis = reactive({
    funcionario: true,
    cpf: true,
    projeto: true,
    saldo: true,
    acoes: true
  })

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  
  // Lógica do Modal de Extrato
  const modalExtratoAberto = ref(false)
  const funcionarioSelecionado = ref<number | undefined>(undefined)

  // Paginação Front-End
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Buscar funcionário...'
    return 'Digite o nome ou CPF...'
  })

  const projetosFormatados = computed(() => {
    return projetosAtivos.value.map(p => ({
      codigo: p.codigo || p.id,
      descricao: p.descricao ? `${p.apelido} - ${p.descricao}` : p.apelido
    }))
  })

  const labelsColunas = {
    funcionario: 'Funcionário',
    cpf: 'CPF',
    projeto: 'Projeto',
    saldo: 'Saldo Atual',
    acoes: 'Extrato'
  }

  const carregarCombos = async () => {
    try {
      // Carrega projetos de forma resiliente
      const resProj = await $fetch<any>('/api/cadastro/projeto/ativos').catch(() => [])
      projetosAtivos.value = resProj?.data || resProj || []
      
      // Carrega funcionários (se necessário para autocomplete futuro)
      const resFunc = await $fetch<any>('/api/cadastro/funcionario/ativos').catch(() => [])
      funcionariosAtivos.value = resFunc?.data || resFunc || []
    } catch (error) {
       console.error("Erro combos extrato funcionario", error)
    }
  }

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/extratoFuncionario/listagem', {
        method: 'POST', 
        body: {
          projeto: filtro.projetoParam,
          funcionarioId: filtro.funcionarioParam,
          dataInicio: filtro.dataInicioParam,
          dataFim: filtro.dataFimParam,
          termo: filtro.nomeParam
        }
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro listagem extrato funcionario', error)
    } finally {
      carregandoTela.value = false
    }
  }

  const abrirModalFiltroAvancado = () => { modalFiltroAvancadoAberto.value = true }
  const aplicarFiltroAvancado = () => { modalFiltroAvancadoAberto.value = false; buscarLista() }
  const limparFiltrosAvancados = () => {
    filtro.projetoParam = ''
    filtro.funcionarioParam = ''
    filtro.dataInicioParam = ''
    filtro.dataFimParam = ''
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

  const buscarSugestoesNome = () => {
    if (filtro.nomeParam.length < 2) {
      sugestoesNome.value = []
      mostrandoSugestoes.value = false
      return
    }

    const termo = filtro.nomeParam.toLowerCase()
    sugestoesNome.value = funcionariosAtivos.value
      .filter(f => f.nomeCompleto.toLowerCase().includes(termo))
      .map(f => f.nomeCompleto)
    
    mostrandoSugestoes.value = sugestoesNome.value.length > 0
  }
  const selecionarSugestao = (val: string) => { 
    filtro.nomeParam = val
    mostrandoSugestoes.value = false
    buscarLista() 
  }
  const fecharSugestoesDelay = () => { setTimeout(() => { mostrandoSugestoes.value = false }, 200) }

  const abrirModalExtrato = (id: number) => {
    funcionarioSelecionado.value = id
    modalExtratoAberto.value = true
  }

  const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  onMounted(() => {
    carregarCombos()
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
    projetosFormatados,
    
    sugestoesNome,
    buscandoSugestoes,
    mostrandoSugestoes,
    buscarSugestoesNome,
    selecionarSugestao,
    fecharSugestoesDelay,
    
    // Extrato
    modalExtratoAberto,
    funcionarioSelecionado,
    abrirModalExtrato,
    
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
