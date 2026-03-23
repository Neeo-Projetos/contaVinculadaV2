import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppNotificacao } from '~/composables/global/useAppNotificacao'

export function useFuncionarioFormulario() {
  const route = useRoute()
  const router = useRouter()
  const { dispararAlerta } = useAppNotificacao()
  
  const codigoRaw = route.query.codigo

  const carregandoTela = ref(false)
  const carregandoGravacao = ref(false)
  const carregandoExclusao = ref(false)
  const modalExclusaoAberto = ref(false)
  const projetosAtivos = ref<any[]>([])

  const cpfInvalido = ref(false)
  const emailInvalido = ref(false)

  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')

  interface FuncionarioForm {
    codigo: number
    nomeCompleto: string
    cpf: string
    matricula: string
    email: string
    projeto: string | number
    ativo: number | boolean
  }

  const form = reactive<FuncionarioForm>({
    codigo: codigoRaw ? parseInt(codigoRaw as string) : 0,
    nomeCompleto: '',
    cpf: '',
    matricula: '',
    email: '',
    projeto: '',
    ativo: 1
  })

  const editando = computed(() => !!form.codigo)

  const projetosFormatados = computed(() => {
    return projetosAtivos.value.map(p => ({
      codigo: p.id || p.codigo,
      label: `${p.apelido} - ${p.descricao}`
    }))
  })

  const mostrarAlerta = (titulo: string, mensagem: string, tipo: any = 'error') => {
    dispararAlerta(titulo, mensagem, tipo)
  }

  const fecharModalAlerta = () => {
    // Mantido para compatibilidade, mas agora usa toast
  }

  const carregarProjetos = async () => {
    try {
      const data = await $fetch<any>('/api/cadastro/projeto/ativos')
      projetosAtivos.value = data?.data || []
    } catch (e) { console.error(e) }
  }

  const carregarDados = async () => {
    if (form.codigo) {
      carregandoTela.value = true
      try {
        const data = await $fetch<any>(`/api/cadastro/funcionario/recupera?codigo=${form.codigo}`)
        if (data && data.status === 'success') {
          const d = data.data
          form.nomeCompleto = d.nomeCompleto
          form.cpf = d.cpf
          form.matricula = d.matricula
          form.email = d.email
          form.projeto = d.projeto ? Number(d.projeto) : ''
          form.ativo = d.ativo
          
          cpfInvalido.value = false
          emailInvalido.value = false
        } else {
          mostrarAlerta('Erro ao Carregar', data?.mensagem || 'Erro ao carregar os dados do funcionário.')
        }
      } catch (e) { console.error(e) } finally { carregandoTela.value = false }
    }
  }

  const voltarParaLista = () => {
    router.push('/cadastro/funcionario')
  }

  const limparFormulario = () => {
    router.push('/cadastro/funcionario/cadastro')
    form.codigo = 0
    form.nomeCompleto = ''
    form.cpf = ''
    form.matricula = ''
    form.email = ''
    form.projeto = ''
    
    
    cpfInvalido.value = false
    emailInvalido.value = false
  }

  const abrirModalExclusao = () => { modalExclusaoAberto.value = true }
  const fecharModal = () => { modalExclusaoAberto.value = false }

  const gravarRegistro = async () => {
    // Validação sequencial de campos obrigatórios
    if (!form.nomeCompleto) {
      dispararAlerta('Dados Incompletos', 'Por favor, informe o Nome Completo do colaborador.', 'warning')
      return { erro: true, campo: 'nomeCompleto' }
    }
    if (!form.cpf) {
      dispararAlerta('Dados Incompletos', 'Por favor, informe o CPF.', 'warning')
      return { erro: true, campo: 'cpf' }
    }
    if (cpfInvalido.value) {
      dispararAlerta('Atenção', 'O CPF informado é inválido. Por favor, verifique.', 'warning')
      return { erro: true, campo: 'cpf' }
    }
    if (!form.matricula) {
      dispararAlerta('Dados Incompletos', 'Por favor, informe a Matrícula.', 'warning')
      return { erro: true, campo: 'matricula' }
    }
    if (!form.email) {
      dispararAlerta('Dados Incompletos', 'Por favor, informe o E-mail.', 'warning')
      return { erro: true, campo: 'email' }
    }
    if (emailInvalido.value) {
      dispararAlerta('Atenção', 'O E-mail informado é inválido.', 'warning')
      return { erro: true, campo: 'email' }
    }
    if (!form.projeto) {
      dispararAlerta('Dados Incompletos', 'Por favor, selecione o Projeto Responsável.', 'warning')
      return { erro: true, campo: 'projeto' }
    }

    carregandoGravacao.value = true
    try {
      const data = await $fetch<any>('/api/cadastro/funcionario/gravar', { method: 'POST', body: form })
      if (data.status === 'success') {
        voltarParaLista()
      } else { 
        mostrarAlerta('Erro ao Gravar', data.mensagem || 'Ocorreu um erro desconhecido ao tentar gravar.') 
      }
    } catch (e: any) { 
      mostrarAlerta('Erro Interno', e.data?.statusMessage || 'Erro de comunicação ao gravar.') 
    } finally { 
      carregandoGravacao.value = false 
    }
  }

  const excluirRegistro = async () => {
    carregandoExclusao.value = true
    try {
      const data = await $fetch<any>('/api/cadastro/funcionario/excluir', { method: 'POST', body: { codigo: form.codigo } })
      if (data.status === 'success') { 
        voltarParaLista() 
      } else { 
        mostrarAlerta('Erro ao Excluir', data.mensagem) 
      }
    } catch (e: any) { 
      mostrarAlerta('Erro Interno', e.data?.statusMessage || 'Erro de comunicação ao excluir.') 
    } finally { 
      carregandoExclusao.value = false
      fecharModal() 
    }
  }

  return {
    carregandoTela,
    carregandoGravacao,
    carregandoExclusao,
    modalExclusaoAberto,
    cpfInvalido,   
    emailInvalido, 
    modalAlertaAberto, 
    modalAlertaTitulo,
    modalAlertaMensagem,
    form,
    editando,
    projetosAtivos,
    projetosFormatados,
    carregarProjetos,
    carregarDados,
    voltarParaLista,
    limparFormulario,
    abrirModalExclusao,
    fecharModal,
    fecharModalAlerta,
    gravarRegistro,
    excluirRegistro
  }
}