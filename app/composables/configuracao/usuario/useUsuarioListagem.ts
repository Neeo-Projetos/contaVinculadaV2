import { ref, reactive, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useUsuarioListagem() {
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  const { width } = useWindowSize()

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Nome...'
    return 'Digite o nome do usuário...'
  })

  const filtro = ref({
    login: '',
    nome: '',
    cpf: '',
    projeto: '',
    ativo: '1'
  })

  const colunasVisiveis = reactive({
    login: true,
    nome: true,
    cpf: true,
    status: true,
    historico: true
  })

  const labelsColunas = {
    login: 'Login',
    nome: 'Nome Completo',
    cpf: 'CPF',
    status: 'Status',
    historico: 'Histórico'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const data = await $fetch<any>('/api/configuracao/usuario/listagem', {
        method: 'POST',
        body: filtro.value
      })
      listaCompleta.value = data?.data || []
      paginacao.mudarPagina(1)
    } catch (err: any) {
      console.error(err)
    } finally {
      carregandoTela.value = false
    }
  }

  const filtrar = () => {
    buscarLista()
  }

  // Projetos
  const projetosAtivos = ref<any[]>([])
  const projetosFormatados = computed(() => {
    return projetosAtivos.value.map(p => ({
        codigo: p.id || p.codigo,
        descricao: `${p.apelido} - ${p.descricao}`
    }))
  })
  const carregarProjetos = async () => {
    try {
        const data = await $fetch<any>('/api/cadastro/projeto/ativos')
        projetosAtivos.value = data?.data || data || []
    } catch (e) { console.error(e) }
  }

  // Filtro Avançado
  const modalFiltroAvancadoAberto = ref(false)
  const abrirModalFiltroAvancado = () => modalFiltroAvancadoAberto.value = true
  const limparFiltrosAvancados = () => {
    filtro.value = {
      login: '',
      nome: '',
      cpf: '',
      projeto: '',
      ativo: '1'
    }
    buscarLista()
  }
  const aplicarFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = false
    buscarLista()
  }

  // Histórico
  const modalHistoricoAberto = ref(false)
  const carregandoHistorico = ref(false)
  const historicoSelecionado = ref<any[]>([])
  const abrirHistorico = async (codigo: number) => {
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    try {
        const response = await $fetch<any>('/api/configuracao/usuario/historico', {
            method: 'POST', body: { codigo }
        })
        
        if (response.status === 'failed') {
            historicoSelecionado.value = []
            return
        }
        historicoSelecionado.value = response.data || []
    } catch (error) {
        console.error('Erro ao buscar histórico', error)
        historicoSelecionado.value = []
    } finally {
        carregandoHistorico.value = false
    }
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

  onMounted(() => {
    carregarProjetos()
  })

  return {
    carregando: carregandoTela,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarLista,
    filtrar,
    placeholderDinamico,
    
    // Exibição e Colunas
    modalExibicaoAberto,
    abrirModalExibicao,
    aplicarExibicao,
    colunas: colunasVisiveis,
    labels: labelsColunas,
    colunasTemp,

    // Filtros e Histórico
    modalFiltroAvancadoAberto,
    abrirModalFiltroAvancado,
    limparFiltrosAvancados,
    aplicarFiltroAvancado,
    modalHistoricoAberto,
    carregandoHistorico,
    historicoSelecionado,
    abrirHistorico,
    projetosFormatados,

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
