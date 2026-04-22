import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  let query = `
    SELECT DISTINCT LM.codigo, P.descricao AS projeto, P.apelido, TM.descricao AS tipoMovimentacao, LM.dataMovimentacao, LM.valorMovimentacao, LM.dataCadastro, 
    F.descricao AS classificacao, U.login AS usuarioCadastro, CONCAT(C.agencia,'/',C.conta,' - ',B.nomeBanco) AS contaVinculada, CASE WHEN EXISTS 
    (SELECT codigo FROM operacao.lancamentoManualFuncionario WHERE lancamentoManual = LM.codigo) THEN 1 ELSE 0 END AS funcionario FROM operacao.lancamentoManual LM
    LEFT JOIN cadastro.projeto P ON P.codigo = LM.projeto
    LEFT JOIN tabelaBasica.tipoMovimentacao TM ON TM.codigo = LM.tipoMovimentacao
    LEFT JOIN configuracao.usuario U ON U.codigo = LM.usuarioCadastro
    LEFT JOIN cadastro.projetoContaVinculada C ON C.codigo = LM.contaVinculada
    LEFT JOIN tabelaBasica.banco B ON B.codigo = C.banco
    LEFT JOIN tabelaBasica.classificacao F ON F.codigo = LM.classificacao 
    WHERE (0=0)
    `

  if (body.projeto) query += ` AND LM.projeto = ${Number(body.projeto)}`
  if (body.tipoMovimentacao) query += ` AND LM.tipoMovimentacao = ${Number(body.tipoMovimentacao)}`
  if (body.dataMovimentacao) {
    const [d, m, y] = body.dataMovimentacao.split('/')
    query += ` AND LM.dataMovimentacao = '${y}-${m}-${d}'`
  }

  query += ` ORDER BY LM.codigo DESC`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    const dataFormatada = result.recordset.map(row => {
      row.dataMovimentacao = comum.formatarDataBr(row.dataMovimentacao)
      return row
    })

    return { status: 'success', data: dataFormatada }
  } catch (erro) {
    console.error('Erro ao listar:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco de dados.' }
  }
})