import { ref, reactive, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useProjetoListagem() {
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  const modalHistoricoAberto = ref(false)
  const historicoSelecionado = ref<any[]>([])
  const carregandoHistorico = ref(false)
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)
  const listaVerbas = ref<any[]>([])
  const listaBancos = ref<any[]>([])
  const { width } = useWindowSize()

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Digite o apelido...'
    if (width.value < 1024) return 'Digite o apelido do proj...'
    return 'Digite o apelido do projeto...'
  })

  onMounted(() => {
    carregarVerbas()
    carregarBancos()
  })

  const filtro = ref({
    apelidoParam: '',
    projetoId: '' as string | number,
    cnpjParam: '',
    contaParam: '',
    verbaParam: '',
    ativoParam: '1'
  })

  const colunasVisiveis = reactive({
    cnpj: true,
    contas: true,
    verbas: true,
    status: true
  })

  const labelsColunas = {
    cnpj: 'CNPJ do Projeto',
    contas: 'Contas (Bancos)',
    verbas: 'Verbas',
    status: 'Status'
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
    const texto = filtro.value.apelidoParam

    // Limpa o projetoId ao começar a digitar uma nova busca
    filtro.value.projetoId = ''

    if (texto.length < 3) {
      sugestoesProjeto.value = []
      mostrandoSugestoes.value = false
      return
    }

    clearTimeout(timerDebounce)
    mostrandoSugestoes.value = true

    timerDebounce = setTimeout(async () => {
      buscandoSugestoes.value = true

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
    filtro.value.apelidoParam = sugestao.apelido || sugestao.descricao
    filtro.value.projetoId = sugestao.id
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
        body: filtro.value
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
    filtro.value.cnpjParam = ''
    filtro.value.projetoId = ''
    filtro.value.contaParam = ''
    filtro.value.verbaParam = ''
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

  const carregarVerbas = async () => {
    try {
      const resp = await $fetch<any>('/api/tabelaBasica/verbas/listagem', {
        method: 'POST', body: { ativo: '1' }
      })
      listaVerbas.value = (resp?.data || []).map((v: any) => ({
        codigo: v.codigo,
        descricao: `${v.codigoReferencia} - ${v.descricao}`
      }))
    } catch (e) { console.error('Falha ao carregar verbas:', e) }
  }

  const carregarBancos = async () => {
    try {
      const resp = await $fetch<any>('/api/tabelaBasica/bancos/listagem', {
        method: 'POST', body: { ativo: '1' }
      })
      listaBancos.value = (resp?.data || []).map((b: any) => ({
        codigo: b.codigo,
        descricao: `${b.codigoBanco} - ${b.nomeBanco}`
      }))
    } catch (e) { console.error('Falha ao carregar bancos:', e) }
  }

  const abrirHistorico = async (codigo: number) => {
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
    buscarProjetos, filtrar, placeholderDinamico,
    modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
    modalExibicaoAberto, colunasVisiveis, colunasTemp, abrirModalExibicao, aplicarExibicao,
    labelsColunas,
    filtroGlobal: paginacao.filtroGlobal,
    modalHistoricoAberto, historicoSelecionado, carregandoHistorico, abrirHistorico,
    abrirModalConta, abrirModalVerba,
    listaVerbas, listaBancos,

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
