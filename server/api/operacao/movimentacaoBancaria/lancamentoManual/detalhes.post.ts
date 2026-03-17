import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = Number(body.lancamentoManual)

  try {
    const pool = await useDb()
    const query = `
      SELECT LM.motivo, U.login AS usuarioCadastro, LM.dataCadastro FROM operacao.lancamentoManual LM
      LEFT JOIN configuracao.usuario U ON U.codigo = LM.usuarioCadastro
      WHERE LM.codigo = ${id}
      `
      
    const result = await pool.request().query(query)
    let data = { motivo: '', usuarioCadastro: '', dataCadastro: '' }
    
    if (result.recordset.length > 0) {
      data = result.recordset[0]
      if(data.dataCadastro) {
         const d = new Date(data.dataCadastro)
         data.dataCadastro = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      }
    }
    return { status: 'success', data }
  } catch (erro) {
    console.error('Erro ao buscar detalhe:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar detalhes no banco.' }
  }
})