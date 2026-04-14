import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { comum } from '../../../utils/comum'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigoUsuario = Number(body.codigo)

  if (!codigoUsuario) {
    return { status: 'failed', mensagem: 'Código do usuário não informado' }
  }

  try {
    const db = await useDb()
    const request = db.request()

    request.input('codigoUsuario', sql.Int, codigoUsuario)

    // Buscamos o histórico detalhado com os nomes das funcionalidades e usuários
    const result = await request.query(`
      SELECT H.dataAlteracao, U.login AS usuarioAlteracaoNome, F.nomeCompleto AS funcionalidadeNome, H.ativo AS statusNovo
      FROM configuracao.usuarioFuncionalidadeHistorico H
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      LEFT JOIN configuracao.funcionalidade F ON F.codigo = H.funcionalidade
      WHERE H.usuario = @codigoUsuario
      ORDER BY H.dataAlteracao DESC
    `)

    const rows = result.recordset
    const historicoFormatado = []

    // Lógica de agrupamento por lote (Batch)
    // Agrupamos alterações feitas no mesmo segundo pelo mesmo usuário
    const grupos: Record<string, any> = {}

    for (const row of rows) {
      const dataHoraKey = comum.formatarDataHoraBr(row.dataAlteracao)
      const chaveAgrupamento = `${dataHoraKey}-${row.usuarioAlteracaoNome}`

      if (!grupos[chaveAgrupamento]) {
        grupos[chaveAgrupamento] = {
          dataHora: dataHoraKey,
          usuario: row.usuarioAlteracaoNome || 'Sistema',
          alteracoes: [] as any[]
        }
        historicoFormatado.push(grupos[chaveAgrupamento])
      }

      const acao = (row.statusNovo === true || row.statusNovo === 1) ? 'Concedida' : 'Revogada'

      // Seguindo o tipo 'status' do histórico de usuários para renderização correta
      grupos[chaveAgrupamento].alteracoes.push({
        tipo: 'status',
        mensagem: `- A permissão para [${row.funcionalidadeNome}] foi ${acao}.`
      })
    }

    return {
      status: 'success',
      data: historicoFormatado
    }

  } catch (error: any) {
    console.error('Erro ao recuperar o histórico de permissões:', error)
    return {
      status: 'failed',
      mensagem: 'Erro ao buscar o histórico real: ' + error.message
    }
  }
})