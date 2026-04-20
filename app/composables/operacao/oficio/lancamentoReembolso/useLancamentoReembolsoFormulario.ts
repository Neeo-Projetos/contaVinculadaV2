import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useLancamentoReembolsoFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const codigo = route.query.codigo
  const editando = computed(() => !!form.codigo && form.codigo !== '0')

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

  // Combos
  const projetos = ref<any[]>([])
  const contasVinculadas = ref<any[]>([])
  const tiposMovimentacao = ref<any[]>([])
  const classificacoes = ref<any[]>([])
  const funcionariosAtivos = ref<any[]>([])
  const statusList = ref<any[]>([])
  const funcionarioTemp = ref<any>('')

  const projetosFormatados = computed(() => {
    return projetos.value.map(p => ({
      codigo: p.codigo,
      label: `${p.apelido} - ${p.descricao}`
    }))
  })

  const formatarValor = (campo: 'valorMovimentacao' | 'valorOficio') => {
    form[campo] = String(form[campo]).replace(/[^0-9.,]/g, "")
  }

  const carregarCombos = async () => {
    try {
      const [resProj, resTipo, resClass, resFunc, resStatus] = await Promise.all([
        $fetch<{data: any[]}>('/api/cadastro/projeto/ativos'),
        $fetch<any[]>('/api/tabelaBasica/tipoMovimentacao/recupera'),
        $fetch<{data: any[]}>('/api/tabelaBasica/classificacao/ativos'),
        $fetch<{data: any[]}>('/api/cadastro/funcionario/ativos'),
        $fetch<{data: any[]}>('/api/tabelaBasica/status/ativos') 
      ])
      projetos.value = resProj.data || []
      tiposMovimentacao.value = resTipo || []
      classificacoes.value = resClass.data || []
      funcionariosAtivos.value = resFunc.data || []
      statusList.value = (resStatus.data || []).filter((s:any) => s.codigo === 1 || s.codigo === 3)
    } catch (e) { console.error("Erro ao carregar combos", e) }
  }

  const carregarContas = async (idProjeto: string) => {
    try {
      const res = await $fetch<any[]>('/api/operacao/movimentacaoBancaria/lancamentoManual/contasPorProjeto', {
        method: 'POST', body: { projeto: idProjeto }
      })
      contasVinculadas.value = (res || []).map(c => ({
        ...c,
        label: `${c.agencia}/${c.conta} - ${c.banco}`
      }))
      if (res.length === 1) form.contaVinculada = res[0].codigo
    } catch(e) { console.error("Erro ao carregar contas", e) }
  }

  const carregarProjetoDaConta = async (idConta: string) => {
    try {
      const res = await $fetch<{projeto: number}>('/api/operacao/movimentacaoBancaria/lancamentoManual/projetoPorConta', {
        method: 'POST', body: { conta: idConta }
      })
      if(res.projeto) form.projeto = String(res.projeto)
    } catch(e) { console.error("Erro ao carregar projeto da conta", e) }
  }

  const addFuncionario = () => {
    if (!funcionarioTemp.value) {
        mostrarAlerta("Atenção", "Selecione um funcionário.")
        return
    }
    
    const existe = form.funcionarios.some(f => f.funcionarioId === funcionarioTemp.value.codigo && f.tipoAlteracao !== 2)
    if (existe) {
        mostrarAlerta("Atenção", "Este funcionário já foi adicionado.")
        return
    }

    form.funcionarios.push({
      codigoFuncionario: 0,
      funcionarioId: funcionarioTemp.value.codigo,
      funcionarioNome: funcionarioTemp.value.nomeCompleto,
      tipoAlteracao: 1,
      selecionadoParaRemover: false
    })
    funcionarioTemp.value = ''
  }

  const removerFuncionario = () => {
    form.funcionarios.forEach(f => {
      if (f.selecionadoParaRemover) f.tipoAlteracao = 2
    })
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
        Object.assign(form, resp.data)
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
    projetos,
    contasVinculadas,
    tiposMovimentacao,
    classificacoes,
    funcionariosAtivos,
    statusList,
    funcionarioTemp,
    projetosAtivos: projetos, // Adicionando o alias ou retorno direto
    projetosFormatados,
    formatarValor,
    carregarContas,
    carregarProjetoDaConta,
    addFuncionario,
    removerFuncionario,
    tentarGravar,
    gravar,
    limparFormulario,
    voltarParaLista
  }
}
