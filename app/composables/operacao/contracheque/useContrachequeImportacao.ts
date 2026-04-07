import { ref, reactive, onMounted } from 'vue'
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
    if (file.size > 1048576) {
      exibirAlerta('Arquivo muito grande', 'O arquivo ultrapassou o valor máximo permitido de 1MB.')
      return false
    }
    
    // Check extension manually if needed, but AppInputFile should handle it via accept
    arquivoSelecionado.value = file
    return true
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
    }
  }

  const irParaProcessamento = () => {
    modalImportadosAberto.value = false
    router.push('/operacao/contracheque/processamento') 
  }

  onMounted(() => {
    carregarUltimaImportacao()
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
    irParaProcessamento
  }
}
