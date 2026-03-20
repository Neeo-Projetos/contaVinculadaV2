import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const menuItem = Number(body.menuItem) || 0
  const usuarioId = Number(body.usuario) || 0

  if (!menuItem) {
    return { status: 'failed', message: 'Menu Item não informado.' }
  }

  try {
    const pool = await useDb()
    
    const sql = `
      SELECT F.codigo, F.nome, F.nomeCompleto, F.menuItem AS menuItem, F.ativo, 
      CASE WHEN UF.codigo IS NOT NULL AND UF.ativo = 1 THEN 1 ELSE 0 END AS marcado 
      FROM configuracao.funcionalidade F
      LEFT JOIN configuracao.usuarioFuncionalidade UF ON UF.funcionalidade = F.codigo AND UF.usuario = ${usuarioId}
      WHERE F.menuItem = ${menuItem} AND F.ativo = 1
      ORDER BY F.nomeCompleto
    `
    const result = await pool.request().query(sql)

    return {
      status: 'success',
      data: result.recordset || []
    }
  } catch (error: any) {
    console.error('Erro ao listar permissoesPorMenu:', error)
    return { status: 'failed', message: error.message }
  }
})
