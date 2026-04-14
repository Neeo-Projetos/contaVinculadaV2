import { ref, reactive, onMounted, watch } from 'vue'

export function usePermissaoUsuarioListagem() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  
  const modalHistoricoAberto = ref(false)
  const historicoData = ref<any[]>([])
  const carregandoHistorico = ref(false)
  
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)

  const filtro = reactive({
    login: '',
    nomeUsuario: '',
    cpf: '',
    ativoParam: '1'
  })

  // Exibição configuration like Funcionario
  const colunas = reactive({
    usuario: true,
    cpf: true,
    status: true,
    historico: true
  })

  const labels = {
    usuario: 'Nome do Usuário',
    cpf: 'CPF',
    status: 'Status',
    historico: 'Botão de Histórico'
  }
  
  const colunasTemp = reactive({ ...colunas })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const buscarUsuarios = async () => {
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/configuracao/permissaoUsuario/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar usuários', error)
    } finally {
      carregando.value = false
    }
  }

  // Monitoramento reativo para busca "enquanto digita"
  watch(() => filtro.login, () => {
    // Implementamos um pequeno delay (debounce) se necessário, 
    // mas para listas menores o disparo direto é mais fluido.
    buscarUsuarios()
  })

  const limparFiltrosAvancados = () => {
    filtro.nomeUsuario = ''
    filtro.cpf = ''
    modalFiltroAvancadoAberto.value = false
    buscarUsuarios()
  }

  const aplicarFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = false
    buscarUsuarios()
  }

  const abrirModalFiltroAvancado = () => modalFiltroAvancadoAberto.value = true
  
  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunas)
    modalExibicaoAberto.value = true
  }
  
  const aplicarExibicao = () => {
    Object.assign(colunas, colunasTemp)
    modalExibicaoAberto.value = false
  }

  const abrirHistorico = async (codigo: number) => {
    carregandoHistorico.value = true
    modalHistoricoAberto.value = true
    historicoData.value = []
    try {
      const response = await $fetch<any>('/api/configuracao/permissaoUsuario/historico', {
        method: 'POST', body: { codigo }
      })
      historicoData.value = response.data || []
    } catch (error) {
      console.error('Erro ao buscar historico', error)
    } finally {
      carregandoHistorico.value = false
    }
  }

  // O carregamento inicial acontece apenas na primeira busca para performance.
  onMounted(() => {
    buscarUsuarios()
  })

  return {
    carregando, buscaRealizada, visaoAtual, filtro,
    buscarUsuarios, 
    modalHistoricoAberto, historicoData, carregandoHistorico, abrirHistorico,
    modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
    modalExibicaoAberto, colunas, colunasTemp, labels, abrirModalExibicao, aplicarExibicao,
    
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
