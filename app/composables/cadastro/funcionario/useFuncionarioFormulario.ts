import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useFuncionarioFormulario() {
  const route = useRoute()
  const router = useRouter()
  
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

  const form = reactive({
    codigo: codigoRaw ? parseInt(codigoRaw as string) : 0,
    nomeCompleto: '',
    cpf: '',
    matricula: '',
    email: '',
    projeto: ''
  })

  const editando = computed(() => !!form.codigo)

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    modalAlertaTitulo.value = titulo
    modalAlertaMensagem.value = mensagem
    modalAlertaAberto.value = true
  }

  const fecharModalAlerta = () => {
    modalAlertaAberto.value = false
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
          form.projeto = d.projeto
          
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
    if (cpfInvalido.value || emailInvalido.value) {
      mostrarAlerta('Atenção', 'Por favor, ajuste os campos com erro (CPF ou E-mail) antes de gravar.')
      return 
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