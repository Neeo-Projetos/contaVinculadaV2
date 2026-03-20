import { defineEventHandler, getQuery } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = String(query.q || '').replace(/'/g, "''")

  if (search.trim().length < 3) return []

  try {
    const pool = await useDb()
    
    const sql = `
      SELECT TOP 12 F.codigo AS id, F.nomeUsuario AS descricao 
      FROM configuracao.usuario F 
      WHERE F.nomeUsuario LIKE '%${search}%' COLLATE Latin1_general_CI_AI 
      ORDER BY F.nomeUsuario
    `
    const result = await pool.request().query(sql)

    return result.recordset || []
  } catch (error: any) {
    console.error('Erro ao buscar autocompleteUsuario:', error)
    return []
  }
})
