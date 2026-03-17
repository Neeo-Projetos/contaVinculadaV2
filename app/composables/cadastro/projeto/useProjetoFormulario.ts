import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useProjetoFormulario() {
  const route = useRoute()
  const router = useRouter()
  
  const registroId = route.query.id as string

  const carregandoTela = ref(false)
  const carregandoGravacao = ref(false)
  const carregandoExclusao = ref(false)
  const modalExclusaoAberto = ref(false)
  const passoAtual = ref(0)
  const totalPassos = 3

  const avancarPasso = () => {
    if (passoAtual.value < totalPassos - 1) passoAtual.value++
  }

  const voltarPasso = () => {
    if (passoAtual.value > 0) passoAtual.value--
    else voltarParaLista()
  }

  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')

  interface ProjetoForm {
    codigo: string | number
    cnpj: string
    apelido: string
    descricao: string
    razaoSocial: string
    cep: string
    logradouro: string
    numeroEndereco: string
    complemento: string
    bairro: string
    cidade: string
    uf: string
    numeroContrato: string
    dataAssinatura: string
    numeroFuncionarios: string
    valorFaturamento: string
    tipoDeCalculo: string
    saldoOficio: string
    contaVinculada: string
    dataContaVinculada: string
    contas: any[]
    verbas: any[]
    ativo: number | boolean
  }

  const form = reactive<ProjetoForm>({
    codigo: registroId || '0',
    cnpj: '',
    apelido: '',
    descricao: '',
    razaoSocial: '',
    cep: '',
    logradouro: '',
    numeroEndereco: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    numeroContrato: '',
    dataAssinatura: '',
    numeroFuncionarios: '',
    valorFaturamento: '',
    tipoDeCalculo: '',
    saldoOficio: '',
    contaVinculada: '0',
    dataContaVinculada: '',
    contas: [],
    verbas: [],
    ativo: 1
  })

  const editando = computed(() => form.codigo !== '0' && !!form.codigo)

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    modalAlertaTitulo.value = titulo
    modalAlertaMensagem.value = mensagem
    modalAlertaAberto.value = true
  }

  const fecharModalAlerta = () => {
    modalAlertaAberto.value = false
  }

  const carregarDados = async () => {
    if (editando.value) {
      carregandoTela.value = true
      try {
        const data = await $fetch<any>(`/api/cadastro/projeto/recupera?codigo=${form.codigo}`)
        if (data && data.data) {
          Object.assign(form, data.data)
        } else {
          mostrarAlerta('Erro ao Carregar', 'Não foi possível carregar os dados do projeto.')
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e)
        mostrarAlerta('Erro Interno', 'Falha na comunicação com o servidor.')
      } finally {
        carregandoTela.value = false
      }
    }
  }

  const verificarCnpj = async () => {
    if (!form.cnpj || editando.value) return
    try {
      const res = await $fetch<{ status: string }>('/api/cadastro/projeto/verificaCnpj', {
        method: 'POST', body: { cnpj: form.cnpj }
      })
      if (res.status === 'success') {
        mostrarAlerta('Atenção', "Já existe um projeto com o CNPJ cadastrado.")
        form.cnpj = ''
      }
    } catch (error) {
      console.error('Erro ao verificar CNPJ:', error)
    }
  }

  const voltarParaLista = () => {
    router.push('/cadastro/projeto')
  }

  const limparFormulario = () => {
    router.push('/cadastro/projeto/cadastro?id=0')
    Object.assign(form, {
      codigo: '0',
      cnpj: '',
      apelido: '',
      descricao: '',
      razaoSocial: '',
      cep: '',
      logradouro: '',
      numeroEndereco: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      numeroContrato: '',
      dataAssinatura: '',
      numeroFuncionarios: '',
      valorFaturamento: '',
      tipoDeCalculo: '',
      saldoOficio: '',
      contaVinculada: '0',
      dataContaVinculada: '',
      contas: [],
      verbas: [],
      ativo: 1
    })
  }

  const abrirModalExclusao = () => { modalExclusaoAberto.value = true }
  const fecharModal = () => { modalExclusaoAberto.value = false }

  const gravarRegistro = async () => {
    if (!form.apelido || !form.descricao || !form.cnpj) {
      mostrarAlerta('Campos Obrigatórios', "Por favor, preencha CNPJ, Apelido e Descrição.")
      return
    }

    carregandoGravacao.value = true
    try {
      const res = await $fetch<any>('/api/cadastro/projeto/gravar', {
        method: 'POST',
        body: form
      })
      if (res.status === 'success') {
        voltarParaLista()
      } else {
        mostrarAlerta('Erro ao Gravar', res.mensagem || 'Ocorreu um erro ao tentar gravar.')
      }
    } catch (e: any) {
      console.error('Erro ao gravar dados:', e)
      mostrarAlerta('Erro Interno', 'Erro de comunicação ao gravar.')
    } finally {
      carregandoGravacao.value = false
    }
  }

  const excluirRegistro = async () => {
    carregandoExclusao.value = true
    try {
      const data = await $fetch<any>('/api/cadastro/projeto/excluir', {
        method: 'POST',
        body: { codigo: form.codigo }
      })
      if (data.status === 'success') {
        voltarParaLista()
      } else {
        mostrarAlerta('Erro ao Excluir', data.mensagem || 'Erro ao inativar projeto.')
      }
    } catch (e: any) {
      console.error('Erro ao excluir:', e)
      mostrarAlerta('Erro Interno', 'Erro de comunicação ao excluir.')
    } finally {
      carregandoExclusao.value = false
      fecharModal()
    }
  }

  return {
    passoAtual,
    totalPassos,
    avancarPasso,
    voltarPasso,
    carregandoTela,
    carregandoGravacao,
    carregandoExclusao,
    modalExclusaoAberto,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    form,
    editando,
    carregarDados,
    verificarCnpj,
    voltarParaLista,
    limparFormulario,
    abrirModalExclusao,
    fecharModal,
    fecharModalAlerta,
    gravarRegistro,
    excluirRegistro
  }
}
