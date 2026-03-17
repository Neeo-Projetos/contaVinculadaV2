import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const cnpj = body.cnpj

  if (!cnpj) return { status: 'failed' }

  try {
    const pool = await useDb()
    const query = `SELECT COUNT(cnpj) as total FROM cadastro.projeto WHERE cnpj = '${cnpj}' AND ativo = 1`
    const result = await pool.request().query(query)

    if (result.recordset[0].total > 0) {
      return { status: 'success' }
    }
    return { status: 'failed' }
  } catch (erro) {
    console.error('Erro ao verificar CNPJ:', erro)
    return { status: 'failed', mensagem: 'Erro ao verificar CNPJ.' }
  }
})