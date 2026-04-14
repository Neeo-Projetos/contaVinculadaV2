import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) {
    return { status: 'failed', message: 'Código não informado na requisição' }
  }

  try {
    const db = await useDb() 
    const request = db.request()
    request.input('codigo', sql.Int, codigo)

    const query = `SELECT codigo, login FROM configuracao.usuario WHERE codigo = @codigo`
    const result = await request.query(query)

    return {
      status: 'success',
      data: result.recordset[0] 
    }
  } catch (erro) {
    console.error('Erro ao recuperar o usuário:', erro)
    return { status: 'failed', message: 'Erro ao conectar ao banco de dados.' }
  }
})