import { ref, computed, onMounted } from 'vue'

export function useBancosFormulario() {
  const route = useRoute()
  const router = useRouter()

  const registroId = computed(() => (route.query.id || route.query.codigo) as string)
  const modoVisualizar = computed(() => route.query.modo === 'visualizar')
  const ehEdicao = computed(() => registroId.value !== '0' && !!registroId.value)

  const salvando = ref(false)
  const carregandoDados = ref(false)
  const modalExclusao = ref(false)

  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')

  const form = ref({
    codigo: registroId.value || '0',
    codigoBanco: '',
    nomeBanco: '',
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
        const { data } = await $fetch<{ data: any }>('/api/tabelaBasica/bancos/recupera', {
          method: 'POST',
          body: { id: registroId.value }
        })
        if (data) {
          form.value.codigoBanco = data.codigoBanco
          form.value.nomeBanco = data.nomeBanco
          form.value.ativo = data.ativo
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        carregandoDados.value = false
      }
    }
  }

  const gravar = async () => {
    if (!form.value.codigoBanco) return mostrarAlerta("Código Obrigatório", "Por favor, informe o código oficial do banco.")
    if (!form.value.nomeBanco) return mostrarAlerta("Nome Obrigatório", "Por favor, informe o nome da instituição bancária.")

    salvando.value = true
    try {
      const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/bancos/gravar', {
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
      mostrarAlerta("Erro Interno", "Houve uma falha ao tentar salvar os dados.")
    } finally {
      salvando.value = false
    }
  }

  const excluir = async () => {
    try {
      const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/bancos/excluir', {
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
      mostrarAlerta("Erro Interno", "Falha de comunicação para excluir o registro.")
    } finally {
      modalExclusao.value = false
    }
  }

  const novo = () => {
    router.push('/tabelaBasica/bancos/cadastro?id=0')
    form.value = { codigo: '0', codigoBanco: '', nomeBanco: '', ativo: 1 }
  }

  const voltar = () => router.push('/tabelaBasica/bancos')

  const irParaEdicao = () => {
    router.push({ path: route.path, query: { ...route.query, modo: undefined } })
  }

  const registroInativo = computed(() => !form.value.ativo)

  onMounted(() => {
    buscarDados()
  })

  return {
    form,
    salvando,
    carregandoDados,
    modalExclusao,
    ehEdicao,
    modoVisualizar,
    irParaEdicao,
    registroInativo,
    gravar,
    excluir,
    novo,
    voltar,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    fecharModalAlerta: () => modalAlertaAberto.value = false
  }
}
