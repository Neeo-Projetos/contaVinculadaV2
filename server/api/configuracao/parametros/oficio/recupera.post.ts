import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = body.codigo || body.id

  if (!codigo || codigo === '0') {
    return { status: 'failed', mensagem: 'Código inválido' }
  }

  try {
    const db = await useDb()
    const result = await db.request()
        .input('codigo', sql.Int, Number(codigo))
        .query(`SELECT codigo, projeto, redacaoOficio, saldoOficio FROM configuracao.parametroOficio WHERE codigo = @codigo`)

    if (result.recordset.length > 0) {
      const data = result.recordset[0]
      return {
        status: 'success',
        data: {
          codigo: data.codigo,
          projeto: data.projeto,
          texto: data.redacaoOficio,
          saldoOficio: data.saldoOficio ? (data.saldoOficio == 1 ? 'comSaldo' : 'semSaldo') : 'semSaldo'
        }
      }
    }
    
    return { status: 'failed', mensagem: 'Parametrização de ofício não encontrada' }
  } catch (error: any) {
    console.error('Erro ao recuperar o ofício:', error)
    return { status: 'failed', mensagem: 'Erro ao buscar dados: ' + error.message }
  }
})