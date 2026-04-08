import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useExtratoProjetoDetalhes() {
  const route = useRoute()
  const router = useRouter()
  
  const codigoProjeto = computed(() => route.query.codigo ? parseInt(route.query.codigo as string) : undefined)
  
  const detalhes = ref<any[]>([])
  const carregando = ref(false)
  const carregandoProjeto = ref(false)
  const gerandoExcel = ref(false)
  
  const projeto = reactive({
    descricao: '',
    apelido: '',
    contaVinculada: '',
    nomeBanco: '',
    saldo: 0
  })

  const filtro = ref({
    tipo: 0, // 0: Todas, 1: Entradas, 2: Saídas
    periodoAtalho: '',
    dataInicial: '',
    dataFinal: '',
    agrupar: '0', 
    detalhar: '1',
    ordenar: '1',
    lancamento: ''
  })

  const formatarMoeda = (valor: any) => {
    const v = Number(valor || 0)
    return isNaN(v) ? '0,00' : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const mudarTipo = (tipo: number) => {
    filtro.value.tipo = tipo
    buscarDetalhes()
  }

  const formatarDataInput = (dataObj: Date) => {
    const dia = String(dataObj.getDate()).padStart(2, '0')
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
    const ano = dataObj.getFullYear()
    return `${dia}/${mes}/${ano}`
  }

  const aplicarAtalhoPeriodo = () => {
    if (!filtro.value.periodoAtalho) {
      filtro.value.dataInicial = ''
      filtro.value.dataFinal = ''
    } else {
      const dias = parseInt(filtro.value.periodoAtalho)
      const hoje = new Date()
      const inicio = new Date()
      inicio.setDate(hoje.getDate() - dias)

      filtro.value.dataFinal = formatarDataInput(hoje)
      filtro.value.dataInicial = formatarDataInput(inicio)
    }
    buscarDetalhes()
  }

  const carregarDadosProjeto = async () => {
    if (!codigoProjeto.value) return
    carregandoProjeto.value = true
    try {
      const response = await $fetch<any>(`/api/cadastro/projeto/recupera?codigo=${codigoProjeto.value}`)
      if (response && response.status === 'success') {
        const d = response.data
        projeto.descricao = d.descricao
        projeto.apelido = d.apelido
        projeto.contaVinculada = d.contaVinculada
        projeto.nomeBanco = d.nomeBanco || '-'
        projeto.saldo = Number(d.saldo || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do projeto:', error)
    } finally {
      carregandoProjeto.value = false
    }
  }

  const buscarDetalhes = async () => {
    if (!codigoProjeto.value) return
    carregando.value = true
    
    const payload = {
      projeto: codigoProjeto.value,
      ...filtro.value
    }

    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/extratoProjeto/detalhes', {
        method: 'POST',
        body: payload
      })
      detalhes.value = response.data || []
      
      // Se tivermos dados e a ordem for decrescente, o primeiro item tem o saldo final acumulado
      if (detalhes.value.length > 0 && filtro.value.ordenar === '1') {
          projeto.saldo = Number(detalhes.value[0].saldoAcumulado || 0)
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do extrato de projeto:', error)
    } finally {
      carregando.value = false
    }
  }

  const exportarExcel = async () => {
    if (!codigoProjeto.value) return
    gerandoExcel.value = true
    
    const payload = {
      projeto: codigoProjeto.value,
      ...filtro.value
    }

    try {
      const response: Blob = await $fetch('/api/operacao/movimentacaoBancaria/extratoProjeto/excel', {
        method: 'POST',
        body: payload,
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(response)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Extrato_Projeto_${codigoProjeto.value}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erro ao exportar Excel de projeto:', error)
    } finally {
      gerandoExcel.value = false
    }
  }

  const voltarParaLista = () => {
    router.push('/operacao/movimentacaoBancaria/extratoProjeto')
  }

  return {
    codigoProjeto,
    detalhes,
    carregando,
    carregandoProjeto,
    gerandoExcel,
    projeto,
    filtro,
    formatarMoeda,
    mudarTipo,
    aplicarAtalhoPeriodo,
    carregarDadosProjeto,
    buscarDetalhes,
    exportarExcel,
    voltarParaLista
  }
}
