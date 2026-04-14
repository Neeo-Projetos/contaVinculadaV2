import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function usePermissaoUsuarioFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const codigoParam = route.query.codigo as string || route.query.id as string || '0'
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

  // Filtro e Paginação Local para Funcionalidades
  const filtroFunc = ref('')
  const paginaFunc = ref(1)
  const itensPorPaginaFunc = ref(10)

  const form = reactive({
    codigo: codigoParam,
    usuarioNome: '',
    menuSelecionado: '',
    permissoes: [] as any[],
    ativo: true
  })

  const editando = computed(() => form.codigo && form.codigo !== '0')
  const possuiMarcacao = computed(() => form.permissoes.some(p => p.marcado))
  const todosMarcados = computed(() => form.permissoes.length > 0 && form.permissoes.every(p => p.marcado))

  // Lógica de Filtro Local
  const funcionalidadesFiltradas = computed(() => {
    if (!filtroFunc.value) return form.permissoes
    const busca = filtroFunc.value.toLowerCase()
    return form.permissoes.filter(p => 
      (p.nomeCompleto || '').toLowerCase().includes(busca) || 
      (p.nome || '').toLowerCase().includes(busca)
    )
  })

  // Lógica de Paginação Local
  const totalPaginasFunc = computed(() => Math.ceil(funcionalidadesFiltradas.value.length / itensPorPaginaFunc.value))
  const funcionalidadesPaginadas = computed(() => {
    const inicio = (paginaFunc.value - 1) * itensPorPaginaFunc.value
    const fim = inicio + itensPorPaginaFunc.value
    return funcionalidadesFiltradas.value.slice(inicio, fim)
  })

  const registroInicialFunc = computed(() => funcionalidadesFiltradas.value.length === 0 ? 0 : (paginaFunc.value - 1) * itensPorPaginaFunc.value + 1)
  const registroFinalFunc = computed(() => Math.min(paginaFunc.value * itensPorPaginaFunc.value, funcionalidadesFiltradas.value.length))

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
      const resMenus = await $fetch<any>('/api/tabelaBasica/menuItem/listarAtivos')
      menusDisponiveis.value = resMenus.data || []
      
      if (editando.value) {
        const resUser = await $fetch<any>('/api/configuracao/permissaoUsuario/recuperaUsuario', {
          method: 'POST', body: { codigo: form.codigo }
        })
        if (resUser.status === 'success' && resUser.data) {
          form.usuarioNome = resUser.data.login || resUser.data.nomeUsuario || ''
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      mostrarAlerta('Erro', 'Falha ao carregar dados iniciais.')
    } finally {
      carregandoTela.value = false
    }
  }

  const buscarPermissoesDoMenu = async () => {
    if (!form.menuSelecionado || !editando.value) {
      form.permissoes = []
      return
    }
    erros.delete('menuSelecionado')
    try {
      const response = await $fetch<any>('/api/configuracao/permissaoUsuario/permissoesPorMenu', {
        method: 'POST',
        body: { menuItem: form.menuSelecionado, codigo: form.codigo }
      })
      if (response.status === 'success') {
        form.permissoes = (response.data || []).map((p: any) => ({
          ...p,
          marcado: p.marcado === 1 || p.marcado === true
        }))
        paginaFunc.value = 1 // Reseta pagina ao trocar menu
      } else {
        form.permissoes = []
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error)
      form.permissoes = []
    }
  }

  watch(() => form.menuSelecionado, () => {
    buscarPermissoesDoMenu()
  })

  const marcarDesmarcarTodos = () => {
    if (form.permissoes.length === 0) return
    const novoEstado = !todosMarcados.value
    form.permissoes.forEach(p => p.marcado = novoEstado)
  }

  const validarFormulario = () => {
    erros.clear()
    if (!form.codigo || form.codigo === '0') erros.add('usuarioNome')
    if (!form.menuSelecionado) erros.add('menuSelecionado')
    return erros.size === 0
  }

  const gravarRegistro = async () => {
    if (!validarFormulario()) return
    const selecionadas = form.permissoes.filter(p => p.marcado)
    carregandoGravacao.value = true
    try {
      await $fetch('/api/configuracao/permissaoUsuario/gravar', {
        method: 'POST',
        body: { 
          codigo: form.codigo, 
          menuItem: form.menuSelecionado, 
          permissoes: form.permissoes.map(p => ({
            idFuncionalidade: p.idFuncionalidade,
            marcado: p.marcado ? 1 : 0
          }))
        }
      })
      modalSucessoAberto.value = true
    } catch (error) {
      mostrarAlerta('Erro', 'Falha ao salvar as permissões.')
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
          codigo: form.codigo, 
          menuItem: form.menuSelecionado, 
          permissoes: selecionadas.map(p => p.idFuncionalidade)
        }
      })
      fecharModal()
      mostrarAlerta('Sucesso', 'Permissões revogadas com sucesso!')
      await buscarPermissoesDoMenu()
    } catch (error) {
      mostrarAlerta('Erro', 'Falha ao revogar permissões.')
    } finally {
      carregandoExclusao.value = false
    }
  }

  const voltarParaLista = () => router.push('/configuracao/permissaoUsuario')
  const limparFormulario = () => {
    form.menuSelecionado = ''
    form.permissoes = []
  }

  return {
    carregandoTela, carregandoGravacao, carregandoExclusao,
    modalExclusaoAberto, modalSucessoAberto, modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem,
    form, erros, menusDisponiveis, editando, possuiMarcacao, modoVisualizar, todosMarcados,
    carregarDadosIniciais, buscarPermissoesDoMenu, marcarDesmarcarTodos,
    gravarRegistro, excluirRegistro, voltarParaLista, limparFormulario,
    abrirModalExclusao, fecharModal, fecharModalAlerta, irParaEdicao,
    
    // Novas propriedades para a tabela premium
    filtroFunc, paginaFunc, itensPorPaginaFunc, funcionalidadesFiltradas, 
    funcionalidadesPaginadas, totalPaginasFunc, registroInicialFunc, registroFinalFunc,
    paginasExibidasFunc: computed(() => {
        const paginas = []
        for (let i = 1; i <= totalPaginasFunc.value; i++) paginas.push(i)
        return paginas
    })
  }
}
