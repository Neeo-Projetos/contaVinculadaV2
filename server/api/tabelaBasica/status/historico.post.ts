import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { comum } from '../../../utils/comum'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigoStatus = Number(body.codigo)

  if (!codigoStatus) {
    return { status: 'failed', mensagem: 'Status não informado' }
  }

  try {
    const db = await useDb()
    const request = db.request()
    request.input('codigoStatus', codigoStatus)

    // Consulta o histórico ordenado pela data mais recente
    const result = await request.query(`
      SELECT 
        H.codigo, H.descricao, H.ativo, H.dataAlteracao,
        U.login AS usuarioAlteracao
      FROM tabelaBasica.statusHistorico H
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      WHERE H.tipoDescricao = @codigoStatus
      ORDER BY H.dataAlteracao DESC
    `)

    const rows = result.recordset
    const historicoFormatado = []

    const dicionario: Record<string, string> = {
      descricao: 'Descrição do Status',
      ativo: 'Status'
    }

    // Compara cada registro com o anterior para identificar o que mudou
    for (let i = 0; i < rows.length; i++) {
      const atual = rows[i]
      const anterior = rows[i + 1]

      const itemHistorico = {
        dataHora: comum.formatarDataHoraBr(atual.dataAlteracao),
        usuario: atual.usuarioAlteracao || 'Sistema',
        alteracoes: [] as any[]
      }

      if (anterior) {
        let teveAlteracao = false

        for (const key of Object.keys(dicionario)) {
          let valorAtual = atual[key]
          let valorAnterior = anterior[key]

          if (valorAtual !== valorAnterior) {
            teveAlteracao = true

            if (key === 'ativo') {
              itemHistorico.alteracoes.push({
                tipo: 'status',
                mensagem: valorAtual ? '- O status foi ativado.' : '- O status foi desativado.'
              })
            } else {
              itemHistorico.alteracoes.push({
                tipo: 'campo',
                campo: dicionario[key],
                valorAntigo: valorAnterior || 'Vazio',
                valorNovo: valorAtual || 'Vazio'
              })
            }
          }
        }

        if (!teveAlteracao) {
          itemHistorico.alteracoes.push({ tipo: 'info', mensagem: '- Nenhuma alteração foi detectada nesta versão.' })
        }
      } else {
        // Primeiro registro (Criação)
        itemHistorico.alteracoes.push({ tipo: 'criacao', mensagem: '- Status cadastrado no sistema.' })
      }

      historicoFormatado.push(itemHistorico)
    }

    return { status: 'success', data: historicoFormatado }
  } catch (erro: any) {
    console.error('Erro ao recuperar o histórico do status:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico real: ' + erro.message }
  }
})