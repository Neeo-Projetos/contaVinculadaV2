import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useLancamentoEstornoFormulario() {
  const router = useRouter()
  
  const projetosAtivos = ref<any[]>([])
  const projetoId = ref('')
  const tipoLancamento = ref(2) // Default Manual
  const buscando = ref(false)
  const buscaRealizada = ref(false)
  const lancamentos = ref<any[]>([])
  
  const modalEstornoAberto = ref(false)
  const modalPinAberto = ref(false)
  const processandoEstorno = ref(false)
  const dataEstornoDisplay = ref('')
  let timerRelogio: any = null

  const estornoObj = reactive({
    codigo: 0,
    tipoLancamento: 0,
    motivo: '',
    pin: ''
  })

  const carregarCombos = async () => {
    try {
      const resp = await $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos')
      projetosAtivos.value = resp.data || []
    } catch (error) {
      console.error('Erro ao carregar projetos', error)
    }
  }

  const buscarLancamentos = async () => {
    if (!projetoId.value) return
    buscando.value = true
    buscaRealizada.value = true
    try {
      // Reutiliza o endpoint de listagem passando os filtros
      const resp = await $fetch<{ data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/listagem', {
        method: 'POST',
        body: {
          projetoParam: projetoId.value,
          tipoLancamentoParam: tipoLancamento.value,
          estornadoParam: '0' // Apenas não estornados
        }
      })
      lancamentos.value = resp.data || []
    } catch (error) {
      console.error('Erro ao buscar lançamentos', error)
      lancamentos.value = []
    } finally {
      buscando.value = false
    }
  }

  const atualizarRelogio = () => {
    const agora = new Date()
    dataEstornoDisplay.value = `${agora.toLocaleDateString('pt-BR')} - ${agora.toLocaleTimeString('pt-BR')}`
  }

  const prepararEstornoRapido = (item: any) => {
    estornoObj.codigo = item.codigo
    estornoObj.tipoLancamento = item.tipoLancamento
    estornoObj.motivo = ''
    estornoObj.pin = ''
    
    atualizarRelogio()
    if (timerRelogio) clearInterval(timerRelogio)
    timerRelogio = setInterval(atualizarRelogio, 1000)
    
    modalEstornoAberto.value = true
  }

  const vaiParaPin = () => {
    if (!estornoObj.motivo.trim()) return
    modalEstornoAberto.value = false
    modalPinAberto.value = true
  }

  const tentarFinalizar = async () => {
    if (!estornoObj.pin) return
    processandoEstorno.value = true
    try {
      // 1. Valida PIN (MD5 no backend)
      const resPin = await $fetch<{ status: string }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/validaPin', {
        method: 'POST', body: { pin: estornoObj.pin }
      })
      
      if (resPin.status !== 'success') {
        alert('PIN incorreto!')
        estornoObj.pin = ''
        return
      }

      // 2. Grava Estorno
      const resGravar = await $fetch<{ status: string, mensagem: string }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/gravar', {
        method: 'POST', body: estornoObj
      })

      if (resGravar.status === 'success') {
        modalPinAberto.value = false
        buscarLancamentos() // Atualiza a lista na tela
        alert('Estorno realizado com sucesso!')
      } else {
        alert(resGravar.mensagem)
      }
    } catch (error) {
      console.error('Erro ao finalizar estorno', error)
    } finally {
      processandoEstorno.value = false
    }
  }

  const navegarParaCadastro = (codigo: number, tipo: number) => {
    const modulo = tipo === 2 ? 'lancamentoManual' : 'lancamentoReembolso'
    router.push(`/operacao/movimentacaoBancaria/${modulo}/cadastro?codigo=${codigo}`)
  }

  const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  onMounted(() => {
    carregarCombos()
  })

  const modalFuncionarioAberto = ref(false)
  const listaFuncionariosModal = ref<any[]>([])

  const abrirModalFuncionarios = async (codigo: number, tipo: number, projetoId: number) => {
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/funcionarios', {
        method: 'POST', body: { codigo, tipoLancamento: tipo, projeto: projetoId }
      })
      listaFuncionariosModal.value = response.data || []
      modalFuncionarioAberto.value = true
    } catch (error) { console.error(error) }
  }

  const lancamentoSelecionado = ref<any>(null)

  const selecionarParaEstorno = (item: any) => {
    lancamentoSelecionado.value = item
  }

  return {
    projetoId,
    tipoLancamento,
    projetosAtivos,
    buscando,
    buscaRealizada,
    lancamentos,
    lancamentoSelecionado,
    modalFuncionarioAberto,
    listaFuncionariosModal,
    abrirModalFuncionarios,
    modalEstornoAberto,
    modalPinAberto,
    estornoObj,
    dataEstornoDisplay,
    processandoEstorno,
    buscarLancamentos,
    selecionarParaEstorno,
    prepararEstornoRapido,
    vaiParaPin,
    tentarFinalizar,
    formatarMoeda,
    navegarParaCadastro
  }
}
