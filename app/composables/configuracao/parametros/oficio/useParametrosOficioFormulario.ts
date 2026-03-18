import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useParametrosOficioFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const idRaw = route.query.id as string
  const idSet = !!idRaw && idRaw !== '0'
  
  const carregandoTela = ref(false)
  const salvando = ref(false)
  const modalExclusaoAberto = ref(false)

  // Controle de Passos (Padrão Ouro)
  const passoAtual = ref(1)
  const totalPassos = 2

  const form = reactive({
    codigo: idRaw || '0',
    projeto: '',
    texto: ''
  })

  const projetos = ref<any[]>([])

  const carregarProjetos = async () => {
    try {
      const projResponse = await $fetch<any>('/api/tabelaBasica/projeto/listarAtivos')
      projetos.value = projResponse.data || []
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    }
  }

  const carregarDados = async () => {
    if (idSet) {
      carregandoTela.value = true
      try {
        const { data } = await $fetch<any>('/api/configuracao/parametros/oficio/recupera', {
          method: 'POST',
          body: { id: idRaw }
        })
        if (data) {
          form.projeto = data.projeto
          form.texto = data.texto
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        carregandoTela.value = false
      }
    }
  }

  const buscarModeloPadrao = async () => {
    if (!form.projeto || idSet) return
    
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

  const avancarPasso = () => {
    // Validações por etapa
    if (passoAtual.value === 1) {
        if (!form.projeto) return alert("Informe o Projeto")
    }

    if (passoAtual.value < totalPassos) {
        passoAtual.value++
    } else {
        gravar()
    }
  }

  const voltarPasso = () => {
    if (passoAtual.value > 1) {
        passoAtual.value--
    } else {
        voltar()
    }
  }

  const gravar = async () => {
    if (!form.projeto) return alert("Informe o Projeto")
    if (!form.texto) return alert("A redação não pode estar vazia")

    salvando.value = true
    try {
      const res = await $fetch<any>('/api/configuracao/parametros/oficio/gravar', {
        method: 'POST',
        body: form
      })
      if (res.status === 'success') {
        voltar()
      } else {
        alert(res.mensagem || 'Erro ao gravar.')
      }
    } catch (error) {
      alert('Erro ao gravar dados.')
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
      alert('Erro ao excluir.')
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

  onMounted(() => {
    carregarProjetos()
    carregarDados()
  })

  return {
    carregandoTela,
    salvando,
    modalExclusaoAberto,
    passoAtual,
    totalPassos,
    avancarPasso,
    voltarPasso,
    form,
    projetos,
    ehEdicao: idSet,
    variaveis,
    carregarProjetos,
    carregarDados,
    buscarModeloPadrao,
    gravar,
    excluir,
    limpar,
    voltar
  }
}
