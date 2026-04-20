import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await useDb()

  const { codigo, tipoLancamento, motivo } = await readBody(event)
  const usuarioEstorno = 1 

  try {
    let sqlLancamento = ''
    if (tipoLancamento === 2) {
      sqlLancamento = `
        SELECT LM.valorMovimentacao, LM.tipoMovimentacao, F.funcionario FROM operacao.lancamentoManual LM
        LEFT JOIN operacao.lancamentoManualFuncionario F ON F.lancamentoManual = LM.codigo
        WHERE LM.codigo = ${codigo}
        `
    } else if (tipoLancamento === 3) {
      sqlLancamento = `
        SELECT LR.valorOficio AS valorMovimentacao, LR.tipoMovimentacao, F.funcionario FROM operacao.lancamentoReembolso LR
        LEFT JOIN operacao.lancamentoReembolsoFuncionario F ON F.lancamentoReembolso = LR.codigo
        WHERE LR.codigo = ${codigo}
        `
    } else {
      return { status: 'failed', mensagem: 'Tipo de lançamento inválido.' }
    }

    const resultLancamento = await db.request().query(sqlLancamento)
    
    if (resultLancamento.recordset.length === 0) {
      return { status: 'failed', mensagem: 'Lançamento não encontrado.' }
    }

    const valorEstorno = resultLancamento.recordset[0].valorMovimentacao
    const tipoMov = resultLancamento.recordset[0].tipoMovimentacao
    const tipoMovimentacaoEstorno = (tipoMov == 1) ? 2 : 1

    let xmlFuncionario = "<ArrayOfFuncionario>"
    resultLancamento.recordset.forEach((row: any) => {
      if (row.funcionario) {
        xmlFuncionario += `<funcionario><codigo>0</codigo><funcionario>${row.funcionario}</funcionario><tipoAlteracao>0</tipoAlteracao></funcionario>`
      }
    })
    xmlFuncionario += "</ArrayOfFuncionario>"

    const motivoFormatado = motivo ? `'${motivo.replace(/'/g, "''")}'` : 'NULL'

    const queryExec = `
        EXEC operacao.lancamentoEstorno_Atualiza 
        0, 
        ${tipoLancamento}, 
        ${codigo}, 
        ${motivoFormatado}, 
        ${valorEstorno}, 
        ${tipoMovimentacaoEstorno}, 
        ${usuarioEstorno}, 
        '${xmlFuncionario}'
        `
    
    await db.request().query(queryExec)

    return { status: 'success', mensagem: 'Estorno realizado com sucesso.' }

  } catch (erro) {
    console.error('Erro ao gravar estorno:', erro)
    return { status: 'failed', mensagem: 'Erro interno ao realizar estorno.' }
  }
})