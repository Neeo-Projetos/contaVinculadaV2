import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { comum } from '../../../utils/comum'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigoClassificacao = Number(body.codigo)

  if (!codigoClassificacao) {
    return { status: 'failed', mensagem: 'Classificação não informada' }
  }

  try {
    const db = await useDb()
    const request = db.request()
    request.input('codigoClassificacao', codigoClassificacao)

    const result = await request.query(`
      SELECT 
        H.codigo, H.descricao, H.ativo, H.dataAlteracao,
        U.login AS usuarioAlteracao
      FROM tabelaBasica.classificacaoHistorico H
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      WHERE H.classificacao = @codigoClassificacao
      ORDER BY H.dataAlteracao DESC
    `)

    const rows = result.recordset
    const historicoFormatado = []

    const dicionario: Record<string, string> = {
      descricao: 'Descrição da Classificação',
      ativo: 'Status'
    }

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
          const valorAtual = atual[key]
          const valorAnterior = anterior[key]

          if (valorAtual !== valorAnterior) {
            teveAlteracao = true

            if (key === 'ativo') {
              itemHistorico.alteracoes.push({
                tipo: 'status',
                mensagem: valorAtual ? '- A classificação foi ativada.' : '- A classificação foi desativada.'
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
          itemHistorico.alteracoes.push({ tipo: 'info', mensagem: '- Nenhuma alteração detectada nesta versão.' })
        }
      } else {
        itemHistorico.alteracoes.push({ tipo: 'criacao', mensagem: '- Classificação cadastrada no sistema.' })
      }

      historicoFormatado.push(itemHistorico)
    }

    return { status: 'success', data: historicoFormatado }
  } catch (erro: any) {
    console.error('Erro ao recuperar o histórico da classificação:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico real: ' + erro.message }
  }
})