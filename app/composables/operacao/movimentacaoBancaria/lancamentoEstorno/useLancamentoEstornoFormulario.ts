import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useLancamentoEstornoFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const registroId = route.query.id as string
  const carregandoTela = ref(false)
  const salvando = ref(false)
  const modalConfirmaTodosAberto = ref(false)
  const modalSucessoAberto = ref(false)
  
  const modalAlertaAberto = ref(false)
  const modalAlertaMensagem = ref('')
  
  const erros = reactive(new Set<string>())

  // Configuração de Passos
  const passoAtual = ref(0)
  const passos = ['Informações do Reembolso', 'Vínculo de Funcionários']

  interface FormReembolso {
    codigo: string
    projeto: string
    contaVinculada: string
    tipoMovimentacao: string
    valorMovimentacao: string
    dataMovimentacao: string
    classificacaoLancamento: string
    motivo: string
    // Campos Ofício
    numeroOficio: string
    dataOficio: string
    valorOficio: string
    status: string
    dataResposta: string
    dataEntrada: string
    classificacaoOficio: string
    funcionarios: any[]
  }

  const form = reactive<FormReembolso>({
    codigo: registroId || '0',
    projeto: '',
    contaVinculada: '',
    tipoMovimentacao: '',
    valorMovimentacao: '',
    dataMovimentacao: '',
    classificacaoLancamento: '',
    motivo: '',
    numeroOficio: '',
    dataOficio: '',
    valorOficio: '',
    status: '1',
    dataResposta: '',
    dataEntrada: '',
    classificacaoOficio: '',
    funcionarios: []
  })

  const combos = reactive({
    projetos: [] as any[],
    contasVinculadas: [] as any[],
    tiposMovimentacao: [] as any[],
    classificacoes: [] as any[],
    funcionariosAtivos: [] as any[],
    statusList: [
      { codigo: '1', descricao: 'Pendente' },
      { codigo: '2', descricao: 'Em Análise' },
      { codigo: '3', descricao: 'Aprovado' },
      { codigo: '4', descricao: 'Reprovado' }
    ]
  })

  const funcionarioTemp = ref<any>(null)

  const editando = computed(() => form.codigo !== '0' && !!form.codigo)

  const carregarCombos = async () => {
    carregandoTela.value = true
    try {
      const [resProj, resTipo, resClass, resFunc] = await Promise.all([
        $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos'),
        $fetch<any[]>('/api/tabelaBasica/tipoMovimentacao/ativos'),
        $fetch<{ data: any[] }>('/api/tabelaBasica/classificacao/ativos'),
        $fetch<{ data: any[] }>('/api/cadastro/funcionario/ativos')
      ])
      combos.projetos = resProj.data || []
      combos.tiposMovimentacao = resTipo || []
      combos.classificacoes = resClass.data || []
      combos.funcionariosAtivos = resFunc.data || []

      if (editando.value) {
         // Carregar dados se for edição (opcional agora)
      }
    } catch (error) {
      console.error("Erro ao carregar combos", error)
    } finally {
      carregandoTela.value = false
    }
  }

  const carregarContas = async (idProjeto: string) => {
    if (!idProjeto) {
      combos.contasVinculadas = []
      return
    }
    try {
      const res = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoManual/contasPorProjeto', {
        method: 'POST', body: { projeto: idProjeto }
      })
      combos.contasVinculadas = res.data || []
      if (res.data.length === 1) form.contaVinculada = res.data[0].codigo
    } catch (e) { console.error(e) }
  }

  const carregarProjetoDaConta = async (idConta: string) => {
    if (!idConta) return
    try {
      const res = await $fetch<{ status: string, data: { projeto: number } }>('/api/operacao/movimentacaoBancaria/lancamentoManual/projetoPorConta', {
        method: 'POST', body: { conta: idConta }
      })
      if (res.data?.projeto) {
        form.projeto = String(res.data.projeto)
        await carregarContas(form.projeto)
      }
    } catch (e) { console.error(e) }
  }

  const validarPasso0 = () => {
    erros.clear()
    if (!form.projeto) erros.add('projeto')
    if (!form.contaVinculada) erros.add('contaVinculada')
    if (!form.tipoMovimentacao) erros.add('tipoMovimentacao')
    if (!form.valorMovimentacao) erros.add('valorMovimentacao')
    if (!form.dataMovimentacao) erros.add('dataMovimentacao')
    if (!form.numeroOficio) erros.add('numeroOficio')
    if (!form.dataOficio) erros.add('dataOficio')
    if (!form.classificacaoLancamento) erros.add('classificacaoLancamento')

    return erros.size === 0
  }

  const avancarPasso = () => {
    if (passoAtual.value === 0) {
      if (validarPasso0()) {
        passoAtual.value = 1
      } else {
        modalAlertaMensagem.value = 'Preencha os campos obrigatórios para continuar.'
        modalAlertaAberto.value = true
      }
    }
  }

  const voltarPasso = () => {
    if (passoAtual.value > 0) {
      passoAtual.value--
    } else {
      voltarParaLista()
    }
  }

  const tentarGravar = () => {
    const temFuncionario = form.funcionarios.some(f => f.tipoAlteracao !== 2)
    if (!temFuncionario) {
      modalConfirmaTodosAberto.value = true
    } else {
      gravar()
    }
  }

  const gravar = async () => {
    modalConfirmaTodosAberto.value = false
    salvando.value = true
    try {
      // ValorOficio = ValorMovimentacao se não preenchido? Normalmente sim em reembolso.
      if (!form.valorOficio) form.valorOficio = form.valorMovimentacao

      const res = await $fetch<{ status: string, message: string }>('/api/operacao/oficio/lancamentoReembolso/gravar', {
        method: 'POST', body: form
      })
      if (res.status === 'success') {
        modalSucessoAberto.value = true
      } else {
        modalAlertaMensagem.value = res.message || 'Erro ao gravar registro.'
        modalAlertaAberto.value = true
      }
    } catch (error) {
      console.error('Erro ao gravar:', error)
      modalAlertaMensagem.value = 'Erro interno ao gravar dados.'
      modalAlertaAberto.value = true
    } finally {
      salvando.value = false
    }
  }

  const addFuncionario = () => {
    if (!funcionarioTemp.value) return
    
    const existe = form.funcionarios.some(f => f.funcionarioId === funcionarioTemp.value.codigo && f.tipoAlteracao !== 2)
    if (existe) {
       modalAlertaMensagem.value = 'Funcionário já adicionado à lista.'
       modalAlertaAberto.value = true
       return
    }

    form.funcionarios.push({
      codigoFuncionario: 0,
      funcionarioId: funcionarioTemp.value.codigo,
      funcionarioNome: funcionarioTemp.value.nomeCompleto,
      tipoAlteracao: 1,
      selecionadoParaRemover: false
    })
    funcionarioTemp.value = null
  }

  const removerFuncionariosSelecionados = () => {
    form.funcionarios.forEach(f => {
      if (f.selecionadoParaRemover) f.tipoAlteracao = 2
    })
  }

  const voltarParaLista = () => router.push('/operacao/movimentacaoBancaria/lancamentoEstorno')

  const novoRegistro = () => {
    router.push('/operacao/movimentacaoBancaria/lancamentoEstorno/cadastro?id=0')
    passoAtual.value = 0
    Object.assign(form, {
      codigo: '0',
      projeto: '',
      contaVinculada: '',
      tipoMovimentacao: '',
      valorMovimentacao: '',
      dataMovimentacao: '',
      classificacaoLancamento: '',
      motivo: '',
      numeroOficio: '',
      dataOficio: '',
      valorOficio: '',
      status: '1',
      dataResposta: '',
      dataEntrada: '',
      classificacaoOficio: '',
      funcionarios: []
    })
  }

  onMounted(() => {
    carregarCombos()
  })

  return {
    form,
    combos,
    carregandoTela,
    salvando,
    editando,
    erros,
    passoAtual,
    passos,
    avancarPasso,
    voltarPasso,
    modalConfirmaTodosAberto,
    modalSucessoAberto,
    modalAlertaAberto,
    modalAlertaMensagem,
    funcionarioTemp,
    carregarContas,
    carregarProjetoDaConta,
    tentarGravar,
    gravar,
    addFuncionario,
    removerFuncionariosSelecionados,
    voltarParaLista,
    novoRegistro
  }
}
