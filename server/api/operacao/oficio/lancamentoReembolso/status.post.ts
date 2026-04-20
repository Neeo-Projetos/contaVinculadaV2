import { defineEventHandler } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const pool = await useDb()
    const query = `
      SELECT codigo, descricao 
      FROM tabelaBasica.status 
      WHERE ativo = 1 
      ORDER BY descricao
    `
    const result = await pool.request().query(query)
    return { status: 'success', data: result.recordset }
  } catch (erro) {
    console.error('Erro ao buscar status:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar status.' }
  }
})
