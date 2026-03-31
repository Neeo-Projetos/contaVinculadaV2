import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await useDb()
  
  try {
    const request = db.request()
    let query = `
      SELECT P.codigo, P.apelido, P.descricao, P.cnpj, P.ativo FROM cadastro.projeto P 
      WHERE (1 = 1)
    `

    if (body.projetoId) {
      query += ` AND P.codigo = @projetoId`
      request.input('projetoId', Number(body.projetoId))
    }
    
    if (body.apelidoParam) {
      query += ` AND P.apelido LIKE @apelido`
      request.input('apelido', `%${body.apelidoParam}%`)
    }

    if (body.cnpjParam) {
      query += ` AND P.cnpj = @cnpj`
      request.input('cnpj', body.cnpjParam)
    }

    if (body.ativoParam && body.ativoParam !== '') {
      query += ` AND P.ativo = @ativo`
      request.input('ativo', Number(body.ativoParam))
    }

    const result = await request.query(query)
    return { status: 'success', results: result.recordset }

  } catch (erro) {
    console.error('Erro ao listar projetos:', erro)
    return { status: 'failed', message: 'Erro ao buscar projetos no banco.' }
  }
})