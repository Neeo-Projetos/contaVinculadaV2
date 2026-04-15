import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import { usePaginacaoFrontEnd } from '../../../global/usePaginacaoFrontEnd'

export function useExtratoProjetoListagem() {
  const router = useRouter()
  const { width } = useWindowSize()
  
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)
  
  const projetosAtivos = ref<any[]>([])
  const contasAtivas = ref<any[]>([])
  
  const sugestoesNome = ref<any[]>([])
  const buscandoSugestoes = ref(false)
  const mostrandoSugestoes = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const listaCompleta = ref<any[]>([])

  const filtro = ref({
    nomeParam: '', // Autocomplete de projeto
    projetoParam: '',
    contaVinculadaParam: '',
    dataInicioParam: '',
    dataFimParam: '',
    comSaldoParam: 'S'
  })

  const colunasVisiveis = reactive({
    projeto: true,
    conta: true,
    saldo: true,
    ultMov: true,
    acoes: true
  })

  const colunasTemp = reactive({ ...colunasVisiveis })

  // Paginação Front-End
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const placeholderDinamico = computed(() => {
    return 'Digite o nome do projeto...'
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
          projeto: filtro.value.projetoParam,
          contaVinculada: filtro.value.contaVinculadaParam,
          dataInicio: filtro.value.dataInicioParam,
          dataFim: filtro.value.dataFimParam,
          termo: filtro.value.nomeParam,
          comSaldo: filtro.value.comSaldoParam
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
    filtro.value = {
      nomeParam: filtro.value.nomeParam,
      projetoParam: '',
      contaVinculadaParam: '',
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
    
    // Limpa o ID se começar a digitar
    filtro.value.projetoParam = ''

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
        const resposta = await $fetch<any>('/api/cadastro/projeto/autocomplete', {
          query: { q: termo }
        })
        sugestoesNome.value = resposta?.data || []
      } catch (e) {
        console.error('Erro autocomplete projeto', e)
      } finally {
        buscandoSugestoes.value = false
      }
    }, 400)
  }

  const selecionarSugestao = (sugestao: any) => { 
    filtro.value.nomeParam = sugestao.apelido || sugestao.descricao
    filtro.value.projetoParam = sugestao.id
    mostrandoSugestoes.value = false
    buscarLista() 
  }
  
  const fecharSugestoesDelay = () => { setTimeout(() => { mostrandoSugestoes.value = false }, 200) }

  // Navegação para Detalhes
  const verExtrato = (id: number) => {
    router.push({ 
      path: '/operacao/movimentacaoBancaria/extratoProjeto/detalhes', 
      query: { codigo: id.toString() } 
    })
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
