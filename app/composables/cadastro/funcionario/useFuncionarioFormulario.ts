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

  const form = reactive({
    codigo: codigoRaw ? parseInt(codigoRaw as string) : 0,
    nomeCompleto: '',
    cpf: '',
    matricula: '',
    email: '',
    projeto: ''
  })

  const editando = computed(() => !!form.codigo)

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
        } else {
          alert(data?.mensagem || 'Erro ao carregar dados.')
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
  }

  const abrirModalExclusao = () => { modalExclusaoAberto.value = true }
  const fecharModal = () => { modalExclusaoAberto.value = false }

  const gravarRegistro = async () => {
    carregandoGravacao.value = true
    try {
      const data = await $fetch<any>('/api/cadastro/funcionario/gravar', { method: 'POST', body: form })
      if (data.status === 'success') {
        voltarParaLista()
      } else { alert(data.mensagem || 'Erro desconhecido.') }
    } catch (e: any) { alert(e.data?.statusMessage || 'Erro ao gravar') } finally { carregandoGravacao.value = false }
  }

  const excluirRegistro = async () => {
    carregandoExclusao.value = true
    try {
      const data = await $fetch<any>('/api/cadastro/funcionario/excluir', { method: 'POST', body: { codigo: form.codigo } })
      if (data.status === 'success') { 
        voltarParaLista() 
      }
      else { alert(data.mensagem) }
    } catch (e: any) { alert(e.data?.statusMessage || 'Erro ao excluir') } finally { 
      carregandoExclusao.value = false
      fecharModal() 
    }
  }

  return {
    carregandoTela,
    carregandoGravacao,
    carregandoExclusao,
    modalExclusaoAberto,
    form,
    editando,
    projetosAtivos,
    carregarProjetos,
    carregarDados,
    voltarParaLista,
    limparFormulario,
    abrirModalExclusao,
    fecharModal,
    gravarRegistro,
    excluirRegistro
  }
}