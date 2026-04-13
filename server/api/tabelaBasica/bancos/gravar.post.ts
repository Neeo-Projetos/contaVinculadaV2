import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo) || 0
  const codigoBanco = Number(body.codigoBanco)
  const nomeBanco = body.nomeBanco ? `'${body.nomeBanco.replace(/'/g, "''")}'` : 'NULL'
  const usuario = 1 

  const queryExec = `EXEC tabelaBasica.banco_Atualiza ${codigo}, ${codigoBanco}, ${nomeBanco}, ${usuario}, 1`

  try {
    const pool = await useDb()
    await pool.request().query(queryExec)
    return { status: 'success', mensagem: 'Operação realizada com sucesso.' }
  } catch (erro: any) {
    console.error('Erro ao gravar banco:', erro)
    return { status: 'failed', mensagem: 'Erro ao gravar no banco de dados: ' + (erro.message || erro) }
  }
})