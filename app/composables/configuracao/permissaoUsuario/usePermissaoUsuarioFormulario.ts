import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function usePermissaoUsuarioFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const usuarioId = route.query.codigo as string || route.query.id as string || '0'
  const modoVisualizar = computed(() => route.query.modo === 'visualizar')
  const irParaEdicao = () => router.push({ path: route.path, query: { ...route.query, modo: undefined } })

  const carregandoTela = ref(false)
  const carregandoGravacao = ref(false)
  const carregandoExclusao = ref(false)
  const modalExclusaoAberto = ref(false)
  const modalSucessoAberto = ref(false)
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')

  const erros = reactive(new Set<string>())
  const menusDisponiveis = ref<any[]>([])

  interface PermissaoForm {
    usuarioId: string;
    usuarioNome: string;
    menuSelecionado: string;
    permissoes: any[];
    ativo: boolean;
  }

  const form = reactive<PermissaoForm>({
    usuarioId: usuarioId || '0',
    usuarioNome: '',
    menuSelecionado: '',
    permissoes: [],
    ativo: true
  })

  // Editando = it has a valid user ID inherited from the list.
  const editando = computed(() => form.usuarioId !== '0')
  const possuiMarcacao = computed(() => form.permissoes.some(p => p.marcado))
  const todosMarcados = computed(() => form.permissoes.length > 0 && form.permissoes.every(p => p.marcado))

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    modalAlertaTitulo.value = titulo
    modalAlertaMensagem.value = mensagem
    modalAlertaAberto.value = true
  }

  const fecharModalAlerta = () => modalAlertaAberto.value = false
  const abrirModalExclusao = () => {
    if (!form.permissoes.some(p => p.marcado)) {
      mostrarAlerta('Atenção', 'Selecione as permissões que deseja revogar antes.')
      return
    }
    modalExclusaoAberto.value = true
  }
  const fecharModal = () => modalExclusaoAberto.value = false

  const carregarDadosIniciais = async () => {
    carregandoTela.value = true
    try {
      const promises: any[] = [
        $fetch<any>('/api/tabelaBasica/menuItem/listarAtivos')
      ]
      
      if (editando.value) {
        promises.push($fetch<any>('/api/configuracao/permissaoUsuario/recuperaUsuario', {
          method: 'POST', body: { id: form.usuarioId }
        }))
      }
      
      const responses = await Promise.all(promises)
      menusDisponiveis.value = responses[0].data || []
      
      if (responses[1] && responses[1].data) {
        form.usuarioNome = responses[1].data.login || ''
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      mostrarAlerta('Erro', 'Falha ao carregar (' + (error.statusMessage || error.message || String(error)) + '). Url ou DB?')
    } finally {
      carregandoTela.value = false
    }
  }

  const buscarPermissoesDoMenu = async () => {
    if (!form.menuSelecionado || !editando.value) {
      form.permissoes = []
      erros.add('menuSelecionado')
      return
    }
    erros.delete('menuSelecionado')
    
    try {
      const { data } = await $fetch<any>('/api/configuracao/permissaoUsuario/permissoesPorMenu', {
        method: 'POST',
        body: { menuItem: form.menuSelecionado, usuario: form.usuarioId }
      })
      form.permissoes = (data || []).map((p: any) => ({ ...p, marcado: p.marcado === 1 }))
    } catch (error) {
      console.error('Erro ao buscar permissões', error)
      mostrarAlerta('Erro', 'Falha ao buscar as regras/permissoes deste menu no BD.')
    }
  }

  const marcarDesmarcarTodos = () => {
    if (form.permissoes.length === 0) return
    const novoEstado = !todosMarcados.value
    form.permissoes.forEach(p => p.marcado = novoEstado)
  }

  const validarFormulario = () => {
    erros.clear()
    if (!form.usuarioId || form.usuarioId === '0') erros.add('usuarioNome')
    if (!form.menuSelecionado) erros.add('menuSelecionado')
    return erros.size === 0
  }

  const gravarRegistro = async () => {
    if (!validarFormulario()) return
    const selecionadas = form.permissoes.filter(p => p.marcado)
    if (selecionadas.length === 0) {
      mostrarAlerta('Sem acessos', 'Selecione ao menos uma funcionalidade para gravar. Se desejar revogar, use inativar ou desmarque.')
      return
    }
    carregandoGravacao.value = true
    try {
      await $fetch('/api/configuracao/permissaoUsuario/gravar', {
        method: 'POST',
        body: { 
          usuarioId: form.usuarioId, 
          menuItem: form.menuSelecionado, 
          permissoes: selecionadas.map(p => ({ ...p, marcado: 1 })) 
        }
      })
      modalSucessoAberto.value = true
    } catch (error) {
      mostrarAlerta('Erro', 'Servidor falhou ao tentar salvar as permissões.')
    } finally {
      carregandoGravacao.value = false
    }
  }

  const excluirRegistro = async () => {
    const selecionadas = form.permissoes.filter(p => p.marcado)
    carregandoExclusao.value = true
    try {
      await $fetch('/api/configuracao/permissaoUsuario/excluir', {
        method: 'POST',
        body: { 
          usuarioId: form.usuarioId, 
          menuItem: form.menuSelecionado, 
          permissoes: selecionadas 
        }
      })
      fecharModal()
      mostrarAlerta('Sucesso', 'Acessos e regras revogados permanentemente!')
      await buscarPermissoesDoMenu()
    } catch (error) {
      mostrarAlerta('Erro', 'O Banco de Dados impediu a exclusão das permissões.')
    } finally {
      carregandoExclusao.value = false
    }
  }

  const voltarParaLista = () => {
    router.push('/configuracao/permissaoUsuario')
  }

  const limparFormulario = () => {
    form.menuSelecionado = ''
    form.permissoes = []
  }

  return {
    carregandoTela, carregandoGravacao, carregandoExclusao,
    modalExclusaoAberto, modalSucessoAberto, modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem,
    form, erros, menusDisponiveis, editando, possuiMarcacao, modoVisualizar,
    carregarDadosIniciais, buscarPermissoesDoMenu, marcarDesmarcarTodos,
    gravarRegistro, excluirRegistro, voltarParaLista, limparFormulario,
    abrirModalExclusao, fecharModal, fecharModalAlerta, irParaEdicao
  }
}
