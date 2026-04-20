import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const { codigo, tipoLancamento } = await readBody(event)

  if (!codigo || !tipoLancamento) return { status: 'failed', data: [], mensagem: 'Parâmetros inválidos.' }

  try {
    const db = await useDb()
    let query = ''

    if (tipoLancamento == 2) {
      query = `
        SELECT F.nomeCompleto AS funcionario FROM operacao.lancamentoManualFuncionario LMF
        INNER JOIN cadastro.funcionario F ON F.codigo = LMF.funcionario
        WHERE LMF.lancamentoManual = ${codigo}
        `
    } else if (tipoLancamento == 3) {
      query = `
        SELECT F.nomeCompleto AS funcionario FROM operacao.lancamentoReembolsoFuncionario LRF
        INNER JOIN cadastro.funcionario F ON F.codigo = LRF.funcionario
        WHERE LRF.lancamentoReembolso = ${codigo}
        `
    }

    if (!query) return { status: 'failed', data: [], mensagem: 'Tipo de lançamento não suportado.' }

    const result = await db.request().query(query)
    return { status: 'success', data: result.recordset, mensagem: 'Funcionários carregados.' }
  } catch (erro) {
    console.error('Erro ao buscar funcionarios estorno:', erro)
    return { status: 'failed', data: [], mensagem: 'Erro interno ao buscar funcionários.' }
  }
})