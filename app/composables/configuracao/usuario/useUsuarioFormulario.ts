import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface UsuarioForm {
    codigo: number;
    nomeUsuario: string;
    cpf: string;
    telefone: string;
    email: string;
    login: string;
    senha?: string;
    restauraSenha: number;
    projetos: number[];
    ativo: number;
}

export function useUsuarioFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const codigoRaw = route.query.codigo
  const modoVisualizar = computed(() => route.query.modo === 'visualizar')
  const irParaEdicao = () => router.push({ path: route.path, query: { ...route.query, modo: undefined } })

  const form = reactive<UsuarioForm>({
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
  
  const modalSucessoAberto = ref(false)
  const erros = ref(new Set<string>())

  const senhaConfirma = ref('')
  const projetosAtivos = ref<any[]>([])
  
  // Paginação e Filtro de Projetos
  const filtroProjetos = ref('')

  const projetosFiltrados = computed(() => {
    if (!filtroProjetos.value) return projetosAtivos.value
    const termo = filtroProjetos.value.toLowerCase()
    return projetosAtivos.value.filter(p => 
      p.apelido.toLowerCase().includes(termo) || 
      p.descricao.toLowerCase().includes(termo)
    )
  })

  // Hook padrão Ouro de paginação
  const visaoProjetos = ref<'lista'>('lista')
  const paginacaoProjetos = usePaginacaoFrontEnd(projetosFiltrados, visaoProjetos)

  watch(filtroProjetos, () => {
    paginacaoProjetos.mudarPagina(1)
  })

  const todosProjetosMarcados = computed(() => {
    if (paginacaoProjetos.listaPaginada.value.length === 0) return false
    return paginacaoProjetos.listaPaginada.value.every((p: any) => form.projetos.includes(p.codigo))
  })

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
    erros.value.clear()
    
    // Validações por etapa
    if (passoAtual.value === 1) {
        if (!form.nomeUsuario) erros.value.add("nomeUsuario")
        if (!form.cpf) erros.value.add("cpf")
        if (!form.email) erros.value.add("email")
    } else if (passoAtual.value === 2) {
        if (!form.login) erros.value.add("login")
        
        if (form.senha && form.senha !== senhaConfirma.value) {
            mostrarAlerta('Atenção', 'A confirmação da senha deve ser igual à senha informada.')
            return
        }
        if (!editando.value && !form.senha) {
            erros.value.add("senha")
        }
    } else if (passoAtual.value === 3) {
        if (!form.projetos || form.projetos.length === 0) {
            mostrarAlerta("Atenção: Projetos", "É obrigatório vincular pelo menos um projeto ao usuário.")
            return
        }
    }

    if (erros.value.size > 0) {
        mostrarAlerta("Campos Obrigatórios", "Por favor, preencha todos os campos destacados em vermelho.")
        return
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

  const marcarDesmarcarTodosProjetos = () => {
    const marcar = !todosProjetosMarcados.value
    paginacaoProjetos.listaPaginada.value.forEach((p: any) => {
        const index = form.projetos.indexOf(p.codigo)
        if (marcar && index === -1) {
            form.projetos.push(p.codigo)
        } else if (!marcar && index > -1) {
            form.projetos.splice(index, 1)
        }
    })
  }

  const gravarRegistro = async () => {
    if (form.senha && form.senha !== senhaConfirma.value) {
      mostrarAlerta('Atenção', 'A confirmação da senha deve ser igual à senha informada.')
      return
    }

    salvando.value = true
    try {
      const data = await $fetch<any>('/api/configuracao/usuario/gravar', {
        method: 'POST',
        body: form
      })
      if (data.status === 'success') {
        modalSucessoAberto.value = true
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
    passoAtual.value = 1
    filtroProjetos.value = ''
    paginacaoProjetos.mudarPagina(1)
  }

  const voltarParaLista = () => {
    router.push('/configuracao/usuario')
  }

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
    editando,
    modoVisualizar,
    irParaEdicao,
    
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    fecharModalAlerta,

    modalSucessoAberto,
    erros,
    
    // Paginação e Filtros
    filtroProjetos,
    projetosPaginados: paginacaoProjetos.listaPaginada,
    projetosFiltrados,
    paginaProjetos: paginacaoProjetos.paginaAtual,
    totalPaginasProjetos: paginacaoProjetos.totalPaginas,
    itensPorPaginaProjetos: paginacaoProjetos.itensPorPagina,
    registroInicialProjetos: paginacaoProjetos.registroInicial,
    registroFinalProjetos: paginacaoProjetos.registroFinal,
    paginasExibidasProjetos: paginacaoProjetos.paginasExibidas,
    todosProjetosMarcados,
    mudarPaginaProjetos: paginacaoProjetos.mudarPagina,
    mudarItensPorPaginaProjetos: paginacaoProjetos.mudarItensPorPagina,
    marcarDesmarcarTodosProjetos,

    carregarProjetos,
    carregarDados,
    gravarRegistro,
    excluirRegistro,
    limparFormulario,
    voltarParaLista
  }
}
