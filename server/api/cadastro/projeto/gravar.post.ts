import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const codigo = Number(body.codigo) || 0
  const usuario = 1 
  const ativo = 1

  const str = (val: any) => val ? `'${val}'` : "NULL"
  const num = (val: any) => val ? Number(val) : "NULL"

  let xmlConta = "<ArrayOfConta>"
  if (body.contas && body.contas.length > 0) {
    body.contas.forEach((c: any) => {
      xmlConta += `<conta><codigo>${c.contaId || 0}</codigo><banco>${c.banco}</banco><agencia>${c.agencia}</agencia><digitoAgencia>${c.digitoAgencia}</digitoAgencia><conta>${c.conta}</conta><digitoConta>${c.digitoConta}</digitoConta><tipoAlteracao>${c.tipoAlteracao || 1}</tipoAlteracao></conta>`
    })
  }
  xmlConta += "</ArrayOfConta>"

  let xmlVerba = "<ArrayOfVerba>"
  if (body.verbas && body.verbas.length > 0) {
    body.verbas.forEach((v: any) => {
      xmlVerba += `<verba><codigo>${v.verbaId || 0}</codigo><verba>${v.verba}</verba><tipoAlteracao>${v.tipoAlteracao || 1}</tipoAlteracao></verba>`
    })
  }
  xmlVerba += "</ArrayOfVerba>"

  const queryExec = `
    EXEC cadastro.projeto_atualiza 
      ${codigo}, ${str(body.cnpj)}, ${str(body.apelido)}, ${str(body.descricao)}, 
      ${str(body.razaoSocial)}, ${str(body.cep)}, ${str(body.logradouro)}, 
      ${str(body.numeroEndereco)}, ${str(body.complemento)}, ${str(body.bairro)}, 
      ${str(body.cidade)}, ${str(body.uf)}, ${num(body.numeroContrato)}, 
      ${str(body.dataAssinatura)}, ${num(body.numeroFuncionarios)}, 
      ${num(body.valorFaturamento?.replace(',', '.'))}, ${num(body.tipoDeCalculo)}, 
      ${num(body.saldoOficio)}, ${num(body.contaVinculada)}, ${str(body.dataContaVinculada)}, 
      ${usuario}, '${xmlConta}', '${xmlVerba}', ${ativo}
  `

  try {
    const pool = await useDb()
    await pool.request().query(queryExec)
    return { status: 'success', mensagem: 'Operação realizada com sucesso.' }
  } catch (erro) {
    console.error('Erro ao gravar projeto:', erro)
    return { status: 'failed', mensagem: 'Erro ao gravar no banco de dados.' }
  }
})