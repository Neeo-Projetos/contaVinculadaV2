import { ref, reactive, computed, onMounted } from 'vue'

interface FiltroProcessamento {
  mesAno: string
  projeto: string
  funcionarioId: string
  status: string
}

interface ProcessamentoItem {
  codigo: number
  funcionario: string
  cpf: string
  projeto: string
  valorLiquido: number
  matricula: string
  mesAno: string
  decimoTerceiro: number
  feriasConstitucional: number
  multaFgts: number
  submodulo: number
  valorRetencao: number
  statusAprovacao: number
  selecionado: boolean
}

export function useContrachequeProcessamento() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = reactive<FiltroProcessamento>({
    mesAno: '',
    projeto: '',
    funcionarioId: '',
    status: '2' // Pendentes por padrão
  })

  // Labels das colunas para padronização (Item 3.1 do padraoTelas.md)
  const labelsColunas = {
      funcionario: 'Funcionário',
      projeto: 'Projeto',
      valorLiquido: 'Vlr. Líquido',
      valorRetencao: 'Vlr. Retido',
      status: 'Situação'
  }

  const listaCompleta = ref<ProcessamentoItem[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const projetos = ref<any[]>([])
  const funcionarios = ref<any[]>([]) // Lista estática (se necessária)
  
  // Estados para Autocomplete de Funcionário
  const nomeFuncionarioSearch = ref('')
  const sugestoesFuncionarios = ref<any[]>([])
  const buscandoFuncionarios = ref(false)
  const mostrarMenuFuncionarios = ref(false)

  const detalhesVerba = ref<any[]>([])
  
  // Estados para Modais
  const modalDetalhesAberto = ref(false)
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('Atenção')
  const modalAlertaMensagem = ref('')
  const modalSucessoAberto = ref(false)

  const exibirAlerta = (titulo: string, mensagem: string) => {
    modalAlertaTitulo.value = titulo
    modalAlertaMensagem.value = mensagem
    modalAlertaAberto.value = true
  }

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

  const buscarProcessamentos = async () => {
    if (!filtro.mesAno || filtro.mesAno.length < 7) {
        return exibirAlerta('Filtro Obrigatório', 'Informe o Mês/Ano de referência no formato MM/AAAA para realizar a busca.')
    }
    
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/operacao/contracheque/processamento/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = (response.data || []).map((item: any) => ({ ...item, selecionado: true }))
      paginacao.mudarPagina(1)
    } catch (error) {
      exibirAlerta('Erro na Busca', 'Houve um problema ao consultar os registros no servidor.')
    } finally {
      carregando.value = false
    }
  }

  const marcarDesmarcarTodos = () => {
    const todosMarcados = paginacao.listaPaginada.value.filter(i => i.statusAprovacao === 2).every(i => i.selecionado)
    const novoEstado = !todosMarcados
    paginacao.listaPaginada.value.forEach(item => {
      if (item.statusAprovacao === 2) item.selecionado = novoEstado
    })
  }

  const processarContracheque = async (statusAprovacao: number) => {
    const matriculasSelecionadas = listaCompleta.value
      .filter(item => item.statusAprovacao === 2 && item.selecionado)
      .map(item => item.matricula)

    if (matriculasSelecionadas.length === 0) {
        return exibirAlerta('Seleção Obrigatória', 'Por favor, selecione ao menos um contracheque na lista para realizar esta ação.')
    }

    carregando.value = true
    try {
      const res = await $fetch<any>('/api/operacao/contracheque/processamento/gravar', {
        method: 'POST',
        body: { 
          matriculas: matriculasSelecionadas,
          statusAprovacao: statusAprovacao 
        }
      })

      if (res.status === 'success') {
        modalSucessoAberto.value = true
        filtro.status = statusAprovacao.toString()
        buscarProcessamentos()
      } else {
        exibirAlerta('Falha na Operação', res.mensagem || 'Não foi possível gravar as alterações.')
      }
    } catch (error) {
      exibirAlerta('Erro de Conexão', 'Erro técnico ao tentar se comunicar com o servidor de processamento.')
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
      exibirAlerta('Erro de Detalhamento', 'Não foi possível carregar as verbas deste registro.')
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
    labelsColunas,
    buscarProcessamentos,
    projetos,
    funcionarios,
    detalhesVerba,
    modalDetalhesAberto,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    modalSucessoAberto,
    abrirModalDetalhes,
    processarContracheque,
    marcarDesmarcarTodos,

    // Filtro Avançado
    modalFiltroAvancadoAberto: ref(false),
    abrirModalFiltroAvancado() { this.modalFiltroAvancadoAberto.value = true },
    limparFiltrosAvancados() {
        Object.assign(filtro, { mesAno: '', projeto: '', funcionarioId: '', status: '2' })
        nomeFuncionarioSearch.value = ''
    },
    aplicarFiltroAvancado() {
        this.modalFiltroAvancadoAberto.value = false
        buscarProcessamentos()
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
