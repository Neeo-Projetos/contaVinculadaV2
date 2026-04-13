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

    const result = await request.query(`
      SELECT 
        H.codigo, H.login, H.nomeUsuario, H.cpf, H.email, H.telefone, H.ativo, H.tipoUsuario, H.dataAlteracao,
        U.login AS usuarioAlteracaoNome
      FROM configuracao.usuarioHistorico H
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      WHERE H.usuario = @codigoUsuario
      ORDER BY H.dataAlteracao DESC
    `)

    const rows = result.recordset
    const historicoFormatado = []

    const dicionario: Record<string, string> = {
      nomeUsuario: 'Nome Completo',
      login: 'Login',
      email: 'E-mail',
      cpf: 'CPF',
      telefone: 'Telefone',
      ativo: 'Status',
      tipoUsuario: 'Tipo de Acesso'
    }

    for (let i = 0; i < rows.length; i++) {
        const atual = rows[i]
        const anterior = rows[i + 1]

        const itemHistorico = {
            dataHora: comum.formatarDataHoraBr(atual.dataAlteracao),
            usuario: atual.usuarioAlteracaoNome || 'Sistema',
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
                            mensagem: valorAtual ? '- O acesso do usuário foi ativado.' : '- O acesso do usuário foi desativado.'
                        })
                    } else if (key === 'tipoUsuario') {
                        const label = (v: any) => v === 'S' ? 'Administrador' : 'Usuário Comum'
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
                itemHistorico.alteracoes.push({ tipo: 'info', mensagem: '- Nenhuma alteração detectada nos dados básicos.' })
            }
        } else {
            itemHistorico.alteracoes.push({ tipo: 'criacao', mensagem: '- Usuário criado no sistema.' })
        }

        historicoFormatado.push(itemHistorico)
    }

    return { status: 'success', data: historicoFormatado }
  } catch (erro: any) {
    console.error('Erro ao recuperar o histórico do usuário:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar o histórico real: ' + erro.message }
  }
})
