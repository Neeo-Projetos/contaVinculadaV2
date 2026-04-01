import { ref, reactive, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useExtratoProjetoListagem() {
  const { width } = useWindowSize()
  
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)
  
  const projetosAtivos = ref<any[]>([])
  const contasAtivas = ref<any[]>([])
  
  const sugestoesNome = ref<string[]>([])
  const buscandoSugestoes = ref(false)
  const mostrandoSugestoes = ref(false)

  const listaCompleta = ref<any[]>([])

  const filtro = reactive({
    nomeParam: '', // Autocomplete de projeto
    projetoParam: '',
    contaVinculadaParam: '',
    dataInicioParam: '',
    dataFimParam: ''
  })

  const colunasVisiveis = reactive({
    projeto: true,
    conta: true,
    saldo: true,
    ultMov: true,
    acoes: true
  })

  const colunasTemp = reactive({ ...colunasVisiveis })

  // Lógica do Modal de Extrato
  const modalExtratoAberto = ref(false)
  const projetoSelecionado = ref<number | undefined>(undefined)

  // Paginação Front-End
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Buscar projeto...'
    return 'Digite o projeto ou apelido...'
  })

  const projetosFormatados = computed(() => {
    return projetosAtivos.value.map(p => ({
      codigo: p.codigo || p.id,
      descricao: p.descricao ? `${p.apelido} - ${p.descricao}` : p.apelido
    }))
  })

  const labelsColunas = {
    projeto: 'Projeto',
    conta: 'Conta Vinculada',
    saldo: 'Saldo Atual',
    ultMov: 'Última Mov.',
    acoes: 'Ações'
  }

  const carregarCombos = async () => {
    try {
      const resProj = await $fetch<any>('/api/cadastro/projeto/ativos').catch(() => [])
      projetosAtivos.value = resProj?.data || resProj || []
      
      const resContas = await $fetch<any>('/api/tabelaBasica/bancos/ativos').catch(() => [])
      contasAtivas.value = resContas?.data || resContas || []
    } catch (error) {
       console.error("Erro combos extrato projeto", error)
    }
  }

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/extratoProjeto/listagem', {
        method: 'POST', 
        body: {
          projeto: filtro.projetoParam,
          contaVinculada: filtro.contaVinculadaParam,
          dataInicio: filtro.dataInicioParam,
          dataFim: filtro.dataFimParam,
          termo: filtro.nomeParam
        }
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro listagem extrato projeto', error)
    } finally {
      carregandoTela.value = false
    }
  }

  const abrirModalFiltroAvancado = () => { modalFiltroAvancadoAberto.value = true }
  const aplicarFiltroAvancado = () => { modalFiltroAvancadoAberto.value = false; buscarLista() }
  const limparFiltrosAvancados = () => {
    filtro.projetoParam = ''
    filtro.contaVinculadaParam = ''
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
    sugestoesNome.value = projetosAtivos.value
      .filter(p => 
        (p.apelido && p.apelido.toLowerCase().includes(termo)) || 
        (p.descricao && p.descricao.toLowerCase().includes(termo))
      )
      .map(p => p.descricao ? `${p.apelido} - ${p.descricao}` : p.apelido)
    
    mostrandoSugestoes.value = sugestoesNome.value.length > 0
  }
  const selecionarSugestao = (val: string) => { 
    filtro.nomeParam = val
    mostrandoSugestoes.value = false
    buscarLista() 
  }
  const fecharSugestoesDelay = () => { setTimeout(() => { mostrandoSugestoes.value = false }, 200) }

  // Lógica do Modal de Extrato
  const abrirModalExtrato = (id: number) => {
    projetoSelecionado.value = id
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
    contasAtivas,
    projetosFormatados,

    sugestoesNome,
    buscandoSugestoes,
    mostrandoSugestoes,
    buscarSugestoesNome,
    selecionarSugestao,
    fecharSugestoesDelay,
    
    // Extrato
    modalExtratoAberto,
    projetoSelecionado,
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
