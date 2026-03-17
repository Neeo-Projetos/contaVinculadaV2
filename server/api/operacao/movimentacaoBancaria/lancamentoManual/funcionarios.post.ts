import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = Number(body.lancamentoManual)

  try {
    const pool = await useDb()
    const query = `
      SELECT F.nomeCompleto AS funcionario FROM operacao.lancamentoManualFuncionario LM
      LEFT JOIN cadastro.funcionario F ON F.codigo = LM.funcionario
      WHERE LM.lancamentoManual = ${id}
      `
    const result = await pool.request().query(query)
    return { status: 'success', data: result.recordset }
  } catch (erro) {
    console.error('Erro ao buscar funcionarios:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar funcionários vinculados.' }
  }
})