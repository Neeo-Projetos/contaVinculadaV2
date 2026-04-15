import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface OficioForm {
    codigo: string;
    projeto: string;
    texto: string;
}

export function useParametrosOficioFormulario() {
  const route = useRoute()
  const router = useRouter()
  const idRaw = computed(() => (route.query.codigo || route.query.id) as string)
  const modoVisualizar = computed(() => route.query.modo === 'visualizar')
  const idSet = computed(() => !!idRaw.value && idRaw.value !== '0')

  const irParaEdicao = () => router.push({ path: route.path, query: { ...route.query, modo: undefined } })
  
  const carregandoTela = ref(false)
  const salvando = ref(false)

  const erros = ref(new Set<string>())
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')
  const modalSucessoAberto = ref(false)

  const modalHistoricoAberto = ref(false)
  const carregandoHistorico = ref(false)
  const historicoData = ref<any[]>([])

  const abrirHistorico = async () => {
    if (!idSet.value) return
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    try {
      const response = await $fetch<any>('/api/configuracao/parametros/oficio/historico', {
        method: 'POST',
        body: { codigo: idRaw.value }
      })
      historicoData.value = response.data || []
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    } finally {
      carregandoHistorico.value = false
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

  const form = reactive<OficioForm>({
    codigo: '0',
    projeto: '',
    texto: ''
  })

  const projetos = ref<any[]>([])

  const carregarProjetos = async () => {
    try {
      // Se for novo registro (idSet é falso), buscar apenas projetos sem configuração
      // Se for edição, buscar todos os ativos para garantir que o projeto atual apareça na lista
      const endpoint = idSet.value ? '/api/cadastro/projeto/ativos' : '/api/configuracao/parametros/oficio/projetosDisponiveis'
      
      const projResponse = await $fetch<any>(endpoint)
      projetos.value = (projResponse.data || []).map((p: any) => ({
        ...p,
        codigo: String(p.codigo),
        nomeExibicao: p.descricao ? `${p.apelido} - ${p.descricao}` : p.apelido
      }))
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    }
  }

  const carregarDados = async () => {
    if (idSet.value) {
      carregandoTela.value = true
      try {
        const response = await $fetch<any>('/api/configuracao/parametros/oficio/recupera', {
          method: 'POST',
          body: { codigo: idRaw.value }
        })
        if (response.status === 'success' && response.data) {
          const data = response.data
          form.codigo = String(data.codigo)
          form.projeto = data.projeto ? String(data.projeto) : ''
          form.texto = data.texto
        }
      } catch (error) {
        mostrarAlerta('Erro Sincronismo', 'Falha ao buscar os dados do ofício. Tente novamente.')
      } finally {
        carregandoTela.value = false
      }
    }
  }

  const buscarModeloPadrao = async () => {
    if (!form.projeto || idSet.value) return
    
    try {
      const response = await $fetch<any>('/api/configuracao/parametros/oficio/recuperaModelo', {
        method: 'POST',
        body: { projeto: form.projeto }
      });
      if (response.status === 'success' && response.data?.texto) {
        form.texto = response.data.texto
      }
    } catch (error) {
      console.error('Erro ao buscar modelo padrão:', error)
    }
  }

  const gravar = async () => {
    erros.value.clear()

    if (!form.projeto) erros.value.add("projeto")
    if (!form.texto) erros.value.add("texto")

    if (erros.value.size > 0) {
        mostrarAlerta("Campos Obrigatórios", "Por favor, preencha todos os campos destacados em vermelho.")
        return
    }

    salvando.value = true
    try {
      const res = await $fetch<any>('/api/configuracao/parametros/oficio/gravar', {
        method: 'POST',
        body: {
          ...form,
          codigo: idSet.value ? idRaw.value : '0'
        }
      })
      if (res.status === 'success') {
        modalSucessoAberto.value = true
      } else {
        mostrarAlerta('Erro ao registrar', res.mensagem || 'Erro desconhecido.')
      }
    } catch (error) {
      mostrarAlerta('Erro de Servidor', 'Ocorreu um erro na requisição de gravação.')
    } finally {
      salvando.value = false
    }
  }

  const limpar = () => {
    router.push('/configuracao/parametros/oficio/cadastro?codigo=0')
    form.codigo = '0'
    form.projeto = ''
    form.texto = ''
  }

  const voltar = () => {
    router.push('/configuracao/parametros/oficio')
  }

  const variaveis = [
    '$nomeOrgao$', '$cnpj$', '$enderecoCompleto$', '$numContrato$', '$numeroOficio$', '$anoOficio$', '$assunto$', '$periodoReferencia$', '$valor$', '$valorExtenso$', '$cidadeData$'
  ]

  onMounted(async () => {
    carregandoTela.value = true
    await carregarDados()
    await carregarProjetos()
    carregandoTela.value = false
  })

  return {
    carregandoTela,
    salvando,
    form,
    projetos,
    ehEdicao: idSet,
    variaveis,
    erros,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    modalSucessoAberto,
    modalHistoricoAberto,
    carregandoHistorico,
    historicoData,
    abrirHistorico,
    fecharModalAlerta,
    carregarProjetos,
    carregarDados,
    buscarModeloPadrao,
    gravar,
    limpar,
    voltar,
    modoVisualizar,
    irParaEdicao
  }
}
