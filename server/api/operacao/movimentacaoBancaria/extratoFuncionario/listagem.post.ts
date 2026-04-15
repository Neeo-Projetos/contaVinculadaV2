import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const req = (await useDb()).request()

  let query = `
    SELECT F.codigo AS codigoFuncionario, F.nomeCompleto, F.cpf, P.apelido, P.descricao AS projeto, 
    COALESCE(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END), 0) AS saldo FROM cadastro.Funcionario F 
    LEFT JOIN operacao.extrato E ON E.funcionario = F.codigo
    LEFT JOIN cadastro.projeto P ON F.projeto = P.codigo 
    WHERE 1=1 
    `

  if (body.funcionarioId) {
    req.input('funcId', parseInt(body.funcionarioId))
    query += ` AND F.codigo = @funcId `
  }
  if (body.projeto) {
    req.input('projeto', parseInt(body.projeto))
    query += ` AND P.codigo = @projeto `
  }
  if (body.termo) {
    req.input('termo', `%${body.termo}%`)
    query += ` AND F.nomeCompleto LIKE @termo `
  }
  if (body.cpf) {
    // Busca flexível por CPF (pode vir com ponto/traço ou sem)
    const cpfLimpo = body.cpf.replace(/[.-]/g, '')
    req.input('cpf', `%${cpfLimpo}%`)
    query += ` AND REPLACE(REPLACE(F.cpf, '.', ''), '-', '') LIKE @cpf `
  }

  query += ` GROUP BY F.codigo, F.nomeCompleto, F.cpf, P.apelido, P.descricao `
  
  if (body.comSaldo === 'S') {
    query += ` HAVING COALESCE(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END), 0) > 0 `
  } else if (body.comSaldo === 'N') {
    query += ` HAVING COALESCE(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END), 0) <= 0 `
  }

  query += ` ORDER BY F.nomeCompleto ASC `

  try {
    const result = await req.query(query)
    return { status: 'success', data: result.recordset }
  } catch (erro) {
    console.error('Erro listagem saldo funcionário:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco de dados.' }
  }
})