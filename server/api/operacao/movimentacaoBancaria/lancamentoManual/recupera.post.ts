import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import { comum } from '../../../../utils/comum'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) return { status: 'failed', mensagem: 'Código inválido' }

  try {
    const pool = await useDb()
    
    // Recupera dados principais do lançamento
    const queryPrincipal = `
      SELECT codigo, projeto, contaVinculada, tipoMovimentacao, valorMovimentacao, dataMovimentacao, classificacao, motivo
      FROM operacao.lancamentoManual
      WHERE codigo = ${codigo}
    `
    const resultPrincipal = await pool.request().query(queryPrincipal)

    if (resultPrincipal.recordset.length === 0) {
      return { status: 'failed', mensagem: 'Lançamento não encontrado' }
    }

    const lancamento = resultPrincipal.recordset[0]
    
    // Formata a data para BR (DD/MM/AAAA) usando o utilitário comum
    lancamento.dataMovimentacao = comum.formatarDataBr(lancamento.dataMovimentacao)
    
    // Formata o valor para visualização usando o utilitário comum
    lancamento.valorMovimentacao = comum.validaValorRecupera(lancamento.valorMovimentacao)

    // Recupera funcionários vinculados
    const queryFuncionarios = `
      SELECT LMF.codigo AS codigoVinculo, LMF.funcionario AS funcionarioId, F.nomeCompleto AS funcionarioNome
      FROM operacao.lancamentoManualFuncionario LMF
      JOIN cadastro.funcionario F ON F.codigo = LMF.funcionario
      WHERE LMF.lancamentoManual = ${codigo}
    `
    const resultFuncionarios = await pool.request().query(queryFuncionarios)
    
    // Mapeia os funcionários para o formato esperado pelo frontend
    lancamento.funcionarios = resultFuncionarios.recordset.map(f => ({
      codigoFuncionario: f.codigoVinculo,
      funcionarioId: f.funcionarioId,
      funcionarioNome: f.funcionarioNome,
      tipoAlteracao: 0, // 0 = Sem alteração (já existente no banco)
      selecionadoParaRemover: false
    }))

    return { status: 'success', data: lancamento }
  } catch (erro) {
    console.error('Erro ao recuperar lançamento:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco de dados.' }
  }
})
