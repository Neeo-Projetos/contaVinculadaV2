import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useContrachequeImportacao() {
  const router = useRouter()
  
  const form = reactive({
    ano: ''
  })
  
  const arquivoSelecionado = ref<File | null>(null)
  const ultimaImportacao = ref('')
  const importando = ref(false)
  const modalImportadosAberto = ref(false)
  
  // Estado para modais de erro/alerta
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('Atenção')
  const modalAlertaMensagem = ref('')

  let loopMensagens: any = null

  const exibirAlerta = (titulo: string, mensagem: string) => {
    modalAlertaTitulo.value = titulo
    modalAlertaMensagem.value = mensagem
    modalAlertaAberto.value = true
  }

  const carregarUltimaImportacao = async () => {
    try {
      const { data } = await $fetch<any>('/api/operacao/contracheque/importacao/ultimaImportacao')
      ultimaImportacao.value = data || 'Nenhuma importação registrada'
    } catch (error) {
      console.error('Erro ao buscar última importação:', error)
    }
  }

  const aoSelecionarArquivo = (file: File) => {
    if (file.size > 2097152) {
      exibirAlerta('Arquivo muito grande', 'O arquivo ultrapassou o valor máximo permitido de 2MB.')
      return false
    }
    
    // Check extension manually if needed, but AppInputFile should handle it via accept
    arquivoSelecionado.value = file
    return true
  }

  const mensagemCarregamento = ref('Realizando upload e processando arquivo...')
  
  const iniciarCicloMensagens = () => {
    const mensagens = [
      'Enviando arquivo para o servidor...',
      'Validando estrutura do arquivo...',
      'Processando registros de contracheque...',
      'Organizando dados para conferência...',
      'Quase pronto, finalizando...'
    ]
    let index = 0
    if (loopMensagens) clearInterval(loopMensagens)
    
    loopMensagens = setInterval(() => {
      if (!importando.value) {
        clearInterval(loopMensagens)
        loopMensagens = null
        return
      }
      mensagemCarregamento.value = mensagens[index % mensagens.length]
      index++
    }, 3000)
  }

  const importarArquivo = async () => {
    // Validação manual para evitar o bubble do browser
    if (!form.ano || form.ano.length < 7) {
        return exibirAlerta('Campo Obrigatório', 'Informe o Mês/Ano de referência no formato MM/AAAA.')
    }
    
    if (!arquivoSelecionado.value) {
        return exibirAlerta('Arquivo não selecionado', 'É necessário selecionar um arquivo .txt para continuar.')
    }

    importando.value = true
    mensagemCarregamento.value = 'Iniciando upload...'
    iniciarCicloMensagens()

    const formData = new FormData()
    formData.append('ano', form.ano)
    formData.append('arquivo', arquivoSelecionado.value)

    try {
      const res = await $fetch<any>('/api/operacao/contracheque/importacao/upload', {
        method: 'POST',
        body: formData
      })

      if (res.status === 'success') {
        modalImportadosAberto.value = true
      } else {
        exibirAlerta('Falha na Importação', res.mensagem || 'Não foi possível processar o arquivo.')
      }
    } catch (error) {
      exibirAlerta('Erro de Conexão', 'Houve um erro técnico ao tentar enviar o arquivo para o servidor.')
    } finally {
      importando.value = false
      if (loopMensagens) {
        clearInterval(loopMensagens)
        loopMensagens = null
      }
    }
  }

  const irParaProcessamento = () => {
    modalImportadosAberto.value = false
    router.push({
      path: '/operacao/contracheque/processamento',
      query: { mesAno: form.ano }
    })
  }

  onMounted(() => {
    carregarUltimaImportacao()
  })

  onUnmounted(() => {
    if (loopMensagens) clearInterval(loopMensagens)
  })

  return {
    form,
    arquivoSelecionado,
    ultimaImportacao,
    importando,
    modalImportadosAberto,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    aoSelecionarArquivo,
    importarArquivo,
    irParaProcessamento,
    mensagemCarregamento
  }
}
