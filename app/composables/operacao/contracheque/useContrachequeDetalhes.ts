import { ref, reactive, computed, onMounted } from 'vue'
import { useAppNotificacao } from '~/composables/global/useAppNotificacao'

export function useContrachequeDetalhes() {
  const { dispararAlerta } = useAppNotificacao()
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = ref({
    mesAno: '',
    projeto: '',
    funcionarioId: '',
    status: '' 
  })

  // Controle de Colunas (Padrão Ouro)
  const modalExibicaoAberto = ref(false)
  const colunasVisiveis = reactive({
    funcionario: true,
    projeto: true,
    status: true,
    competencia: true,
    acoes: true
  })

  const labelsColunas = {
    funcionario: 'Funcionário',
    projeto: 'Projeto',
    status: 'Status',
    competencia: 'Competência',
    acoes: 'Ações'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

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
            query: { q: termo, projeto: filtro.value.projeto }
        })
        sugestoesFuncionarios.value = res.data || []
    } catch (e) {
        console.error('Erro ao buscar funcionários:', e)
    } finally {
        buscandoFuncionarios.value = false
    }
  }

  const selecionarFuncionario = (sugestao: any) => {
    filtro.value.funcionarioId = sugestao.id
    nomeFuncionarioSearch.value = sugestao.descricao
    mostrarMenuFuncionarios.value = false
  }

  const buscarRegistros = async () => {
    if (!filtro.value.mesAno) {
      dispararAlerta('Filtro Obrigatório', 'Por favor, informe o Mês/Ano para realizar a consulta.', 'warning')
      return
    }

    modalFiltroAvancadoAberto.value = false
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/operacao/contracheque/detalhes/listagem', {
        method: 'POST',
        body: filtro.value
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
        filtro.value = { mesAno: '', projeto: '', funcionarioId: '', status: '' }
        nomeFuncionarioSearch.value = ''
    },

    // Exibição (Padrão Ouro)
    modalExibicaoAberto,
    colunas: colunasVisiveis,
    labels: labelsColunas,
    colunasTemp,
    abrirModalExibicao() {
        Object.assign(colunasTemp, colunasVisiveis)
        modalExibicaoAberto.value = true
    },
    aplicarExibicao() {
        Object.assign(colunasVisiveis, colunasTemp)
        modalExibicaoAberto.value = false
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
