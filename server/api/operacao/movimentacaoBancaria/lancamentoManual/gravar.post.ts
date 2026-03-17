import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const codigo = Number(body.codigo) || 0
  const projeto = Number(body.projeto)
  const contaVinculada = Number(body.contaVinculada)
  const tipoMovimentacao = Number(body.tipoMovimentacao)
  const valorMovimentacao = Number(String(body.valorMovimentacao).replace(',', '.'))
  
  const [d, m, y] = body.dataMovimentacao.split('/')
  const dataMovimentacao = `'${y}-${m}-${d}'`
  
  const classificacao = Number(body.classificacao)
  const motivo = `'${body.motivo.replace(/'/g, "''")}'`
  const usuario = 1 

  let xmlFuncionario = "<ArrayOfFuncionario>"
  if (body.funcionarios && body.funcionarios.length > 0) {
    body.funcionarios.forEach((f: any) => {
      xmlFuncionario += `<funcionario><codigo>${f.codigoFuncionario || 0}</codigo><funcionario>${f.funcionarioId}</funcionario><tipoAlteracao>${f.tipoAlteracao}</tipoAlteracao></funcionario>`
    })
  }
  xmlFuncionario += "</ArrayOfFuncionario>"

  const queryExec = `
      EXEC operacao.lancamentoManual_Atualiza 
      ${codigo}, 
      ${projeto}, 
      ${contaVinculada}, 
      ${tipoMovimentacao}, 
      ${valorMovimentacao}, 
      ${dataMovimentacao}, 
      ${classificacao}, 
      0, 
      ${motivo}, 
      ${usuario}, 
      '${xmlFuncionario}'
      `

  try {
    const pool = await useDb()
    await pool.request().query(queryExec)
    return { status: 'success', mensagem: 'Operação realizada com sucesso.' }
  } catch (erro) {
    console.error('Erro ao gravar lançamento manual:', erro)
    return { status: 'failed', mensagem: 'Erro ao gravar no banco de dados.' }
  }
})