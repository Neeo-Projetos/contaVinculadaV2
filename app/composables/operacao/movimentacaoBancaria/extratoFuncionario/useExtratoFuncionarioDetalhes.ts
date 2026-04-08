import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useExtratoFuncionarioDetalhes() {
  const route = useRoute()
  const router = useRouter()
  
  const codigoFuncionario = computed(() => route.query.codigo ? parseInt(route.query.codigo as string) : undefined)
  
  const detalhes = ref<any[]>([])
  const carregando = ref(false)
  const carregandoFuncionario = ref(false)
  const gerandoExcel = ref(false)
  const projetosAtivos = ref<any[]>([])
  
  const funcionario = reactive({
    nomeCompleto: '',
    cpf: '',
    matricula: '',
    projetoNome: '',
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

  const carregarDadosFuncionario = async () => {
    if (!codigoFuncionario.value) return
    carregandoFuncionario.value = true
    try {
      // Carregamos projetos primeiro para ter o De/Para de nomes
      const projetosRes = await $fetch<any>('/api/cadastro/projeto/ativos')
      projetosAtivos.value = projetosRes?.data || []

      const response = await $fetch<any>(`/api/cadastro/funcionario/recupera?codigo=${codigoFuncionario.value}`)
      if (response && response.status === 'success') {
        const d = response.data
        funcionario.nomeCompleto = d.nomeCompleto
        funcionario.cpf = d.cpf
        funcionario.matricula = d.matricula
        
        // Busca o nome do projeto na lista de ativos
        const proj = projetosAtivos.value.find(p => Number(p.codigo || p.id) === Number(d.projeto))
        funcionario.projetoNome = proj ? `${proj.apelido} - ${proj.descricao}` : (d.projetoApelido || d.projetoDescricao || '-')
        
        funcionario.saldo = Number(d.saldo || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do funcionário:', error)
    } finally {
      carregandoFuncionario.value = false
    }
  }

  const buscarDetalhes = async () => {
    if (!codigoFuncionario.value) return
    carregando.value = true
    
    const payload = {
      funcionario: codigoFuncionario.value,
      ...filtro.value
    }

    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/extratoFuncionario/detalhes', {
        method: 'POST',
        body: payload
      })
      detalhes.value = response.data || []
      
      // Se tivermos dados, o último saldoAcumulado da lista (considerando a ordem) pode ser o saldo atual
      if (detalhes.value.length > 0 && filtro.value.ordenar === '1') {
          funcionario.saldo = Number(detalhes.value[0].saldoAcumulado || 0)
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do extrato:', error)
    } finally {
      carregando.value = false
    }
  }

  const exportarExcel = async () => {
    if (!codigoFuncionario.value) return
    gerandoExcel.value = true
    
    const payload = {
      funcionario: codigoFuncionario.value,
      ...filtro.value
    }

    try {
      const response: Blob = await $fetch('/api/operacao/movimentacaoBancaria/extratoFuncionario/excel', {
        method: 'POST',
        body: payload,
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(response)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Extrato_Funcionario_${codigoFuncionario.value}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
    } finally {
      gerandoExcel.value = false
    }
  }

  const voltarParaLista = () => {
    router.push('/operacao/movimentacaoBancaria/extratoFuncionario')
  }

  return {
    codigoFuncionario,
    detalhes,
    carregando,
    carregandoFuncionario,
    gerandoExcel,
    funcionario,
    filtro,
    formatarMoeda,
    mudarTipo,
    aplicarAtalhoPeriodo,
    carregarDadosFuncionario,
    buscarDetalhes,
    exportarExcel,
    voltarParaLista
  }
}
