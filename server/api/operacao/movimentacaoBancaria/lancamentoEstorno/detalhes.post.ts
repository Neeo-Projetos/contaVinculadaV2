import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import { comum } from '../../../../utils/comum'

export default defineEventHandler(async (event) => {
  const { codigo, tipoLancamento } = await readBody(event)

  if (!codigo || !tipoLancamento) return { status: 'failed', mensagem: 'Parâmetros inválidos' }

  try {
    const db = await useDb()
    let query = ''

    if (tipoLancamento == 2) {
      // Detalhes do Lançamento Manual
      query = `
        SELECT LM.motivo, U.nomeUsuario AS usuarioCadastro, LM.dataCadastro 
        FROM operacao.lancamentoManual LM
        LEFT JOIN configuracao.usuario U ON U.codigo = LM.usuarioCadastro
        WHERE LM.codigo = ${codigo}
      `
    } else if (tipoLancamento == 3) {
      // Detalhes do Lançamento Reembolso
      query = `
        SELECT LR.motivo, U.nomeUsuario AS usuarioCadastro, LR.dataCadastro 
        FROM operacao.lancamentoReembolso LR
        LEFT JOIN configuracao.usuario U ON U.codigo = LR.usuarioCadastro
        WHERE LR.codigo = ${codigo}
      `
    }

    if (!query) return { status: 'failed', mensagem: 'Origem desconhecida' }

    const result = await db.request().query(query)

    if (result.recordset.length > 0) {
      const data = result.recordset[0]
      if (data.dataCadastro) {
        data.dataCadastro = comum.formatarDataHoraBr(data.dataCadastro)
      }
      return { status: 'success', data }
    }
    
    return { status: 'failed', mensagem: 'Registro original não encontrado' }
    
  } catch (erro) {
    console.error('Erro ao recuperar detalhes do estorno:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco de dados.' }
  }
})
