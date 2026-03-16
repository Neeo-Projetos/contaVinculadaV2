import { ref, reactive } from 'vue'

export function useFuncionarioListagem() {
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  const modalHistoricoAberto = ref(false)
  const historicoSelecionado = ref<any[]>([])
  const carregandoHistorico = ref(false)
  const modalFiltroAvancadoAberto = ref(false)
  const projetosAtivos = ref<any[]>([])
  const modalExibicaoAberto = ref(false)

  const filtro = reactive({
    nomeParam: '',
    cpfParam: '',
    matriculaParam: '',
    emailParam: '',
    projetoParam: '',
    ativoParam: '1'
  })

  const colunasVisiveis = reactive({
    cpf: true,
    matricula: true,
    projeto: true,
    status: true,
    historico: true
  })

  const labelsColunas = {
    cpf: 'Documento (CPF)',
    matricula: 'Matrícula',
    projeto: 'Projeto / Alocação',
    status: 'Status',
    historico: 'Botão de Histórico'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)
  
  const filtrar = () => {
    paginacao.mudarPagina(1)
    buscarLista()
  }

  const sugestoesNome = ref<any[]>([])
  const mostrandoSugestoes = ref(false)
  const buscandoSugestoes = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestoesNome = () => {
    const texto = filtro.nomeParam
    
    if (texto.length < 3) {
      sugestoesNome.value = []
      mostrandoSugestoes.value = false
      return
    }

    clearTimeout(timerDebounce)
    
    timerDebounce = setTimeout(async () => {
      buscandoSugestoes.value = true
      mostrandoSugestoes.value = true
      
      try {
        const resposta = await $fetch<any>(`/api/cadastro/funcionario/autocomplete?q=${texto}`)
        sugestoesNome.value = resposta?.data || [] 
      } catch (e) {
        console.error('Erro no autocomplete:', e)
      } finally {
        buscandoSugestoes.value = false
      }
    }, 400) 
  }

  const selecionarSugestao = (sugestao: any) => {
    filtro.nomeParam = sugestao.descricao
    mostrandoSugestoes.value = false
  }

  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrandoSugestoes.value = false
    }, 200)
  }

  const destacarTexto = (texto: string, busca: string) => {
    if (!busca) return texto
    const regex = new RegExp(`(${busca})`, 'gi')
    return texto.replace(regex, '<span class="font-extrabold text-emerald-600 dark:text-emerald-400">$1</span>')
  }

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const data = await $fetch<any>('/api/cadastro/funcionario/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = data?.results || []
      paginacao.mudarPagina(1)
    } catch (err: any) {
      console.error(err)
    } finally {
      carregandoTela.value = false
    }
  }

  const abrirModalFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = true
  }

  const limparFiltrosAvancados = () => {
    filtro.cpfParam = ''
    filtro.matriculaParam = ''
    filtro.emailParam = ''
    filtro.projetoParam = ''
    modalFiltroAvancadoAberto.value = false
    filtrar()
  }

  const aplicarFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = false
    filtrar()
  }

  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunasVisiveis)
    modalExibicaoAberto.value = true
  }

  const aplicarExibicao = () => {
    Object.assign(colunasVisiveis, colunasTemp)
    modalExibicaoAberto.value = false
  }

  const codigoHistorico = ref<number | null>(null)

  const abrirHistorico = async (codigo: number) => {
    codigoHistorico.value = codigo
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    historicoSelecionado.value = [] 
    
    try {
      const data = await $fetch<any>('/api/cadastro/funcionario/historico', {
        method: 'POST',
        body: { codigo }
      })
      
      if (data && data.status === 'success') {
        historicoSelecionado.value = data.data
      }
    } catch (err) {
      console.error('Falha na API de histórico:', err)
    } finally {
      carregandoHistorico.value = false
    }
  }

  const carregarProjetos = async () => {
    try {
      const data = await $fetch<any>('/api/cadastro/projeto/ativos')
      projetosAtivos.value = data?.data || data || []
    } catch (erro) {
      console.error('Erro ao buscar projetos para o filtro:', erro)
    }
  }

  return {
    carregando: carregandoTela,
    carregandoTela,
    buscaRealizada,
    filtro,
    sugestoesNome,
    mostrandoSugestoes,
    buscandoSugestoes,
    buscarSugestoesNome,
    selecionarSugestao,
    fecharSugestoesDelay,
    destacarTexto,
    buscarLista,
    visaoAtual,
    abrirModalFiltroAvancado,
    abrirModalExibicao,
    modalHistoricoAberto,
    historicoSelecionado,
    carregandoHistorico,
    abrirHistorico,
    codigoHistorico,
    modalFiltroAvancadoAberto,
    aplicarFiltroAvancado,
    projetosAtivos,
    carregarProjetos,
    modalExibicaoAberto,
    colunas: colunasVisiveis,
    colunasVisiveis,
    labels: labelsColunas,
    labelsColunas,
    limparFiltrosAvancados,
    colunasTemp,
    aplicarExibicao,
    filtrar,
    
    dados: paginacao.listaPaginada,
    listaRegistros: paginacao.listaPaginada,
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