import { ref, computed, onMounted } from 'vue'

export function useVerbaFormulario() {
  const route = useRoute()
  const router = useRouter()

  const registroId = route.query.codigo as string || route.query.id as string || '0'
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
    codigoReferencia: '',
    descricao: '',
    tipo: '',
    observacao: '',
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
        const { data } = await $fetch<{ data: any }>('/api/tabelaBasica/verbas/recupera', {
          method: 'POST',
          body: { id: registroId }
        })
        if (data) {
          form.value.codigoReferencia = data.codigoReferencia
          form.value.descricao = data.descricao
          form.value.codigo = data.codigo
          form.value.tipo = data.tipo?.toString() || ''
          form.value.observacao = data.observacao
          form.value.ativo = data.ativo
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        mostrarAlerta("Erro de Carregamento", "Não foi possível recuperar os dados desta verba.")
      } finally {
        carregandoDados.value = false
      }
    }
  }

  const gravar = async () => {
    if (somenteLeitura.value) return
    if (!form.value.codigoReferencia) return mostrarAlerta("Campo Obrigatório", "Informe o código de referência.")
    if (!form.value.descricao) return mostrarAlerta("Campo Obrigatório", "Informe a descrição.")
    if (form.value.tipo === '') return mostrarAlerta("Campo Obrigatório", "Selecione o tipo.")
    if (!form.value.observacao) return mostrarAlerta("Campo Obrigatório", "Informe as observações.")

    salvando.value = true
    try {
      const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/verbas/gravar', {
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
      const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/verbas/excluir', {
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
    router.push('/tabelaBasica/verbas/cadastro?id=0')
    form.value = { codigo: '0', codigoReferencia: '', descricao: '', tipo: '', observacao: '', ativo: 1 }
    somenteLeitura.value = false
  }

  const irParaEdicao = () => {
    somenteLeitura.value = false
    router.replace({ query: { ...route.query, modo: undefined } })
  }

  const registroInativo = computed(() => !form.value.ativo)

  const voltar = () => router.push('/tabelaBasica/verbas')

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
    habilitarEdicao: irParaEdicao,
    registroInativo,
    mostrarAlerta
  }
}
