import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) {
    return { status: 'failed', mensagem: 'Código do projeto não informado.' }
  }

  try {
    const db = await useDb()
    const request = db.request()
    request.input('codigo', codigo)

    // Query simplificada para histórico de projeto
    const result = await request.query(`
      SELECT 
        H.*, 
        U.login AS usuarioAlteracao
      FROM cadastro.ProjetoHistorico H 
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      WHERE H.projeto = @codigo
      ORDER BY H.dataAlteracao DESC
    `)

    return {
      status: 'success',
      data: result.recordset.map((row: any) => ({
        dataHora: row.dataAlteracao,
        usuario: row.usuarioAlteracao || 'Sistema',
        alteracoes: [{ tipo: 'info', mensagem: 'Registro de histórico carregado.' }]
      }))
    }

  } catch (erro: any) {
    console.error('Erro ao recuperar histórico de projeto:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar o histórico: ' + erro.message }
  }
})
