import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const menuItem = Number(body.menuItem) || 0
  const codigoUsuario = Number(body.codigo) || 0

  if (!menuItem) {
    return { status: 'failed', message: 'Menu Item não informado.' }
  }

  try {
    const db = await useDb()
    const request = db.request()
    
    request.input('menuItem', sql.Int, menuItem)
    request.input('codigoUsuario', sql.Int, codigoUsuario)

    const baseQuery = `
      SELECT 
        F.codigo as idFuncionalidade, 
        F.nome, 
        F.nomeCompleto, 
        F.menuItem, 
        F.ativo,
        CASE 
            WHEN UF.codigo IS NOT NULL AND UF.ativo = 1 THEN 1 
            ELSE 0 
        END AS marcado 
      FROM configuracao.funcionalidade F
      LEFT JOIN configuracao.usuarioFuncionalidade UF 
        ON UF.funcionalidade = F.codigo 
        AND UF.usuario = @codigoUsuario
      WHERE F.menuItem = @menuItem AND F.ativo = 1
      ORDER BY F.nomeCompleto
    `
    const result = await request.query(baseQuery)

    return {
      status: 'success',
      data: result.recordset || []
    }
  } catch (error: any) {
    console.error('Erro ao listar permissoesPorMenu:', error)
    return { status: 'failed', message: error.message }
  }
})
