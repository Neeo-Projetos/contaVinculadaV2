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
  const idRaw = computed(() => (route.query.id || route.query.codigo) as string)
  const modoVisualizar = computed(() => route.query.modo === 'visualizar')
  const idSet = computed(() => !!idRaw.value && idRaw.value !== '0')

  const irParaEdicao = () => router.push({ path: route.path, query: { ...route.query, modo: undefined } })
  
  const carregandoTela = ref(false)
  const salvando = ref(false)
  const modalExclusaoAberto = ref(false)

  const erros = ref(new Set<string>())
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')
  const modalSucessoAberto = ref(false)

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
      const projResponse = await $fetch<any>('/api/cadastro/projeto/ativos')
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
        const { data } = await $fetch<any>('/api/configuracao/parametros/oficio/recupera', {
          method: 'POST',
          body: { id: idRaw.value }
        })
        if (data) {
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
      const { data } = await $fetch<any>('/api/configuracao/parametros/oficio/recuperaModelo', {
        method: 'POST',
        body: { projeto: form.projeto }
      });
      if (data && data.texto) {
        form.texto = data.texto
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
        body: form
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

  const excluir = async () => {
    try {
      await $fetch<any>('/api/configuracao/parametros/oficio/excluir', {
        method: 'POST',
        body: { codigo: form.codigo }
      })
      voltar()
    } catch (error) {
      mostrarAlerta('Erro de Exclusão', 'Não foi possível excluir o parâmetro.')
    } finally {
      modalExclusaoAberto.value = false
    }
  }

  const limpar = () => {
    router.push('/configuracao/parametros/oficio/cadastro?id=0')
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
    await carregarProjetos()
    await carregarDados()
    carregandoTela.value = false
  })

  return {
    carregandoTela,
    salvando,
    modalExclusaoAberto,
    form,
    projetos,
    ehEdicao: idSet,
    variaveis,
    erros,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    modalSucessoAberto,
    fecharModalAlerta,
    carregarProjetos,
    carregarDados,
    buscarModeloPadrao,
    gravar,
    excluir,
    limpar,
    voltar,
    modoVisualizar,
    irParaEdicao
  }
}
