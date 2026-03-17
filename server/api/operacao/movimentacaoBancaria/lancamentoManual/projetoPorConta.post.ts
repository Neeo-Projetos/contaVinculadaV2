import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const conta = Number(body.conta)

  if (!conta) return { status: 'success', data: { projeto: null } }

  try {
    const pool = await useDb()
    const query = `SELECT projeto FROM cadastro.projetoContaVinculada WHERE codigo = ${conta}`
    const result = await pool.request().query(query)
    
    let projeto = null
    if (result.recordset.length > 0) projeto = result.recordset[0].projeto
    
    return { status: 'success', data: { projeto } }
  } catch (erro) {
    console.error('Erro ao buscar projeto:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar projeto da conta.' }
  }
})