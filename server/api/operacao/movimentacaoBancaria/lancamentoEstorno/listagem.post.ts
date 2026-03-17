import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await useDb()
  const req = db.request()

  const { projeto, dataInicio, dataFim, funcionarioId, tipoLancamento, estornado } = body

  const dtIn = dataInicio ? dataInicio.split('/').reverse().join('-') : null
  const dtFi = dataFim ? dataFim.split('/').reverse().join('-') : null

  let query = `
    SELECT RM.codigo, RM.projeto, RM.contaVinculada, RM.valorMovimentacao, RM.tipoMovimentacao, RM.dataMovimentacao, RM.classificacao, RM.tipoLancamento, 
    RM.estorno, STRING_AGG(RM.funcionarioNome, ', ') AS vinculo FROM (SELECT LM.codigo, P.descricao AS projeto, CONCAT(C.agencia, '/', C.conta, ' - ', 
    B.nomeBanco) AS contaVinculada, LM.valorMovimentacao, TM.descricao AS tipoMovimentacao, LM.dataMovimentacao, F.descricao AS classificacao, 
    2 AS tipoLancamento, LM.estorno, ISNULL(LF.nomeCompleto, 'Projeto total') AS funcionarioNome FROM operacao.lancamentoManual LM
    LEFT JOIN operacao.lancamentoManualFuncionario LMF ON LMF.lancamentoManual = LM.codigo
    LEFT JOIN cadastro.funcionario LF ON LF.codigo = LMF.funcionario
    LEFT JOIN cadastro.projeto P ON P.codigo = LM.projeto
    LEFT JOIN tabelaBasica.tipoMovimentacao TM ON TM.codigo = LM.tipoMovimentacao
    LEFT JOIN cadastro.projetoContaVinculada C ON C.codigo = LM.contaVinculada
    LEFT JOIN tabelaBasica.banco B ON B.codigo = C.banco
    LEFT JOIN tabelaBasica.classificacao F ON F.codigo = LM.classificacao
      
    UNION ALL
      
    SELECT LR.codigo, P.descricao AS projeto, CONCAT(C.agencia, '/', C.conta, ' - ', B.nomeBanco) AS contaVinculada, LR.valorOficio AS valorMovimentacao, 
    TM.descricao AS tipoMovimentacao, LR.dataMovimentacao, F.descricao AS classificacao, 3 AS tipoLancamento, LR.estorno, ISNULL(LF.nomeCompleto, 'Projeto total') AS funcionarioNome FROM operacao.lancamentoReembolso LR
    LEFT JOIN operacao.lancamentoReembolsoFuncionario LRF ON LRF.lancamentoReembolso = LR.codigo
    LEFT JOIN cadastro.funcionario LF ON LF.codigo = LRF.funcionario
    LEFT JOIN cadastro.projeto P ON P.codigo = LR.projeto
    LEFT JOIN tabelaBasica.tipoMovimentacao TM ON TM.codigo = LR.tipoMovimentacao
    LEFT JOIN cadastro.projetoContaVinculada C ON C.codigo = LR.contaVinculada
    LEFT JOIN tabelaBasica.banco B ON B.codigo = C.banco
    LEFT JOIN tabelaBasica.classificacao F ON F.codigo = LR.classificacaoOficio) RM
    WHERE 1=1
    `

  if (projeto && projeto !== '0') {
    req.input('projeto', parseInt(projeto))
    query += ` AND RM.projeto = @projeto `
  }

  if (dtIn && dtFi) {
    req.input('dtIn', dtIn)
    req.input('dtFi', dtFi)
    query += ` AND RM.dataMovimentacao BETWEEN @dtIn AND @dtFi `
  }

  if (funcionarioId && funcionarioId !== '0') {
    req.input('funcId', parseInt(funcionarioId))
    query += ` AND (
      (RM.tipoLancamento = 2 AND EXISTS (SELECT 1 FROM operacao.lancamentoManualFuncionario M WHERE M.lancamentoManual = RM.codigo AND M.funcionario = @funcId))
      OR 
      (RM.tipoLancamento = 3 AND EXISTS (SELECT 1 FROM operacao.lancamentoReembolsoFuncionario R WHERE R.lancamentoReembolso = RM.codigo AND R.funcionario = @funcId))
    )`
  }

  if (tipoLancamento && tipoLancamento !== '0') {
    req.input('tipoL', parseInt(tipoLancamento))
    query += ` AND RM.tipoLancamento = @tipoL `
  }

  if (estornado !== undefined && estornado !== '') {
    req.input('estorno', parseInt(estornado))
    query += ` AND RM.estorno = @estorno `
  }

  query += ` GROUP BY RM.codigo, RM.projeto, RM.contaVinculada, RM.valorMovimentacao, RM.tipoMovimentacao, RM.dataMovimentacao, RM.classificacao, 
  RM.tipoLancamento, RM.estorno ORDER BY RM.codigo DESC`

  try {
    const result = await req.query(query)

    const dataFormatada = result.recordset.map((row: any) => {
      if(row.dataMovimentacao){
        const d = new Date(row.dataMovimentacao)
        row.dataMovimentacao = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
      }
      return row
    })

    return { status: 'success', data: dataFormatada }
  } catch (erro) {
    console.error('Erro ao listar estornos:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar dados.' }
  }
})