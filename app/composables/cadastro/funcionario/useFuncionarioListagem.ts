import { ref, reactive } from 'vue'

export function useFuncionarioListagem() {
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const listaRegistros = ref<any[]>([])
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  const modalHistoricoAberto = ref(false)
  const historicoSelecionado = ref<any[]>([])
  const carregandoHistorico = ref(false)

  const filtro = reactive({
    nomeParam: '',
    cpfParam: '',
    matriculaParam: '',
    emailParam: '',
    projetoParam: '',
    ativoParam: '1'
  })

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
    buscarLista()
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
      listaRegistros.value = data?.results || []
    } catch (err: any) {
      console.error(err)
    } finally {
      carregandoTela.value = false
    }
  }

  const abrirModalFiltroAvancado = () => {
    console.log('Abrindo modal de Filtro Avançado...')
  }

  const abrirModalExibicao = () => {
    console.log('Abrindo modal de Controle de Exibição...')
  }

  const abrirModalHistorico = async (codigo: number) => {
    // Abre o modal e mostra o loading
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    historicoSelecionado.value = [] 

    try {
      // Bate na nossa API nova de histórico
      const data = await $fetch<any>('/api/cadastro/funcionario/historico', {
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
    carregandoTela,
    buscaRealizada,
    listaRegistros,
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
    abrirModalHistorico
  }
}