import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) {
    return { status: 'failed', mensagem: 'Código não informado' }
  }

  const usuario = 1 

  try {
    const pool = await useDb()
    
    const requestSelect = pool.request()
    requestSelect.input('codigo', sql.Int, codigo)
    const selectQuery = `SELECT codigoReferencia, descricao, tipo, observacao FROM cadastro.verbas WHERE codigo = @codigo`
    const resultQuery = await requestSelect.query(selectQuery)

    if (resultQuery.recordset.length === 0) {
       return { status: 'failed', mensagem: 'Registro não encontrado para exclusão.' }
    }

    const rec = resultQuery.recordset[0]
    
    const requestExec = pool.request()
    requestExec.input('codigo', sql.Int, codigo)
    requestExec.input('codigoReferencia', sql.Int, rec.codigoReferencia)
    requestExec.input('descricao', sql.VarChar, rec.descricao)
    requestExec.input('tipo', sql.Bit, rec.tipo)
    requestExec.input('observacao', sql.VarChar, rec.observacao)
    requestExec.input('usuario', sql.Int, usuario)
    requestExec.input('ativo', sql.Bit, 0)

    const queryExec = `EXEC cadastro.verba_Atualiza @codigo, @codigoReferencia, @descricao, @tipo, @observacao, @usuario, @ativo`
    
    await requestExec.query(queryExec)

    return { status: 'success', mensagem: 'Registro excluído com sucesso.' }
  } catch (erro: any) {
    console.error('Erro ao excluir verba:', erro)
    return { status: 'failed', mensagem: 'Erro ao excluir no banco: ' + (erro.message || erro) }
  }
})