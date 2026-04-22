import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const req = (await useDb()).request()
  
  let query = `
    SELECT DISTINCT 
      LR.codigo, P.codigo AS codigoProjeto, P.descricao AS projeto, P.apelido,
      TM.descricao AS tipoMovimentacao, LR.dataMovimentacao, LR.valorMovimentacao, 
      LR.dataCadastro, U.login AS usuarioCadastro, 
      CL.descricao AS classificacao,
      CONCAT(C.agencia,'/',C.conta,' - ',B.nomeBanco) AS contaVinculada, 
      CASE WHEN EXISTS(SELECT codigo FROM operacao.lancamentoReembolsoFuncionario WHERE lancamentoReembolso = LR.codigo) THEN 1 ELSE 0 END AS funcionario,
      LR.dataOficio, LR.valorOficio, LR.dataResposta, LR.dataEntrada, S.descricao AS status
    FROM operacao.lancamentoReembolso LR
    LEFT JOIN cadastro.projeto P ON P.codigo = LR.projeto
    LEFT JOIN tabelaBasica.tipoMovimentacao TM ON TM.codigo = LR.tipoMovimentacao
    LEFT JOIN configuracao.usuario U ON U.codigo = LR.usuarioCadastro
    LEFT JOIN cadastro.projetoContaVinculada C ON C.codigo = LR.contaVinculada
    LEFT JOIN tabelaBasica.banco B ON B.codigo = C.banco
    LEFT JOIN tabelaBasica.status S ON S.codigo = LR.status
    LEFT JOIN tabelaBasica.classificacao CL ON CL.codigo = LR.classificacaoLancamento
    WHERE (0=0)
  `

  if (body.projeto) {
    req.input('projeto', parseInt(body.projeto))
    query += ` AND LR.projeto = @projeto `
  }
  if (body.tipoMovimentacao) {
    req.input('tipo', parseInt(body.tipoMovimentacao))
    query += ` AND LR.tipoMovimentacao = @tipo `
  }
  if (body.dataMovimentacao) {
    const [d, m, y] = body.dataMovimentacao.split('/')
    req.input('dataMov', `${y}-${m}-${d}`)
    query += ` AND LR.dataMovimentacao = @dataMov `
  }

  query += ` ORDER BY LR.codigo DESC`

  try {
    const result = await req.query(query)

    const dataFormatada = result.recordset.map((row: any) => {
      row.dataMovimentacao = comum.formatarDataBr(row.dataMovimentacao)
      row.dataOficio = comum.formatarDataBr(row.dataOficio)
      row.dataResposta = comum.formatarDataBr(row.dataResposta)
      row.dataEntrada = comum.formatarDataBr(row.dataEntrada)
      return row
    })

    return { status: 'success', data: dataFormatada }
  } catch (erro) {
    console.error('Erro ao listar reembolsos:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco de dados.' }
  }
})