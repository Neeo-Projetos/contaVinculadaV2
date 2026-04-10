import { ref, computed, onMounted } from 'vue'

export function useLancamentoFormulario() {
  const route = useRoute()
  const router = useRouter()

  const registroId = route.query.id as string || '0'
  const somenteLeitura = ref(false)

  const ehEdicao = computed(() => registroId !== '0' && !!registroId)
  
  const salvando = ref(false)
  const carregandoDados = ref(false)
  const modalExclusao = ref(false)
  
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')

  const form = ref({
    codigo: registroId || '0',
    descricao: '',
    ativo: 1
  })

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    modalAlertaTitulo.value = titulo
    modalAlertaMensagem.value = mensagem
    modalAlertaAberto.value = true
  }

  const buscarDados = async () => {
    if (ehEdicao.value) {
      carregandoDados.value = true
      try {
        const { data } = await $fetch<{ data: any }>('/api/tabelaBasica/lancamento/recupera', {
          method: 'POST',
          body: { id: registroId }
        })
        if (data) {
          form.value.descricao = data.descricao
          form.value.codigo = data.codigo
          form.value.ativo = data.ativo
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        mostrarAlerta("Erro de Carregamento", "Não foi possível recuperar os dados deste registro.")
      } finally {
        carregandoDados.value = false
      }
    }
  }

  const formatarDescricao = () => {
    let valorLimpo = form.value.descricao
      .replace(/[^a-zA-ZÀ-ÿ\s']/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s+/, '')
    
    form.value.descricao = valorLimpo
  }

  const gravar = async () => {
    if (somenteLeitura.value) return
    if (!form.value.descricao) return mostrarAlerta("Campo Obrigatório", "Por favor, informe uma descrição para o lançamento.")

    salvando.value = true
    try {
      const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/lancamento/gravar', {
        method: 'POST',
        body: form.value
      })
      if (res.status === 'success') {
        voltar()
      } else {
        mostrarAlerta("Erro ao Gravar", res.mensagem)
      }
    } catch (error) {
      console.error('Erro ao gravar dados:', error)
      mostrarAlerta("Erro Interno", "Falha de comunicação para salvar o registro.")
    } finally {
      salvando.value = false
    }
  }

  const confirmarExclusao = () => {
    if (somenteLeitura.value) return
    modalExclusao.value = true
  }

  const excluir = async () => {
    try {
      const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/lancamento/excluir', {
        method: 'POST',
        body: { codigo: form.value.codigo }
      })
      if (res.status === 'success') {
        voltar()
      } else {
        mostrarAlerta("Erro ao Excluir", res.mensagem)
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      mostrarAlerta("Erro Interno", "Houve uma falha ao excluir o registro.")
    } finally {
      modalExclusao.value = false
    }
  }

  const novo = () => {
    router.push('/tabelaBasica/lancamento/cadastro?id=0')
    form.value = { codigo: '0', descricao: '', ativo: 1 }
    somenteLeitura.value = false
  }

  const habilitarEdicao = () => {
    somenteLeitura.value = false
    router.replace({ query: { ...route.query, modo: undefined } })
  }

  const registroInativo = computed(() => !form.value.ativo)

  const voltar = () => router.push('/tabelaBasica/lancamento')

  onMounted(() => {
    if (route.query.modo === 'visualizar') {
      somenteLeitura.value = true
    }
    buscarDados()
  })

  return {
    form,
    ehEdicao,
    somenteLeitura,
    salvando,
    carregandoDados,
    modalExclusao,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    gravar,
    confirmarExclusao,
    excluir,
    novo,
    voltar,
    habilitarEdicao,
    registroInativo,
    mostrarAlerta,
    formatarDescricao
  }
}
