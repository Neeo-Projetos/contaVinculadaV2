import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppNotificacao } from '../../../global/useAppNotificacao'

export function useLancamentoManualFormulario() {
  const route = useRoute()
  const router = useRouter()
  const { dispararAlerta } = useAppNotificacao()
  
  const registroId = route.query.id as string
  const carregandoTela = ref(false)
  const salvando = ref(false)
  const modalConfirmaTodosAberto = ref(false)
  
  const erros = reactive(new Set<string>())

  // Configuração de Passos
  const passoAtual = ref(0)
  const passos = ['Informações do Lançamento', 'Vínculo de Funcionários']

  interface FormLancamento {
    codigo: string
    projeto: string
    contaVinculada: string
    tipoMovimentacao: string
    valorMovimentacao: string
    dataMovimentacao: string
    classificacao: string
    motivo: string
    funcionarios: any[]
  }

  const form = reactive<FormLancamento>({
    codigo: registroId || '0',
    projeto: '',
    contaVinculada: '',
    tipoMovimentacao: '',
    valorMovimentacao: '',
    dataMovimentacao: '',
    classificacao: '',
    motivo: '',
    funcionarios: []
  })

  const combos = reactive({
    projetos: [] as any[],
    contasVinculadas: [] as any[],
    tiposMovimentacao: [] as any[],
    classificacoes: [] as any[],
    funcionariosAtivos: [] as any[]
  })

  const funcionarioTemp = ref<any>(null)

  const editando = computed(() => form.codigo !== '0' && !!form.codigo)

  const carregarCombos = async () => {
    try {
      // Carregando individualmente para evitar que uma falha trave tudo
      // E usando os endpoints corretos de listagem/ativos
      
      const resProj = await $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos').catch(() => ({ data: [] }))
      combos.projetos = resProj.data || []

      const resTipo = await $fetch<{ data: any[] }>('/api/tabelaBasica/tipoMovimentacao/listagem', { method: 'POST', body: { ativo: 1 } }).catch(() => ({ data: [] }))
      combos.tiposMovimentacao = resTipo.data || []

      const resClass = await $fetch<{ data: any[] }>('/api/tabelaBasica/classificacao/listagem', { method: 'POST', body: { ativo: 1 } }).catch(() => ({ data: [] }))
      combos.classificacoes = resClass.data || []

      const resFunc = await $fetch<{ data: any[] }>('/api/cadastro/funcionario/listagem', { method: 'POST', body: { ativo: 1 } }).catch(() => ({ data: [] }))
      combos.funcionariosAtivos = resFunc.data || []

    } catch (error) {
      console.error("Erro ao carregar combos", error)
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
      if (res.data.length === 1) {
        form.contaVinculada = String(res.data[0].codigo)
      } else {
        form.contaVinculada = ''
      }
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

  const recuperarDadosParaEdicao = async () => {
    if (!editando.value) return
    carregandoTela.value = true
    try {
      const res = await $fetch<{ status: string, data: any }>('/api/operacao/movimentacaoBancaria/lancamentoManual/recupera', {
        method: 'POST', body: { codigo: form.codigo }
      })
      if (res.status === 'success') {
        const d = res.data
        form.projeto = String(d.projeto)
        form.contaVinculada = d.contaVinculada
        form.tipoMovimentacao = d.tipoMovimentacao
        form.valorMovimentacao = d.valorMovimentacao
        form.dataMovimentacao = d.dataMovimentacao
        form.classificacao = d.classificacao
        form.motivo = d.motivo
        form.funcionarios = d.funcionarios || []
        
        await carregarContas(form.projeto)
      }
    } catch (e) {
      console.error(e)
    } finally {
      carregandoTela.value = false
    }
  }

  const validarPasso0 = () => {
    erros.clear()

    if (!form.projeto) {
      erros.add('projeto')
      dispararAlerta('Campo Obrigatório', 'Selecione o Projeto para continuar.', 'warning')
      return false
    }

    if (!form.contaVinculada) {
      erros.add('contaVinculada')
      dispararAlerta('Campo Obrigatório', 'Selecione a Conta Vinculada.', 'warning')
      return false
    }

    if (!form.tipoMovimentacao) {
      erros.add('tipoMovimentacao')
      dispararAlerta('Campo Obrigatório', 'Selecione o Tipo de Movimentação.', 'warning')
      return false
    }

    if (!form.valorMovimentacao || form.valorMovimentacao === '0' || form.valorMovimentacao === '0,00') {
      erros.add('valorMovimentacao')
      dispararAlerta('Campo Obrigatório', 'Informe o Valor da movimentação.', 'warning')
      return false
    }

    if (!form.dataMovimentacao) {
      erros.add('dataMovimentacao')
      dispararAlerta('Campo Obrigatório', 'Informe a Data da movimentação.', 'warning')
      return false
    }

    if (!form.classificacao) {
      erros.add('classificacao')
      dispararAlerta('Campo Obrigatório', 'Selecione a Classificação.', 'warning')
      return false
    }

    if (!form.motivo) {
      erros.add('motivo')
      dispararAlerta('Campo Obrigatório', 'Informe o Motivo / Observação.', 'warning')
      return false
    }

    return true
  }

  const avancarPasso = () => {
    if (passoAtual.value === 0) {
      if (validarPasso0()) {
        passoAtual.value = 1
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
      const res = await $fetch<{ status: string, mensagem: string }>('/api/operacao/movimentacaoBancaria/lancamentoManual/gravar', {
        method: 'POST', body: form
      })
      if (res.status === 'success') {
        dispararAlerta('Tudo Certo!', 'Lançamento registrado com sucesso!', 'success')
        setTimeout(() => {
          voltarParaLista()
        }, 1500)
      } else {
        dispararAlerta('Erro ao Gravar', res.mensagem || 'Não foi possível salvar o lançamento.', 'error')
      }
    } catch (error) {
      console.error('Erro ao gravar:', error)
      dispararAlerta('Erro Interno', 'Erro ao processar sua solicitação no servidor.', 'error')
    } finally {
      salvando.value = false
    }
  }

  const addFuncionario = () => {
    if (!funcionarioTemp.value) {
       dispararAlerta('Atenção', 'Selecione um funcionário primeiro.', 'warning')
       return
    }
    
    const existe = form.funcionarios.some(f => f.funcionarioId === funcionarioTemp.value.codigo && f.tipoAlteracao !== 2)
    if (existe) {
       dispararAlerta('Atenção', 'Este funcionário já foi adicionado à lista.', 'info')
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
    const selecionados = form.funcionarios.filter(f => f.selecionadoParaRemover && f.tipoAlteracao !== 2)
    if (selecionados.length === 0) {
       dispararAlerta('Seleção Vazia', 'Marque ao menos um funcionário para remover.', 'warning')
       return
    }

    form.funcionarios.forEach(f => {
      if (f.selecionadoParaRemover) f.tipoAlteracao = 2
    })
    
    dispararAlerta('Removido', 'Funcionário(s) removido(s) da lista temporária.', 'success')
  }

  const voltarParaLista = () => router.push('/operacao/movimentacaoBancaria/lancamentoManual')

  const novoRegistro = () => {
    router.push('/operacao/movimentacaoBancaria/lancamentoManual/cadastro?id=0')
    passoAtual.value = 0
    Object.assign(form, {
      codigo: '0',
      projeto: '',
      contaVinculada: '',
      tipoMovimentacao: '',
      valorMovimentacao: '',
      dataMovimentacao: '',
      classificacao: '',
      motivo: '',
      funcionarios: []
    })
  }

  onMounted(() => {
    carregarCombos()
    if (editando.value) {
      recuperarDadosParaEdicao()
    }
  })

  // Sincronização automática de contas ao mudar projeto
  watch(() => form.projeto, (novoProjeto) => {
    if (novoProjeto) {
      carregarContas(novoProjeto)
    } else {
      combos.contasVinculadas = []
      form.contaVinculada = ''
    }
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
