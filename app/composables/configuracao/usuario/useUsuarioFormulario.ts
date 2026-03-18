import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useUsuarioFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const codigoRaw = route.query.codigo
  const editando = computed(() => !!form.codigo)

  const carregandoTela = ref(false)
  const salvando = ref(false)
  const carregandoExclusao = ref(false)
  const modalExclusaoAberto = ref(false)
  
  // Controle de Passos (Padrão Ouro)
  const passoAtual = ref(1)
  const totalPassos = 3
  
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')

  const form = reactive({
    codigo: codigoRaw ? parseInt(codigoRaw as string) : 0,
    nomeUsuario: '',
    cpf: '',
    telefone: '',
    email: '',
    login: '',
    senha: '',
    restauraSenha: 0,
    projetos: [] as number[],
    ativo: 1
  })

  const senhaConfirma = ref('')
  const projetosAtivos = ref<any[]>([])

  const carregarProjetos = async () => {
    try {
      const data = await $fetch<any>('/api/cadastro/projeto/ativos')
      projetosAtivos.value = data?.data || []
    } catch (e) {
      console.error('Erro ao carregar projetos:', e)
    }
  }

  const carregarDados = async () => {
    if (form.codigo) {
      carregandoTela.value = true
      try {
        const data = await $fetch<any>(`/api/configuracao/usuario/recupera?codigo=${form.codigo}`)
        if (data && data.status === 'success') {
          const d = data.data
          form.nomeUsuario = d.nomeUsuario
          form.cpf = d.cpf
          form.telefone = d.telefone || ''
          form.email = d.email
          form.login = d.login
          form.restauraSenha = Number(d.restauraSenha)
          form.projetos = d.projetos || []
          form.ativo = d.ativo ? 1 : 0
        } else {
          mostrarAlerta('Erro ao Carregar', data?.mensagem || 'Erro ao carregar dados do usuário.')
        }
      } catch (e) {
        console.error('Erro ao carregar usuário:', e)
      } finally {
        carregandoTela.value = false
      }
    }
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
        if (!form.nomeUsuario) return mostrarAlerta("Campo Obrigatório", "Informe o Nome do Usuário")
        if (!form.cpf) return mostrarAlerta("Campo Obrigatório", "Informe o CPF")
        if (!form.email) return mostrarAlerta("Campo Obrigatório", "Informe o E-mail")
    } else if (passoAtual.value === 2) {
        if (!form.login) return mostrarAlerta("Campo Obrigatório", "Informe o Login")
        
        if (form.senha && form.senha !== senhaConfirma.value) {
            mostrarAlerta('Atenção', 'A confirmação da senha deve ser igual à senha informada.')
            return
        }
        if (!editando.value && !form.senha) {
            mostrarAlerta('Atenção', 'A senha é obrigatória para novos usuários.')
            return
        }
    }

    if (passoAtual.value < totalPassos) {
        passoAtual.value++
    } else {
        gravarRegistro()
    }
  }

  const voltarPasso = () => {
    if (passoAtual.value > 1) {
        passoAtual.value--
    } else {
        voltarParaLista()
    }
  }

  const gravarRegistro = async () => {
    if (form.senha && form.senha !== senhaConfirma.value) {
      mostrarAlerta('Atenção', 'A confirmação da senha deve ser igual à senha informada.')
      return
    }

    if (!isEditing.value && !form.senha) {
        mostrarAlerta('Atenção', 'A senha é obrigatória para novos usuários.')
        return
    }

    salvando.value = true
    try {
      const data = await $fetch<any>('/api/configuracao/usuario/gravar', {
        method: 'POST',
        body: form
      })
      if (data.status === 'success') {
        voltarParaLista()
      } else {
        mostrarAlerta('Erro ao Gravar', data.mensagem || 'Ocorreu um erro ao gravar o usuário.')
      }
    } catch (e: any) {
      mostrarAlerta('Erro de Servidor', e.data?.statusMessage || 'Erro de comunicação ao gravar.')
    } finally {
      salvando.value = false
    }
  }

  const excluirRegistro = async () => {
    carregandoExclusao.value = true
    try {
      const data = await $fetch<any>('/api/configuracao/usuario/excluir', {
        method: 'POST',
        body: { codigo: form.codigo }
      })
      if (data.status === 'success') {
        voltarParaLista()
      } else {
        mostrarAlerta('Erro ao Excluir', data.mensagem)
      }
    } catch (e: any) {
      mostrarAlerta('Erro de Servidor', e.data?.statusMessage || 'Erro de comunicação ao excluir.')
    } finally {
      carregandoExclusao.value = false
      modalExclusaoAberto.value = false
    }
  }

  const limparFormulario = () => {
    router.push('/configuracao/usuario/cadastro')
    Object.assign(form, {
      codigo: 0,
      nomeUsuario: '',
      cpf: '',
      telefone: '',
      email: '',
      login: '',
      senha: '',
      restauraSenha: 0,
      projetos: [],
      ativo: 1
    })
    senhaConfirma.value = ''
  }

  const voltarParaLista = () => {
    router.push('/configuracao/usuario')
  }

  const isEditing = computed(() => !!form.codigo)

  onMounted(async () => {
    carregandoTela.value = true
    await carregarProjetos()
    await carregarDados()
    carregandoTela.value = false
  })

  return {
    carregandoTela,
    salvando,
    carregandoExclusao,
    modalExclusaoAberto,
    passoAtual,
    totalPassos,
    avancarPasso,
    voltarPasso,
    form,
    senhaConfirma,
    projetosAtivos,
    editando: isEditing,
    isEditing,
    
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    fecharModalAlerta,

    carregarProjetos,
    carregarDados,
    gravarRegistro,
    excluirRegistro,
    limparFormulario,
    voltarParaLista
  }
}
