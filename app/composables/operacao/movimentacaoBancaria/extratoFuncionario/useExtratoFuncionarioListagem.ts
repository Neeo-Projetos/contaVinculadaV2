import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import { usePaginacaoFrontEnd } from '../../../global/usePaginacaoFrontEnd'

export function useExtratoFuncionarioListagem() {
  const router = useRouter()
  const { width } = useWindowSize()
  
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)
  
  const sugestoesNome = ref<any[]>([])
  const buscandoSugestoes = ref(false)
  const mostrandoSugestoes = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const projetosAtivos = ref<any[]>([])

  const filtro = ref({
    nomeParam: '', // Termo de busca principal (Autocomplete)
    projetoParam: '',
    funcionarioParam: '',
    cpfParam: '',
    dataInicioParam: '',
    dataFimParam: '',
    comSaldoParam: 'S'
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
  
  // Lógica de Navegação para Detalhes
  const verExtrato = (id: number) => {
    router.push({ path: '/operacao/movimentacaoBancaria/extratoFuncionario/detalhes', query: { codigo: id.toString() } })
  }

  // Paginação Front-End
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const placeholderDinamico = computed(() => {
    return 'Digite o nome do funcionário...'
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
      const resProj = await $fetch<any>('/api/cadastro/projeto/ativos').catch(() => [])
      projetosAtivos.value = resProj?.data || resProj || []
    } catch (error) {
       console.error("Erro combos extrato funcionario", error)
    }
  }

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      // Usamos o objeto de filtro mas garantimos que se houver um funcionarioParam (ID), ele prevalece
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/extratoFuncionario/listagem', {
        method: 'POST', 
        body: {
          projeto: filtro.value.projetoParam,
          funcionarioId: filtro.value.funcionarioParam,
          cpf: filtro.value.cpfParam,
          dataInicio: filtro.value.dataInicioParam,
          dataFim: filtro.value.dataFimParam,
          termo: filtro.value.nomeParam,
          comSaldo: filtro.value.comSaldoParam
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
    filtro.value = {
      nomeParam: filtro.value.nomeParam, // Mantém o nome se estiver digitado
      projetoParam: '',
      funcionarioParam: '',
      cpfParam: '',
      dataInicioParam: '',
      dataFimParam: '',
      comSaldoParam: 'S'
    }
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
    const termo = filtro.value.nomeParam
    
    // Limpa o ID selecionado se começar a digitar
    filtro.value.funcionarioParam = ''

    if (!termo || termo.length < 3) {
      sugestoesNome.value = []
      mostrandoSugestoes.value = false
      return
    }

    clearTimeout(timerDebounce)
    mostrandoSugestoes.value = true

    timerDebounce = setTimeout(async () => {
      buscandoSugestoes.value = true
      try {
        const query: any = { q: termo }
        if (filtro.value.projetoParam) query.projeto = filtro.value.projetoParam
        
        const resposta = await $fetch<any>('/api/cadastro/funcionario/autocomplete', { query })
        sugestoesNome.value = resposta?.data || []
      } catch (e) {
        console.error('Erro autocomplete funcionário', e)
      } finally {
        buscandoSugestoes.value = false
      }
    }, 400)
  }

  const selecionarSugestao = (sugestao: any) => { 
    filtro.value.nomeParam = sugestao.descricao
    filtro.value.funcionarioParam = sugestao.id
    mostrandoSugestoes.value = false
    buscarLista() 
  }
  
  const fecharSugestoesDelay = () => { setTimeout(() => { mostrandoSugestoes.value = false }, 200) }

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
    projetosFormatados,
    
    sugestoesNome,
    buscandoSugestoes,
    mostrandoSugestoes,
    buscarSugestoesNome,
    selecionarSugestao,
    fecharSugestoesDelay,
    
    // Extrato
    verExtrato,
    
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
