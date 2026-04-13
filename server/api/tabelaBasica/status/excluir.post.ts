import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) return { status: 'failed', mensagem: 'Código não informado' }

  const usuario = 1 

  try {
    const pool = await useDb()
    
    const selectQuery = `SELECT descricao FROM tabelaBasica.status WHERE codigo = ${codigo}`
    const resultQuery = await pool.request().query(selectQuery)

    if (resultQuery.recordset.length === 0) {
       return { status: 'failed', mensagem: 'Registro não encontrado para exclusão.' }
    }

    const rec = resultQuery.recordset[0]
    const descSql = rec.descricao ? `'${rec.descricao.replace(/'/g, "''")}'` : 'NULL'

    const queryExec = `EXEC tabelaBasica.status_Atualiza ${codigo}, ${descSql}, ${usuario}, 0`
    await pool.request().query(queryExec)

    return { status: 'success', mensagem: 'Registro excluído com sucesso.' }
  } catch (erro: any) {
    console.error('Erro ao excluir status:', erro)
    return { status: 'failed', mensagem: 'Erro ao excluir no banco de dados: ' + (erro.message || erro) }
  }
})