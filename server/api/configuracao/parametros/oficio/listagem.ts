import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    const db = await useDb()
    const request = db.request()

    let whereConditions = ['PO.projeto IS NOT NULL']

    if (body.projetoId) {
      request.input('projetoId', sql.Int, body.projetoId)
      whereConditions.push('PO.projeto = @projetoId')
    } else if (body.projetoNome) {
      request.input('projetoNome', sql.VarChar, `%${body.projetoNome}%`)
      whereConditions.push('(CP.descricao LIKE @projetoNome OR CP.apelido LIKE @projetoNome)')
    }

    if (body.comSaldo !== undefined && body.comSaldo !== null && body.comSaldo !== '') {
      request.input('comSaldo', sql.Int, Number(body.comSaldo))
      whereConditions.push('PO.saldoOficio = @comSaldo')
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    const query = `
      SELECT 
        PO.codigo, 
        CP.apelido, 
        CP.descricao as projeto, 
        PO.saldoOficio 
      FROM configuracao.parametroOficio PO
      LEFT JOIN cadastro.projeto CP ON CP.codigo = PO.projeto 
      ${whereClause}
      ORDER BY CP.apelido ASC
    `

    const result = await request.query(query)

    return {
      status: 'success',
      data: result.recordset
    }
  } catch (error: any) {
    console.error('Erro na listagem de ofícios:', error)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco: ' + error.message }
  }
})