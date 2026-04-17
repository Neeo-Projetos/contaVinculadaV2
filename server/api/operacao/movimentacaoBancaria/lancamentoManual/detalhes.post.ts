import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = Number(body.lancamentoManual)

  if (!id) return { status: 'failed', mensagem: 'ID inválido' }

  const query = `
    SELECT LM.motivo, U.nomeUsuario AS usuarioCadastro, LM.dataCadastro 
    FROM operacao.lancamentoManual LM
    LEFT JOIN configuracao.usuario U ON U.codigo = LM.usuarioCadastro
    WHERE LM.codigo = ${id}
  `

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) {
      const data = result.recordset[0]
      if (data.dataCadastro) {
        const d = new Date(data.dataCadastro)
        data.dataCadastro = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} - ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      }
      return { status: 'success', data }
    }
    return { status: 'failed', mensagem: 'Registro não encontrado' }
  } catch (erro) {
    console.error('Erro ao recuperar detalhes:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco de dados.' }
  }
})
