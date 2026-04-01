import { ref, reactive, computed, onMounted, type Ref } from 'vue'
import { useAppNotificacao } from '../../global/useAppNotificacao'
import { usePaginacaoFrontEnd } from '../../global/usePaginacaoFrontEnd'

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
  const { dispararAlerta } = useAppNotificacao()
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = ref<FiltroProcessamento>({
    mesAno: '',
    projeto: '',
    funcionarioId: '',
    status: '2' // Pendentes por padrão
  })

  const colunasVisiveis = reactive({
    projeto: true,
    valorLiquido: true,
    valorRetencao: true,
    status: true
  })

  const erros = reactive<Record<string, string>>({
    mesAno: '',
    projeto: '',
    funcionarioId: ''
  })

  // Labels das colunas para padronização (Item 3.1 do padraoTelas.md)
  const labelsColunas = {
      projeto: 'Projeto / Unidade',
      valorLiquido: 'Valor Líquido',
      valorRetencao: 'Valor Retido',
      status: 'Situação'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })
  const modalExibicaoAberto = ref(false)

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
  const modalSucessoAberto = ref(false)
  const modalFiltroAvancadoAberto = ref(false)

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
    filtro.value.funcionarioId = String(sugestao.id)
    nomeFuncionarioSearch.value = sugestao.descricao
    mostrarMenuFuncionarios.value = false
  }

  const buscarProcessamentos = async () => {
    erros.mesAno = ''
    if (!filtro.value.mesAno || filtro.value.mesAno.replace(/\D/g, '').length < 6) {
        erros.mesAno = 'Preencha o campo Mês/Ano'
        return dispararAlerta('Filtro Obrigatório', 'Informe o Mês/Ano de referência no formato MM/AAAA.', 'error')
    }
    
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/operacao/contracheque/processamento/listagem', {
        method: 'POST',
        body: filtro.value
      })
      listaCompleta.value = (response.data || []).map((item: any) => ({ ...item, selecionado: true }))
      paginacao.mudarPagina(1)
    } catch (error) {
      dispararAlerta('Erro na Busca', 'Houve um problema ao consultar os registros no servidor.', 'error')
    } finally {
      carregando.value = false
    }
  }

  const marcarDesmarcarTodos = () => {
    const lista = paginacao.listaPaginada.value as ProcessamentoItem[]
    const todosMarcados = lista.filter(i => i.statusAprovacao === 2).every(i => i.selecionado)
    const novoEstado = !todosMarcados
    
    lista.forEach(item => {
      if (item.statusAprovacao === 2) item.selecionado = novoEstado
    })
  }

  const processarContracheque = async (statusAprovacao: number) => {
    const matriculasSelecionadas = listaCompleta.value
      .filter(item => item.statusAprovacao === 2 && item.selecionado)
      .map(item => item.matricula)

    if (matriculasSelecionadas.length === 0) {
        return dispararAlerta('Seleção Obrigatória', 'Por favor, selecione ao menos um contracheque na lista para realizar esta ação.', 'warning')
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
        filtro.value.status = statusAprovacao.toString()
        buscarProcessamentos()
      } else {
        dispararAlerta('Falha na Operação', res.mensagem || 'Não foi possível gravar as alterações.', 'error')
      }
    } catch (error) {
      dispararAlerta('Erro de Conexão', 'Erro técnico ao tentar se comunicar com o servidor de processamento.', 'error')
    } finally {
      carregando.value = false
    }
  }

  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunasVisiveis)
    modalExibicaoAberto.value = true
  }

  const aplicarExibicao = () => {
    Object.assign(colunasVisiveis, colunasTemp)
    modalExibicaoAberto.value = false
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
      dispararAlerta('Erro de Detalhamento', 'Não foi possível carregar as verbas deste registro.', 'error')
    }
  }

  onMounted(() => {
    carregarCombos()
  })

  const abrirModalFiltroAvancado = () => { modalFiltroAvancadoAberto.value = true }
  
  const limparFiltrosAvancados = () => {
    filtro.value = { mesAno: '', projeto: '', funcionarioId: '', status: '2' }
    nomeFuncionarioSearch.value = ''
  }

  const aplicarFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = false
    buscarProcessamentos()
  }

  return {
    carregando,
    buscaRealizada,
    visaoAtual,
    filtro,
    erros,
    labelsColunas,
    buscarProcessamentos,
    projetos,
    funcionarios,
    detalhesVerba,
    modalDetalhesAberto,
    modalSucessoAberto,
    abrirModalDetalhes,
    processarContracheque,
    marcarDesmarcarTodos,

    // Filtro Avançado
    modalFiltroAvancadoAberto,
    abrirModalFiltroAvancado,
    limparFiltrosAvancados,
    aplicarFiltroAvancado,

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
    mudarItensPorPagina: paginacao.mudarItensPorPagina,
    filtroGlobal: paginacao.filtroGlobal,

    // Exibição
    colunas: colunasVisiveis,
    colunasTemp,
    labels: labelsColunas,
    modalExibicaoAberto,
    abrirModalExibicao,
    aplicarExibicao
  }
}
