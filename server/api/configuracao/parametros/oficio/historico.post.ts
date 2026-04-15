import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import { comum } from '../../../../utils/comum'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo || body.parametroOficio)

  if (!codigo) {
    return { status: 'failed', mensagem: 'Código do parâmetro não informado' }
  }

  try {
    const db = await useDb()
    const request = db.request()
    
    request.input('parametroOficio', sql.Int, codigo)

    // Buscamos o histórico real do banco de dados
    // Incluímos os campos necessários para a comparação detalhada
    const result = await request.query(`
      SELECT 
        H.codigo, H.redacaoOficio, H.saldoOficio, H.dataAlteracao,
        U.login AS usuarioAlteracaoNome
      FROM configuracao.parametroOficioHistorico H
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      WHERE H.parametroOficio = @parametroOficio
      ORDER BY H.dataAlteracao DESC
    `)

    const rows = result.recordset
    const historicoFormatado = []

    // Função para gerar o diff visual entre dois textos (palavra por palavra)
    const gerarDiffTexto = (textoAntigo: string, textoNovo: string) => {
        const palavrasAntigas = (textoAntigo || '').split(' ')
        const palavrasNovas = (textoNovo || '').split(' ')
        
        let htmlDe = ''
        let htmlPara = ''
        
        const totalPalavras = Math.max(palavrasAntigas.length, palavrasNovas.length)
        
        for (let k = 0; k < totalPalavras; k++) {
            const pAntiga = palavrasAntigas[k] ?? ''
            const pNova = palavrasNovas[k] ?? ''
            
            if (pAntiga === pNova) {
                htmlDe += `<span style="color: #808080;">${pAntiga}</span> `
                htmlPara += `<span style="color: #808080;">${pNova}</span> `
            } else {
                if (pAntiga !== '') {
                    htmlDe += `<span style="color:#cc0000; font-weight:bold; text-decoration: line-through;">${pAntiga}</span> `
                }
                if (pNova !== '') {
                    htmlPara += `<span style="color:green; font-weight:bold;">${pNova}</span> `
                }
            }
        }
        
        return `
            <span style="color: #e6a700; font-weight: bold;">- O campo da Redação Ofício foi alterado:</span><br>
            <div style="margin-bottom: 5px; padding-left: 5px; margin-top: 5px;">
                <strong>DE:</strong> ${htmlDe}
            </div>
            <div style="padding-left: 5px;">
                <strong>PARA:</strong> ${htmlPara}
            </div>
        `
    }

    for (let i = 0; i < rows.length; i++) {
        const atual = rows[i]
        const anterior = rows[i + 1] // No SQL DESC, o "i+1" é o registro cronologicamente anterior

        const itemHistorico = {
            dataHora: comum.formatarDataHoraBr(atual.dataAlteracao),
            usuario: atual.usuarioAlteracaoNome || 'Sistema',
            alteracoes: [] as any[]
        }

        if (anterior) {
            let teveAlteracao = false

            // Comparação de Redação Ofício (com Diff Visual)
            if (atual.redacaoOficio !== anterior.redacaoOficio) {
                teveAlteracao = true
                itemHistorico.alteracoes.push({
                    tipo: 'html',
                    mensagem: gerarDiffTexto(anterior.redacaoOficio, atual.redacaoOficio)
                })
            }

            // Comparação de Saldo
            if (atual.saldoOficio !== anterior.saldoOficio) {
                teveAlteracao = true
                itemHistorico.alteracoes.push({
                    tipo: 'info',
                    mensagem: atual.saldoOficio == 1 ? '- O ofício com Saldo.' : '- O ofício sem Saldo.'
                })
            }

            if (!teveAlteracao) {
                itemHistorico.alteracoes.push({ tipo: 'info', mensagem: '- Nenhuma alteração foi feita.' })
            }
        } else {
            // Primeiro registro da história (mais antigo)
            itemHistorico.alteracoes.push({ tipo: 'criacao', mensagem: '- Ofício cadastrado.' })
        }

        historicoFormatado.push(itemHistorico)
    }

    return { 
        status: 'success', 
        data: historicoFormatado 
    }

  } catch (error: any) {
    console.error('Erro ao recuperar o histórico de ofício:', error)
    return { 
        status: 'failed', 
        mensagem: 'Erro ao buscar histórico: ' + error.message 
    }
  }
})