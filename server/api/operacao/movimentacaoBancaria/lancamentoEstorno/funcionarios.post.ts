import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { codigoLancamento, tipoLancamento } = body

  if (!codigoLancamento || !tipoLancamento) return { status: 'failed', data: [], mensagem: 'Parâmetros inválidos.' }

  try {
    const pool = await useDb()
    let query = ''

    if (tipoLancamento == 2) {
      query = `
        SELECT F.nomeCompleto AS funcionario FROM operacao.lancamentoManualFuncionario LMF
        INNER JOIN cadastro.funcionario F ON F.codigo = LMF.funcionario
        WHERE LMF.lancamentoManual = ${codigoLancamento}
        `
    } else if (tipoLancamento == 3) {
      query = `
        SELECT F.nomeCompleto AS funcionario FROM operacao.lancamentoReembolsoFuncionario LRF
        INNER JOIN cadastro.funcionario F ON F.codigo = LRF.funcionario
        WHERE LRF.lancamentoReembolso = ${codigoLancamento}
        `
    }

    if (!query) return { status: 'failed', data: [], mensagem: 'Tipo de lançamento não suportado.' }

    const result = await pool.request().query(query)
    return { status: 'success', data: result.recordset, mensagem: 'Funcionários carregados.' }
  } catch (erro) {
    console.error('Erro ao buscar funcionarios estorno:', erro)
    return { status: 'failed', data: [], mensagem: 'Erro interno ao buscar funcionários.' }
  }
})