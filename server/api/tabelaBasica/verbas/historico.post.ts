import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { comum } from '../../../utils/comum'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const verbaId = Number(body.codigoVerba || body.codigo || body.id)

  if (!verbaId) {
    return { status: 'failed', mensagem: 'Verba não informada' }
  }

  try {
    const db = await useDb()
    const request = db.request()
    
    // Forçando o tipo sql.Int para garantir o binding correto no SQL Server
    request.input('verbaId', sql.Int, verbaId)

    const result = await request.query(`
      SELECT 
        H.codigo, H.codigoReferencia, H.descricao, H.tipo, H.observacao, H.ativo, H.dataAlteracao,
        U.login AS usuarioAlteracao
      FROM cadastro.verbasHistorico H
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      WHERE H.codigoVerba = @verbaId
      ORDER BY H.dataAlteracao DESC
    `)

    const rows = result.recordset
    const historicoFormatado = []

    const dicionario: Record<string, string> = {
      codigoReferencia: 'Cód. Referência',
      descricao: 'Descrição da Verba',
      tipo: 'Efeito Financeiro',
      observacao: 'Observações',
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
                mensagem: valorAtual ? '- A verba foi ativada.' : '- A verba foi desativada.'
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
        itemHistorico.alteracoes.push({ tipo: 'criacao', mensagem: '- Verba cadastrada no sistema.' })
      }

      historicoFormatado.push(itemHistorico)
    }

    return { status: 'success', data: historicoFormatado }
  } catch (erro: any) {
    console.error('Erro ao recuperar o histórico da verba:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar o histórico real: ' + erro.message }
  }
})