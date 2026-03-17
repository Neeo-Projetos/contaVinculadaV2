import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  let query = `
    SELECT P.codigo, P.apelido, P.descricao, P.cnpj, P.ativo FROM cadastro.projeto P 
    WHERE (0 = 0)
  `

  if (body.projetoId) query += ` AND P.codigo = ${Number(body.projetoId)}`
  if (body.apelido) query += ` AND P.apelido LIKE '%${body.apelido}%'`
  if (body.cnpj) query += ` AND P.cnpj = '${body.cnpj}'`
  if (body.ativo && body.ativo !== '') query += ` AND P.ativo = ${Number(body.ativo)}`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)
    return { status: 'success', data: result.recordset }
  } catch (erro) {
    console.error('Erro ao listar projetos:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar projetos no banco.' }
  }
})