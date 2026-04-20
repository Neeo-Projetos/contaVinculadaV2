import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const { codigo: codigoBody } = await readBody(event)
  const codigo = Number(codigoBody)

  try {
    const pool = await useDb()
    const query = `
      SELECT F.nomeCompleto AS funcionario 
      FROM operacao.lancamentoReembolsoFuncionario LR
      LEFT JOIN cadastro.funcionario F ON F.codigo = LR.funcionario
      WHERE LR.lancamentoReembolso = ${codigo}
    `
    const result = await pool.request().query(query)
    return result.recordset
  } catch (erro) {
    return []
  }
})