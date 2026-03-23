import { ref, reactive, computed, onMounted } from 'vue'

export function useContrachequeDetalhes() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = reactive({
    mesAno: '',
    projeto: '',
    funcionarioId: '',
    status: '' 
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const projetos = ref<any[]>([])
  const funcionarios = ref<any[]>([])
  const detalhesVerba = ref<any[]>([])
  const modalDetalhesAberto = ref(false)
  const modalFiltroAvancadoAberto = ref(false)

  // Estados para Autocomplete de Funcionário
  const nomeFuncionarioSearch = ref('')
  const sugestoesFuncionarios = ref<any[]>([])
  const buscandoFuncionarios = ref(false)
  const mostrarMenuFuncionarios = ref(false)

  const carregarCombos = async () => {
    try {
      const resProj = await $fetch<any>('/api/cadastro/projeto/ativos')
      projetos.value = (resProj.data || []).map((p: any) => ({
        ...p,
        nomeExibicao: `${p.apelido} - ${p.descricao}`
      }))
    } catch (e) {
      console.error('Erro ao carregar combos:', e)
    }
  }

  const buscarFuncionarios = async () => {
    const termo = nomeFuncionarioSearch.value
    if (!termo || termo.length < 3) {
        sugestoesFuncionarios.value = []
        mostrarMenuFuncionarios.value = false
        return
    }

    buscandoFuncionarios.value = true
    mostrarMenuFuncionarios.value = true
    try {
        const res = await $fetch<any>('/api/cadastro/funcionario/autocomplete', {
            query: { q: termo, projeto: filtro.projeto }
        })
        sugestoesFuncionarios.value = res.data || []
    } catch (e) {
        console.error('Erro ao buscar funcionários:', e)
    } finally {
        buscandoFuncionarios.value = false
    }
  }

  const selecionarFuncionario = (sugestao: any) => {
    filtro.funcionarioId = sugestao.id
    nomeFuncionarioSearch.value = sugestao.descricao
    mostrarMenuFuncionarios.value = false
  }

  const buscarRegistros = async () => {
    modalFiltroAvancadoAberto.value = false
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/operacao/contracheque/detalhes/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar contracheques:', error)
    } finally {
      carregando.value = false
    }
  }

  const abrirModalDetalhes = async (id: number) => {
    try {
      const response = await $fetch<any>('/api/operacao/contracheque/processamento/detalhes', {
        method: 'POST',
        body: { codigoContracheque: id }
      })
      detalhesVerba.value = response.data || []
      modalDetalhesAberto.value = true
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
    }
  }

  onMounted(() => {
    carregarCombos()
  })

  return {
    carregando,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarRegistros,
    projetos,
    funcionarios,
    detalhesVerba,
    modalDetalhesAberto,
    abrirModalDetalhes,

    // Filtro Avançado
    modalFiltroAvancadoAberto,
    limparFiltrosAvancados() {
        Object.assign(filtro, { mesAno: '', projeto: '', funcionarioId: '', status: '' })
        nomeFuncionarioSearch.value = ''
    },

    // Autocomplete Funcionário
    nomeFuncionarioSearch,
    sugestoesFuncionarios,
    buscandoFuncionarios,
    mostrarMenuFuncionarios,
    buscarFuncionarios,
    selecionarFuncionario,
    
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
