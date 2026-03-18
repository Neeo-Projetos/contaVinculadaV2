import { ref, reactive, computed, onMounted } from 'vue'

export function useParametrosOficioListagem() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = reactive({
    projetoNome: ''
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const buscarLista = async () => {
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/configuracao/parametros/oficio/listagem', {
        method: 'POST', body: filtro
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar ofícios', error)
    } finally {
      carregando.value = false
    }
  }

  // Histórico
  const modalHistoricoAberto = ref(false)
  const historicoData = ref<any[]>([])
  const abrirHistorico = async (id: number) => {
    try {
      const response = await $fetch<any>('/api/configuracao/parametros/oficio/historico', {
        method: 'POST', body: { parametroOficio: id }
      })
      historicoData.value = response.data || []
      modalHistoricoAberto.value = true
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    }
  }

  // Redação Padrão
  const modalPadraoAberto = ref(false)
  const salvandoPadrao = ref(false)
  const padrao = reactive({ tipoSaldo: '1', texto: '' })
  const variaveis = [
    { codigo: '$cidadeData$', desc: 'Cidade/Data' },
    { codigo: '$nomeOrgao$', desc: 'Nome do Órgão' },
    { codigo: '$enderecoCompleto$', desc: 'Endereço' },
    { codigo: '$numContrato$', desc: 'Nº Contrato' },
    { codigo: '$numeroOficio$', desc: 'Nº Ofício' },
    { codigo: '$anoOficio$', desc: 'Ano Atual' },
    { codigo: '$assunto$', desc: 'Assunto' },
    { codigo: '$cnpj$', desc: 'CNPJ' },
    { codigo: '$periodoReferencia$', desc: 'Mês/Ano' },
    { codigo: '$signatarioNome$', desc: 'Quem assina' },
    { codigo: '$setor$', desc: 'Setor Resp.' },
    { codigo: '$valor$', desc: 'Valor (R$)' },
    { codigo: '$valorExtenso$', desc: 'Valor Extenso' }
  ]

  const carregarModeloPadrao = async () => {
    try {
      const res = await $fetch<any>('/api/configuracao/parametros/oficio/recuperaPadrao', {
        method: 'POST',
        body: { tipoSaldo: Number(padrao.tipoSaldo) }
      })
      padrao.texto = res.data || ''
    } catch (error) {
      console.error('Erro ao buscar modelo padrão', error)
      padrao.texto = ''
    }
  }

  const abrirModalPadrao = async () => {
    padrao.tipoSaldo = '1'
    await carregarModeloPadrao()
    modalPadraoAberto.value = true
  }

  const gravarModeloPadrao = async () => {
    if (!padrao.texto) return alert("O texto padrão não pode ficar vazio.")
    salvandoPadrao.value = true
    try {
      const res = await $fetch<any>('/api/configuracao/parametros/oficio/gravaPadrao', {
        method: 'POST',
        body: padrao
      })
      if (res.status === 'success') {
        modalPadraoAberto.value = false
      } else {
        alert(res.mensagem)
      }
    } catch (error) {
      alert("Erro ao gravar modelo padrão.")
    } finally {
      salvandoPadrao.value = false
    }
  }

  const copiarVariavel = (texto: string) => {
    navigator.clipboard.writeText(texto)
    // No "Ouro" geralmente usamos um toast, mas manterei o alert simples ou removerei se o usuário preferir
  }

  onMounted(() => {
    buscarLista()
  })

  return {
    carregando,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarLista,
    
    // Histórico
    modalHistoricoAberto,
    historicoData,
    abrirHistorico,

    // Redação Padrão
    modalPadraoAberto,
    salvandoPadrao,
    padrao,
    variaveis,
    carregarModeloPadrao,
    abrirModalPadrao,
    gravarModeloPadrao,
    copiarVariavel,

    // Paginação
    dados: paginacao.listaPaginada,
    paginaAtual: paginacao.paginaAtual,
    itensPorPagina: paginacao.itensPorPagina,
    totalRegistros: paginacao.totalRegistros,
    totalPaginas: paginacao.totalPaginas,
    registroInicial: paginacao.registroInicial,
    registroFinal: paginacao.registroFinal,
    paginasExibidas: paginacao.paginasExibidas,
    mudarPagina: paginacao.mudarPagina,
    mudarItensPorPagina: paginacao.mudarItensPorPagina
  }
}
