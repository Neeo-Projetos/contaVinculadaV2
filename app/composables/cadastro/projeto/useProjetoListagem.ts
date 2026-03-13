import { ref, reactive } from 'vue'

export function useProjetoListagem() {
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  const modalHistoricoAberto = ref(false)
  const historicoSelecionado = ref<any[]>([])
  const carregandoHistorico = ref(false)
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)

  const filtro = reactive({
    apelidoParam: '', 
    cnpjParam: '',
    contaParam: '', 
    verbaParam: '', 
    ativoParam: '1'
  })

  const colunasVisiveis = reactive({
    cnpj: true,
    contas: true,
    verbas: true,
    status: true,
    historico: true
  })

  const labelsColunas = {
    cnpj: 'CNPJ do Projeto',
    contas: 'Contas (Bancos)',
    verbas: 'Verbas',
    status: 'Status',
    historico: 'Botão de Histórico'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)
  
  const filtrar = () => {
    paginacao.mudarPagina(1) 
    buscarProjetos()
  }

  const sugestoesProjeto = ref<any[]>([])
  const mostrandoSugestoes = ref(false)
  const buscandoSugestoes = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestoesProjeto = () => {
    const texto = filtro.apelidoParam
    
    if (texto.length < 3) {
      sugestoesProjeto.value = []
      mostrandoSugestoes.value = false
      return
    }

    clearTimeout(timerDebounce)
    
    timerDebounce = setTimeout(async () => {
      buscandoSugestoes.value = true
      mostrandoSugestoes.value = true
      
      try {
        const resposta = await $fetch<any>(`/api/cadastro/projeto/autocomplete?q=${texto}`)
        sugestoesProjeto.value = resposta?.data || [] 
      } catch (e) {
        console.error('Erro no autocomplete de projeto:', e)
      } finally {
        buscandoSugestoes.value = false
      }
    }, 400) 
  }

  const selecionarSugestao = (sugestao: any) => {
    filtro.apelidoParam = sugestao.apelido || sugestao.descricao
    mostrandoSugestoes.value = false
    filtrar()
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

  const buscarProjetos = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const data = await $fetch<any>('/api/cadastro/projeto/listagem', {
        method: 'POST',
        body: filtro
      })

      listaCompleta.value = data?.results || data?.data || []
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
    filtro.cnpjParam = ''
    filtro.contaParam = ''
    filtro.verbaParam = ''
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

  const abrirModalConta = (id: number) => { console.log('Abrir Contas do projeto', id) }
  const abrirModalVerba = (id: number) => { console.log('Abrir Verbas do projeto', id) }

  const abrirModalHistorico = async (codigo: number) => {
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    historicoSelecionado.value = [] 

    try {
      const data = await $fetch<any>('/api/cadastro/projeto/historico', {
        method: 'POST',
        body: { codigo }
      })
      
      if (data && data.status === 'success') {
        historicoSelecionado.value = data.data
      } else {
        console.error(data?.message || 'Erro ao carregar histórico')
      }
    } catch (err) {
      console.error('Falha na API de histórico:', err)
    } finally {
      carregandoHistorico.value = false
    }
  }

  return {
    carregandoTela, buscaRealizada, visaoAtual, filtro,
    sugestoesProjeto, mostrandoSugestoes, buscandoSugestoes,
    buscarSugestoesProjeto, selecionarSugestao, fecharSugestoesDelay, destacarTexto,
    buscarProjetos, filtrar,
    modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
    modalExibicaoAberto, colunasVisiveis, colunasTemp, abrirModalExibicao, aplicarExibicao,
    labelsColunas, 
    modalHistoricoAberto, historicoSelecionado, carregandoHistorico, abrirModalHistorico,
    abrirModalConta, abrirModalVerba,
    
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