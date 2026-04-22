import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const { codigo, tipoLancamento, projeto } = await readBody(event)

  if (!codigo || !tipoLancamento) return { status: 'failed', data: [], mensagem: 'Parâmetros inválidos.' }

  try {
    const db = await useDb()
    const request = db.request()
    let query = ''

    if (tipoLancamento == 2) {
      query = `
        SELECT F.nomeCompleto AS funcionario, F.cpf FROM operacao.lancamentoManualFuncionario LMF
        INNER JOIN cadastro.funcionario F ON F.codigo = LMF.funcionario
        WHERE LMF.lancamentoManual = ${codigo}
        `
    } else if (tipoLancamento == 3) {
      query = `
        SELECT F.nomeCompleto AS funcionario, F.cpf FROM operacao.lancamentoReembolsoFuncionario LRF
        INNER JOIN cadastro.funcionario F ON F.codigo = LRF.funcionario
        WHERE LRF.lancamentoReembolso = ${codigo}
        `
    }

    if (!query) return { status: 'failed', data: [], mensagem: 'Tipo de lançamento não suportado.' }

    const result = await request.query(query)
    
    // Se for um lançamento GLOBAL (sem vínculos específicos), busco todos os funcionários do projeto
    if (result.recordset.length === 0 && projeto) {
      request.input('idProjeto', projeto)
      const sqlGlobal = `
        SELECT nomeCompleto AS funcionario, cpf
        FROM cadastro.Funcionario
        WHERE projeto = @idProjeto AND ativo = 1
        ORDER BY nomeCompleto
      `
      const resGlobal = await request.query(sqlGlobal)
      return { status: 'success', data: resGlobal.recordset, mensagem: 'Funcionários (Projeto Total) carregados.' }
    }

    return { status: 'success', data: result.recordset, mensagem: 'Funcionários carregados.' }
  } catch (erro) {
    console.error('Erro ao buscar funcionarios estorno:', erro)
    return { status: 'failed', data: [], mensagem: 'Erro interno ao buscar funcionários.' }
  }
})