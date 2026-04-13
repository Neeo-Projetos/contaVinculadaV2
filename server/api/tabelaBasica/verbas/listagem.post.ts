import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  let query = `
    SELECT codigo, codigoReferencia AS codigo_verba, descricao, tipo, observacao, ativo FROM cadastro.verbas 
    WHERE (0 = 0)
  `

  if (body.codigoReferencia) query += ` AND codigoReferencia = ${Number(body.codigoReferencia)}`
  if (body.descricao) query += ` AND descricao LIKE '%${body.descricao}%'`
  if (body.tipo && body.tipo !== '') query += ` AND tipo = ${Number(body.tipo)}`
  if (body.ativo && body.ativo !== '') query += ` AND ativo = ${Number(body.ativo)}`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    return {
      status: 'success',
      data: result.recordset
    }
  } catch (erro) {
    console.error('Erro ao listar verbas:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco de dados.' }
  }
})