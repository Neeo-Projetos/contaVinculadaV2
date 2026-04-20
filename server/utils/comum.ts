/**
 * Utilitários comuns para o servidor (Backend)
 * Centraliza validações e formatações seguindo a regra de negócio do sistema.
 * 
 * @author Antigravity
 */

export const comum = {
  /**
   * Valida CPF (Algoritmo oficial)
   */
  validaCPF(cpf: string | null): boolean {
    if (!cpf) return false
    const d = cpf.replace(/\D/g, '')
    if (d.length !== 11 || !!d.match(/(\d)\1{10}/)) return false
    let s = 0
    for (let i = 0; i < 9; i++) s += parseInt(d.charAt(i)) * (10 - i)
    let r = 11 - (s % 11)
    if (r === 10 || r === 11) r = 0
    if (r !== parseInt(d.charAt(9))) return false
    s = 0
    for (let i = 0; i < 10; i++) s += parseInt(d.charAt(i)) * (11 - i)
    r = 11 - (s % 11)
    if (r === 10 || r === 11) r = 0
    if (r !== parseInt(d.charAt(10))) return false
    return true
  },

  /**
   * Valida CNPJ (Algoritmo oficial)
   */
  validaCNPJ(cnpj: string | null): boolean {
    if (!cnpj) return false
    const d = cnpj.replace(/\D/g, '')
    if (d.length !== 14 || !!d.match(/(\d)\1{13}/)) return false
    let size = d.length - 2
    let numbers = d.substring(0, size)
    const digits = d.substring(size)
    let sum = 0
    let pos = size - 7
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(0))) return false
    size = size + 1
    numbers = d.substring(0, size)
    sum = 0
    pos = size - 7
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(1))) return false
    return true
  },

  /**
   * Formata CPF com máscara (000.000.000-00)
   */
  formatarCpf(doc: string | null): string {
    if (!doc) return ''
    const d = doc.replace(/\D/g, '')
    if (d.length !== 11) return doc
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  },

  /**
   * Converte data para formato BR (DD/MM/YYYY)
   */
  formatarDataBr(data: any): string {
    if (!data) return ''
    const d = new Date(data)
    if (isNaN(d.getTime())) return String(data)
    return d.toLocaleDateString('pt-BR')
  },

  /**
   * Converte data e hora para formato BR (DD/MM/YYYY - HH:MM)
   */
  formatarDataHoraBr(data: any): string {
    if (!data) return ''
    const d = new Date(data)
    if (isNaN(d.getTime())) return String(data)
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).replace(', ', ' - ')
  },

  /**
   * Converte data para formato SQL (YYYY-MM-DD)
   */
  formatarDataSql(data: string | null): string | null {
    if (!data) return null
    if (data.includes('-')) return data // já está em sql
    const partes = data.split('/')
    if (partes.length !== 3) return data
    return `${partes[2]}-${partes[1]}-${partes[0]}`
  },

  /**
   * Abrevia nome mantendo o primeiro e o último (ou conforme lógica do PHP de abreviar do meio)
   */
  abreviarNome(nome: string | null): string {
    if (!nome) return ''
    if (nome.length <= 25) return nome
    const partes = nome.trim().split(/\s+/)
    if (partes.length <= 2) return nome
    const abreviado = partes.map((p, i) => {
      if (i === 0 || i === partes.length - 1) return p
      if (p.length > 3) return p[0] + '.'
      return p
    })
    return abreviado.join(' ')
  },

  /**
   * Valida valor para visualização (Moeda formatada)
   */
  validaValorRecupera(valor: number | null): string {
    if (valor === null || valor === undefined) return '0,00'
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)
  },

  /**
   * Converte valor moeda formatado (R$ 1.234,56) para decimal SQL (1234.56)
   */
  validaValorSql(valor: string | number | null): number {
    if (valor === null || valor === undefined || valor === '') return 0
    if (typeof valor === 'number') return valor
    
    const limpo = String(valor)
      .replace('R$', '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
    
    const num = parseFloat(limpo)
    return isNaN(num) ? 0 : num
  }
}
