import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const codigo = Number(body.codigo) || 0
  const codigoReferencia = Number(body.codigoReferencia)
  const descricao = body.descricao || ''
  const tipo = Number(body.tipo)
  const observacao = body.observacao || ''
  const usuario = 1 

  try {
    const pool = await useDb()
    const request = pool.request()
    
    request.input('codigo', sql.Int, codigo)
    request.input('codigoReferencia', sql.Int, codigoReferencia)
    request.input('descricao', sql.VarChar, descricao)
    request.input('tipo', sql.Bit, tipo)
    request.input('observacao', sql.VarChar, observacao)
    request.input('usuario', sql.Int, usuario)
    request.input('ativo', sql.Bit, 1)

    const queryExec = `EXEC cadastro.verba_Atualiza @codigo, @codigoReferencia, @descricao, @tipo, @observacao, @usuario, @ativo`
    
    await request.query(queryExec)

    return { status: 'success', mensagem: 'Operação realizada com sucesso.' }
  } catch (erro: any) {
    console.error('Erro ao gravar verba:', erro)
    return { status: 'failed', mensagem: 'Erro ao gravar no banco: ' + (erro.message || erro) }
  }
})