import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { comum } from '../../../utils/comum'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const tipoMovimentacaoId = Number(body.tipoMovimentacao || body.codigo || body.id)

  if (!tipoMovimentacaoId) return { status: 'failed', message: 'Tipo de movimentação não informado' }

  try {
    const db = await useDb()
    const request = db.request()
    request.input('tipoId', tipoMovimentacaoId)

    const result = await request.query(`
      SELECT 
        H.codigo, H.descricao, H.tipo, H.ativo, H.dataAlteracao,
        U.login AS usuarioAlteracao
      FROM tabelaBasica.tipoMovimentacaoHistorico H
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      WHERE H.tipoMovimentacao = @tipoId
      ORDER BY H.dataAlteracao DESC
    `)

    const rows = result.recordset
    const historicoFormatado = []

    const dicionario: Record<string, string> = {
      descricao: 'Descrição do Tipo',
      tipo: 'Efeito Financeiro',
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
          let valorAtual = atual[key]
          let valorAnterior = anterior[key]

          if (valorAtual !== valorAnterior) {
            teveAlteracao = true

            if (key === 'ativo') {
              itemHistorico.alteracoes.push({
                tipo: 'status',
                mensagem: valorAtual ? '- O tipo de movimentação foi ativado.' : '- O tipo de movimentação foi desativado.'
              })
            } else if (key === 'tipo') {
                const label = (v: any) => Number(v) === 1 ? 'Crédito (+)' : 'Débito (-)'
                itemHistorico.alteracoes.push({
                    tipo: 'campo',
                    campo: dicionario[key],
                    valorAntigo: label(valorAnterior),
                    valorNovo: label(valorAtual)
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
          itemHistorico.alteracoes.push({ tipo: 'info', mensagem: '- Nenhuma alteração detectada.' })
        }
      } else {
        itemHistorico.alteracoes.push({ tipo: 'criacao', mensagem: '- Registro cadastrado no sistema.' })
      }

      historicoFormatado.push(itemHistorico)
    }

    return { status: 'success', data: historicoFormatado }
  } catch (erro: any) {
    console.error('Erro ao recuperar o histórico:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico real: ' + erro.message }
  }
})