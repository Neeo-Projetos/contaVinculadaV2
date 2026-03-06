import { ref, computed, type Ref } from 'vue'

export function usePaginacaoFrontEnd(listaCompleta: Ref<any[]>) {
  const paginaAtual = ref(1)
  const itensPorPagina = ref(10)

  const totalRegistros = computed(() => listaCompleta.value.length)
  const totalPaginas = computed(() => Math.ceil(totalRegistros.value / itensPorPagina.value))

  const registroInicial = computed(() => {
    if (totalRegistros.value === 0) return 0
    return ((paginaAtual.value - 1) * itensPorPagina.value) + 1
  })

  const registroFinal = computed(() => {
    const final = paginaAtual.value * itensPorPagina.value
    return final > totalRegistros.value ? totalRegistros.value : final
  })

  const listaPaginada = computed(() => {
    const inicio = (paginaAtual.value - 1) * itensPorPagina.value
    const fim = inicio + itensPorPagina.value
    return listaCompleta.value.slice(inicio, fim)
  })

  const paginasExibidas = computed(() => {
    const total = totalPaginas.value
    const atual = paginaAtual.value

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const paginas: (number | string)[] = []
    
    if (atual <= 4) {
      paginas.push(1, 2, 3, 4, 5, '...', total)
    } else if (atual >= total - 3) {
      paginas.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      paginas.push(1, '...', atual - 1, atual, atual + 1, '...', total)
    }

    return paginas
  })

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas.value) {
      paginaAtual.value = novaPagina
    }
  }

  const mudarItensPorPagina = (quantidade: number) => {
    itensPorPagina.value = quantidade
    paginaAtual.value = 1
  }

  const resetarPaginacao = () => {
    paginaAtual.value = 1
  }

  return {
    paginaAtual,itensPorPagina,totalRegistros,totalPaginas,
    registroInicial,registroFinal,listaPaginada,paginasExibidas,
    mudarPagina,mudarItensPorPagina,resetarPaginacao
  }
}