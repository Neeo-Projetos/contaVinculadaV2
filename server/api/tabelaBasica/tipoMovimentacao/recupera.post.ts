import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = Number(body.id)

  if (!id) return { status: 'failed', mensagem: 'ID inválido' }

  const query = `SELECT codigo, descricao, tipo, ativo FROM tabelaBasica.tipoMovimentacao WHERE codigo = ${id}`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) return { status: 'success', data: result.recordset[0] }
    return { status: 'failed', mensagem: 'Registro não encontrado' }
  } catch (erro: any) {
    console.error('Erro ao recuperar tipo de movimentação:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco: ' + (erro.message || erro) }
  }
})