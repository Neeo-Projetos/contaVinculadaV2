import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useLancamentoReembolsoFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const codigo = route.query.codigo
  const editando = computed(() => !!form.codigo && form.codigo !== '0')
  const modoVisualizar = computed(() => route.query.modo === 'visualizar' || editando.value)

  const carregandoTela = ref(false)
  const salvando = ref(false)
  const modalConfirmaProjeto = ref(false)
  
  // Controle de Passos (Padrão Ouro)
  const passoAtual = ref(1)
  const totalPassos = 3
  
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')

  const form = reactive({
    codigo: codigo ? String(codigo) : '0',
    projeto: '',
    contaVinculada: '',
    tipoMovimentacao: '',
    valorMovimentacao: '',
    dataMovimentacao: '',
    classificacaoLancamento: '',
    motivo: '',
    dataOficio: '',
    valorOficio: '',
    dataResposta: '', 
    dataEntrada: '',
    status: '',
    classificacaoOficio: '',
    numeroOficio: '',
    funcionarios: [] as any[]
  })

  const combos = reactive({
    projetos: [] as any[],
    contasVinculadas: [] as any[],
    tiposMovimentacao: [] as any[],
    classificacoes: [] as any[],
    funcionariosAtivos: [] as any[],
    statusList: [] as any[]
  })

  const funcionarioTemp = ref<any>(null)
  const buscaFuncionario = ref('')
  const buscandoFuncionario = ref(false)
  const sugestoesFuncionarios = ref<any[]>([])
  const mostrarMenuFuncionario = ref(false)

  // Filtros e Paginação local para a tabela de funcionários vinculados
  const filtroFuncionario = ref('')
  const paginaFuncionario = ref(1)
  const itensPorPaginaFuncionario = ref(10)

  // Filtrei a lista de funcionários que já foram adicionados
  const funcionariosFiltrados = computed(() => {
    const lista = form.funcionarios.filter(f => f.tipoAlteracao !== 2)
    if (!filtroFuncionario.value) return lista
    const busca = filtroFuncionario.value.toLowerCase()
    return lista.filter(f => (f.funcionarioNome || '').toLowerCase().includes(busca))
  })

  // Fiz o fatiamento para a paginação da tabela
  const totalPaginasFuncionario = computed(() => Math.ceil(funcionariosFiltrados.value.length / itensPorPaginaFuncionario.value))
  const funcionariosPaginados = computed(() => {
    const inicio = (paginaFuncionario.value - 1) * itensPorPaginaFuncionario.value
    return funcionariosFiltrados.value.slice(inicio, inicio + itensPorPaginaFuncionario.value)
  })

  const registroInicialFuncionario = computed(() => funcionariosFiltrados.value.length === 0 ? 0 : (paginaFuncionario.value - 1) * itensPorPaginaFuncionario.value + 1)
  const registroFinalFuncionario = computed(() => Math.min(paginaFuncionario.value * itensPorPaginaFuncionario.value, funcionariosFiltrados.value.length))
  const paginasExibidasFuncionario = computed(() => Array.from({ length: totalPaginasFuncionario.value }, (_, i) => i + 1))

  const todosFuncionariosMarcados = computed(() => {
    const lista = funcionariosFiltrados.value
    return lista.length > 0 && lista.every(f => f.selecionadoParaRemover)
  })

  const marcarDesmarcarTodosFuncionarios = () => {
    const novoEstado = !todosFuncionariosMarcados.value
    funcionariosFiltrados.value.forEach(f => f.selecionadoParaRemover = novoEstado)
  }

  const formatarValor = (campo: 'valorMovimentacao' | 'valorOficio') => {
    form[campo] = String(form[campo]).replace(/[^0-9.,]/g, "")
  }

  const carregarCombos = async () => {
    try {
      // Carreguei os combos de forma independente para evitar que um erro trave tudo (Igual ao Manual)
      const resProj = await $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos').catch(() => ({ data: [] }))
      combos.projetos = (resProj.data || []).map(p => ({ ...p, codigo: String(p.codigo) }))

      const resTipo = await $fetch<{ data: any[] }>('/api/tabelaBasica/tipoMovimentacao/listagem', { method: 'POST', body: { ativo: 1 } }).catch(() => ({ data: [] }))
      combos.tiposMovimentacao = (resTipo.data || []).map(t => ({ ...t, codigo: String(t.codigo) }))

      const resClass = await $fetch<{ data: any[] }>('/api/tabelaBasica/classificacao/listagem', { method: 'POST', body: { ativo: 1 } }).catch(() => ({ data: [] }))
      combos.classificacoes = (resClass.data || []).map(c => ({ ...c, codigo: String(c.codigo) }))

      combos.funcionariosAtivos = []

      const resStatus = await $fetch<{ data: any[] }>('/api/operacao/oficio/lancamentoReembolso/status', { method: 'POST' }).catch(() => ({ data: [] }))
      combos.statusList = (resStatus.data || []).map(s => ({ ...s, codigo: String(s.codigo) }))

    } catch (e) {
      console.error("Erro ao carregar combos", e)
    }
  }

  const carregarContas = async (idProjeto: string) => {
    if (!idProjeto) {
      combos.contasVinculadas = []
      return
    }
    try {
      const res = await $fetch<{ status: string, data: any[] }>('/api/operacao/oficio/lancamentoReembolso/contasPorProjeto', {
        method: 'POST', body: { projeto: idProjeto }
      })
      combos.contasVinculadas = (res.data || []).map(c => ({
        ...c,
        codigo: String(c.codigo),
        descricao: `${c.banco} - AG: ${c.agencia}${c.digitoAgencia ? '-' + c.digitoAgencia : ''} / CT: ${c.conta}${c.digitoConta ? '-' + c.digitoConta : ''}`
      }))
      if (res.data.length === 1) {
        form.contaVinculada = String(res.data[0].codigo)
      } else {
        form.contaVinculada = ''
      }
    } catch(e) { console.error("Erro ao carregar contas", e) }
  }

  const carregarProjetoDaConta = async (idConta: string) => {
    if (!idConta) return
    try {
      const res = await $fetch<{ status: string, data: { projeto: number } }>('/api/operacao/oficio/lancamentoReembolso/projetoPorConta', {
        method: 'POST', body: { conta: idConta }
      })
      if (res.data?.projeto) {
        form.projeto = String(res.data.projeto)
        await carregarContas(form.projeto)
      }
    } catch(e) { console.error("Erro ao carregar projeto da conta", e) }
  }

  const buscarFuncionariosAutoComplete = async () => {
    if (buscaFuncionario.value.length < 3) {
      sugestoesFuncionarios.value = []
      mostrarMenuFuncionario.value = false
      return
    }

    buscandoFuncionario.value = true
    mostrarMenuFuncionario.value = true

    try {
      const res = await $fetch<{ status: string, data: any[] }>('/api/operacao/oficio/lancamentoReembolso/funcionarios', {
        method: 'POST',
        body: {
          termo: buscaFuncionario.value,
          projeto: form.projeto
        }
      })

      if (res.status === 'success') {
        sugestoesFuncionarios.value = res.data || []
      }
    } catch (error) {
      console.error('Erro ao buscar funcionários para autocomplete:', error)
    } finally {
      buscandoFuncionario.value = false
    }
  }

  const selecionarFuncionario = (sugestao: any) => {
    funcionarioTemp.value = {
      codigo: sugestao.codigo,
      nomeCompleto: sugestao.nomeCompleto
    }
    buscaFuncionario.value = sugestao.nomeCompleto
    mostrarMenuFuncionario.value = false
  }

  const addFuncionario = () => {
    if (!funcionarioTemp.value) {
        mostrarAlerta("Atenção", "Pesquise e selecione um funcionário primeiro.")
        return
    }
    
    const existe = form.funcionarios.some(f => f.funcionarioId === funcionarioTemp.value.codigo && f.tipoAlteracao !== 2)
    if (existe) {
        mostrarAlerta("Atenção", "Este funcionário já foi adicionado à lista.")
        return
    }

    form.funcionarios.push({
      codigoFuncionario: 0,
      funcionarioId: funcionarioTemp.value.codigo,
      funcionarioNome: funcionarioTemp.value.nomeCompleto,
      tipoAlteracao: 1,
      selecionadoParaRemover: false
    })

    // Limpei a busca pra permitir adicionar o próximo rápido
    funcionarioTemp.value = null
    buscaFuncionario.value = ''
    sugestoesFuncionarios.value = []
  }

  const removerFuncionariosSelecionados = () => {
    const selecionados = form.funcionarios.filter(f => f.selecionadoParaRemover && f.tipoAlteracao !== 2)
    if (selecionados.length === 0) {
       mostrarAlerta('Seleção Vazia', 'Marque ao menos um funcionário para remover.')
       return
    }

    form.funcionarios.forEach(f => {
      // Marquei como removido (tipo 2) pra o banco saber que é pra deletar
      if (f.selecionadoParaRemover) f.tipoAlteracao = 2
    })
    
    mostrarAlerta('Removido', 'Funcionário(s) removido(s) da lista temporária.')
  }

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    modalAlertaTitulo.value = titulo
    modalAlertaMensagem.value = mensagem
    modalAlertaAberto.value = true
  }

  const fecharModalAlerta = () => {
    modalAlertaAberto.value = false
  }

  const avancarPasso = () => {
    // Validações por etapa
    if (passoAtual.value === 1) {
        if (!form.projeto) return mostrarAlerta("Campo Obrigatório", "Informe o Projeto")
        if (!form.contaVinculada) return mostrarAlerta("Campo Obrigatório", "Informe a Conta vinculada")
        if (!form.tipoMovimentacao) return mostrarAlerta("Campo Obrigatório", "Informe o Tipo de movimentação")
        if (!form.dataMovimentacao) return mostrarAlerta("Campo Obrigatório", "Informe a Data de movimentação")
        if (!form.classificacaoLancamento) return mostrarAlerta("Campo Obrigatório", "Informe a Classificação Lançamento")
        if (!form.valorMovimentacao) return mostrarAlerta("Campo Obrigatório", "Informe o Valor de movimentação")
        if (!form.motivo) return mostrarAlerta("Campo Obrigatório", "Informe o Motivo")
    } else if (passoAtual.value === 2) {
        if (!form.dataOficio) return mostrarAlerta("Campo Obrigatório", "Informe a Data Ofício")
        if (!form.valorOficio) return mostrarAlerta("Campo Obrigatório", "Informe o Valor Ofício")
        if (!form.dataResposta) return mostrarAlerta("Campo Obrigatório", "Informe a Data Resposta")
        if (!form.dataEntrada) return mostrarAlerta("Campo Obrigatório", "Informe a Data Entrada")
        if (!form.status) return mostrarAlerta("Campo Obrigatório", "Informe o Status")
        if (!form.classificacaoOficio) return mostrarAlerta("Campo Obrigatório", "Informe a Classificação Ofício")
        if (!form.numeroOficio) return mostrarAlerta("Campo Obrigatório", "Informe o Nº Ofício")
    }

    if (passoAtual.value < totalPassos) {
        passoAtual.value++
    } else {
        tentarGravar()
    }
  }

  const voltarPasso = () => {
    if (passoAtual.value > 1) {
        passoAtual.value--
    } else {
        voltarParaLista()
    }
  }

  const tentarGravar = () => {
    if (!form.projeto) return mostrarAlerta("Campo Obrigatório", "Informe o Projeto")
    if (!form.contaVinculada) return mostrarAlerta("Campo Obrigatório", "Informe a Conta vinculada")
    if (!form.tipoMovimentacao) return mostrarAlerta("Campo Obrigatório", "Informe o Tipo de movimentação")
    if (!form.dataMovimentacao) return mostrarAlerta("Campo Obrigatório", "Informe a Data de movimentação")
    if (!form.classificacaoLancamento) return mostrarAlerta("Campo Obrigatório", "Informe a Classificação Lançamento")
    if (!form.valorMovimentacao) return mostrarAlerta("Campo Obrigatório", "Informe o Valor de movimentação")
    if (!form.motivo) return mostrarAlerta("Campo Obrigatório", "Informe o Motivo")
    if (!form.dataOficio) return mostrarAlerta("Campo Obrigatório", "Informe a Data Ofício")
    if (!form.valorOficio) return mostrarAlerta("Campo Obrigatório", "Informe o Valor Ofício")
    if (!form.dataResposta) return mostrarAlerta("Campo Obrigatório", "Informe a Data Resposta")
    if (!form.dataEntrada) return mostrarAlerta("Campo Obrigatório", "Informe a Data Entrada")
    if (!form.status) return mostrarAlerta("Campo Obrigatório", "Informe o Status")
    if (!form.classificacaoOficio) return mostrarAlerta("Campo Obrigatório", "Informe a Classificação Ofício")
    if (!form.numeroOficio) return mostrarAlerta("Campo Obrigatório", "Informe o Nº Ofício")

    const temFuncionario = form.funcionarios.some(f => f.tipoAlteracao !== 2)
    if (!temFuncionario) {
      modalConfirmaProjeto.value = true
    } else {
      gravar()
    }
  }

  const gravar = async () => {
    modalConfirmaProjeto.value = false
    salvando.value = true
    try {
      const res = await $fetch<{ status: string, mensagem: string }>('/api/operacao/oficio/lancamentoReembolso/gravar', {
        method: 'POST', body: form
      })
      if (res.status === 'success') {
        router.push('/operacao/oficio/lancamentoReembolso')
      } else {
        mostrarAlerta("Erro ao Gravar", res.mensagem || "Ocorreu um erro ao gravar o lançamento.")
      }
    } catch (error) {
      console.error('Erro ao gravar:', error)
      mostrarAlerta("Erro de Comunicação", "Não foi possível se comunicar com o servidor.")
    } finally {
      salvando.value = false
    }
  }

  const recuperarDados = async () => {
    if (!editando.value) return
    carregandoTela.value = true
    try {
      const resp = await $fetch<{ status: string, data: any }>('/api/operacao/oficio/lancamentoReembolso/recupera', {
        method: 'POST',
        body: { codigo: form.codigo }
      })
      if (resp.status === 'success') {
        const d = resp.data
        form.projeto = d.projeto ? String(d.projeto) : ''
        form.contaVinculada = d.contaVinculada ? String(d.contaVinculada) : ''
        form.tipoMovimentacao = d.tipoMovimentacao ? String(d.tipoMovimentacao) : ''
        form.classificacaoLancamento = d.classificacaoLancamento ? String(d.classificacaoLancamento) : ''
        form.classificacaoOficio = d.classificacaoOficio ? String(d.classificacaoOficio) : ''
        form.status = d.status ? String(d.status) : ''
        
        form.valorMovimentacao = d.valorMovimentacao
        form.dataMovimentacao = d.dataMovimentacao
        form.motivo = d.motivo
        form.dataOficio = d.dataOficio
        form.valorOficio = d.valorOficio
        form.dataResposta = d.dataResposta
        form.dataEntrada = d.dataEntrada
        form.numeroOficio = d.numeroOficio
        form.funcionarios = d.funcionarios || []

        if (form.projeto) await carregarContas(form.projeto)
      }
    } catch (e) {
      console.error("Erro ao recuperar dados", e)
    } finally {
      carregandoTela.value = false
    }
  }

  const limparFormulario = () => {
    router.push('/operacao/oficio/lancamentoReembolso/cadastro?codigo=0')
    Object.assign(form, {
        codigo: '0', projeto: '', contaVinculada: '', tipoMovimentacao: '',
        valorMovimentacao: '', dataMovimentacao: '', classificacaoLancamento: '',
        motivo: '', dataOficio: '', valorOficio: '', dataResposta: '', 
        dataEntrada: '', status: '', classificacaoOficio: '', numeroOficio: '',
        funcionarios: []
    })
  }

  const voltarParaLista = () => router.push('/operacao/oficio/lancamentoReembolso')

  onMounted(async () => {
    carregandoTela.value = true
    await carregarCombos()
    if (editando.value) {
        await recuperarDados()
    }
    carregandoTela.value = false
  })

  // Sincronizei as contas se o projeto mudar (Igual ao Manual)
  watch(() => form.projeto, (novoProjeto) => {
    if (novoProjeto) {
      carregarContas(novoProjeto)
      // Limpei a busca de funcionários se o projeto mudar
      buscaFuncionario.value = ''
      funcionarioTemp.value = null
    } else {
      combos.contasVinculadas = []
      form.contaVinculada = ''
    }
  })

  // Sincronizei o projeto se a conta mudar
  watch(() => form.contaVinculada, (novaConta) => {
    if (novaConta && !form.projeto) {
      carregarProjetoDaConta(novaConta)
    }
  })

  return {
    carregandoTela,
    salvando,
    modalConfirmaProjeto,
    passoAtual,
    totalPassos,
    avancarPasso,
    voltarPasso,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    fecharModalAlerta,
    form,
    editando,
    combos,
    funcionarioTemp,
    buscaFuncionario,
    buscandoFuncionario,
    sugestoesFuncionarios,
    mostrarMenuFuncionario,
    modoVisualizar,
    buscarFuncionariosAutoComplete,
    selecionarFuncionario,
    // Tabela e Paginação de Funcionários
    filtroFuncionario,
    paginaFuncionario,
    itensPorPaginaFuncionario,
    funcionariosFiltrados,
    funcionariosPaginados,
    totalPaginasFuncionario,
    registroInicialFuncionario,
    registroFinalFuncionario,
    paginasExibidasFuncionario,
    todosFuncionariosMarcados,
    marcarDesmarcarTodosFuncionarios,
    // Métodos de apoio
    carregarContas,
    carregarProjetoDaConta,
    addFuncionario,
    removerFuncionariosSelecionados,
    tentarGravar,
    gravar,
    limparFormulario,
    voltarParaLista
  }
}
