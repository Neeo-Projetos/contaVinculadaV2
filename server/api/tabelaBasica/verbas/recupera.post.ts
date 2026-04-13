import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)
  
  if (!codigo) {
    return { status: 'failed', mensagem: 'Código inválido' }
  }

  const query = `
    SELECT codigo, codigoReferencia, descricao, tipo, observacao, ativo FROM cadastro.verbas 
    WHERE codigo = ${codigo}
  `

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) {
      return { status: 'success', data: result.recordset[0] }
    }
    
    return { status: 'failed', mensagem: 'Registro não encontrado' }
  } catch (erro: any) {
    console.error('Erro ao recuperar verba:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco: ' + (erro.message || erro) }
  }
})