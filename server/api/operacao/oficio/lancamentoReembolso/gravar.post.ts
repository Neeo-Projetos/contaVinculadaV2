import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import { comum } from '../../../../utils/comum'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const codigo = Number(body.codigo) || 0
  const projeto = Number(body.projeto)
  const contaVinculada = Number(body.contaVinculada)
  const tipoMovimentacao = Number(body.tipoMovimentacao)
  const valorMovimentacao = comum.validaValorSql(body.valorMovimentacao)
  
  const dataMovimentacao = comum.formatarDataSql(body.dataMovimentacao) ? `'${comum.formatarDataSql(body.dataMovimentacao)}'` : 'NULL'
  const dataOficio = comum.formatarDataSql(body.dataOficio) ? `'${comum.formatarDataSql(body.dataOficio)}'` : 'NULL'
  const dataResposta = comum.formatarDataSql(body.dataResposta) ? `'${comum.formatarDataSql(body.dataResposta)}'` : 'NULL'
  const dataEntrada = comum.formatarDataSql(body.dataEntrada) ? `'${comum.formatarDataSql(body.dataEntrada)}'` : 'NULL'

  const classificacaoLancamento = Number(body.classificacaoLancamento)
  const valorOficio = comum.validaValorSql(body.valorOficio)
  const classificacaoOficio = Number(body.classificacaoOficio)
  const numeroOficio = body.numeroOficio ? `'${String(body.numeroOficio).replace(/'/g, "''")}'` : "''"
  const status = Number(body.status)
  
  const motivo = body.motivo ? `'${String(body.motivo).replace(/'/g, "''")}'` : "''"
  const usuario = 1 

  let xmlFuncionario = "<ArrayOfFuncionario>"
  if (body.funcionarios && body.funcionarios.length > 0) {
    body.funcionarios.forEach((f: any) => {
      xmlFuncionario += `<funcionario><codigo>${f.codigoFuncionario || 0}</codigo><funcionario>${f.funcionarioId}</funcionario><tipoAlteracao>${f.tipoAlteracao}</tipoAlteracao></funcionario>`
    })
  }
  xmlFuncionario += "</ArrayOfFuncionario>"

  const queryExec = `
    EXEC operacao.lancamentoReembolso_Atualiza 
      ${codigo}, ${projeto}, ${contaVinculada}, ${tipoMovimentacao}, 
      ${valorMovimentacao}, ${dataMovimentacao}, ${classificacaoLancamento}, 
      ${motivo}, ${dataOficio}, ${valorOficio}, ${dataResposta}, ${dataEntrada},
      ${status}, ${classificacaoOficio}, 0, ${numeroOficio}, ${usuario}, '${xmlFuncionario}'
  `

  try {
    const pool = await useDb()
    await pool.request().query(queryExec)
    return { status: 'success', message: 'Operação realizada com sucesso.' }
  } catch (erro) {
    console.error('Erro ao gravar reembolso:', erro)
    return { status: 'failed', message: 'Erro ao gravar no banco de dados.' }
  }
})