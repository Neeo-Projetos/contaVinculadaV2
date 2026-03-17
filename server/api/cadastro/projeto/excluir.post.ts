import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) return { status: 'failed', mensagem: 'Código não informado' }

  try {
    const pool = await useDb()
    
    const query = `UPDATE cadastro.projeto SET ativo = 0 WHERE codigo = ${codigo}`
    await pool.request().query(query)

    return { status: 'success', mensagem: 'Projeto excluído com sucesso.' }
  } catch (erro) {
    console.error('Erro ao excluir projeto:', erro)
    return { status: 'failed', mensagem: 'Erro ao excluir no banco de dados.' }
  }
})