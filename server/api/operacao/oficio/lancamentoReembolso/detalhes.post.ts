import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import { comum } from '../../../../utils/comum'

export default defineEventHandler(async (event) => {
  const { codigo: codigoBody } = await readBody(event)
  const codigo = Number(codigoBody)

  if (!codigo) return { status: 'failed', mensagem: 'Código inválido' }

  try {
    const pool = await useDb()
    const query = `
      SELECT LR.motivo, U.nomeUsuario AS usuarioCadastro, LR.dataCadastro 
      FROM operacao.lancamentoReembolso LR
      LEFT JOIN configuracao.usuario U ON U.codigo = LR.usuarioCadastro
      WHERE LR.codigo = ${codigo}
    `
    const result = await pool.request().query(query)
    
    if (result.recordset.length > 0) {
      const data = result.recordset[0]
      if (data.dataCadastro) {
        data.dataCadastro = comum.formatarDataHoraBr(data.dataCadastro)
      }
      return { status: 'success', data }
    }
    return { status: 'failed', mensagem: 'Lançamento não encontrado' }
  } catch (erro) {
    console.error('Erro ao buscar detalhes do reembolso:', erro)
    return { status: 'failed', mensagem: 'Erro interno ao buscar detalhes' }
  }
})