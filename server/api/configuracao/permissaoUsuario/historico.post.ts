import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = body.codigo

  if (!codigo) {
    return { status: 'failed', message: 'Usuário não informado' }
  }

  try {
    const pool = await useDb() 

    // const query = `SELECT DISTINCT CONVERT(VARCHAR(19), H.dataAlteracao, 120) AS dataAlteracao, U.login AS usuarioAlteracao, H.usuario 
    //                FROM configuracao.usuarioFuncionalidadeHistorico H 
    //                LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
    //                WHERE H.usuario = ${Number(usuarioId)} ORDER BY 1 DESC`
    // const result = await pool.request().query(query)

    const mockHistorico = [
      {
        codigo: 9991,
        dataAlteracao: '25/02/2026 10:30',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- A permissão para: Gravar Dados foi Concedida.',
          '- A permissão para: Excluir Registros foi Removida.'
        ]
      }
    ]

    return {
      status: 'success',
      data: mockHistorico
    }
  } catch (erro) {
    console.error('Erro ao puxar o histórico:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})