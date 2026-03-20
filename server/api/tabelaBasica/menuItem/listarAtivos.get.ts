import { defineEventHandler } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const pool = await useDb()
    
    // Tentativa principal baseada na arquitetura
    const sql = `
      SELECT codigo, descricao 
      FROM configuracao.menuItem 
      WHERE ativo = 1 
      ORDER BY descricao
    `
    const result = await pool.request().query(sql)

    return {
      status: 'success',
      data: result.recordset || []
    }
  } catch (error: any) {
    console.error('Falha configuracao.menuItem, tentando tabelaBasica:', error)
    
    // Fallback caso a tabela seja em outro schema
    try {
        const pool = await useDb()
        const sql2 = `SELECT codigo, descricao FROM tabelaBasica.menuItem WHERE ativo = 1 ORDER BY descricao`
        const res2 = await pool.request().query(sql2)
        return { status: 'success', data: res2.recordset || [] }
    } catch (e: any) {
        return { status: 'failed', message: e.message }
    }
  }
})
