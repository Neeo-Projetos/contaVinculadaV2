import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) return { status: 'failed', mensagem: 'Código inválido' }

  const query = `SELECT codigo, descricao, ativo FROM tabelaBasica.classificacao WHERE codigo = ${codigo}`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) return { status: 'success', data: result.recordset[0] }
    return { status: 'failed', message: 'Registro não encontrado' }
  } catch (erro) {
    console.error('Erro ao recuperar classificação:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco de dados.' }
  }
})