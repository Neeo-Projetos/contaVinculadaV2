import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import { comum } from '../../../../utils/comum'

export default defineEventHandler(async (event) => {
  const { codigo: codigoBody } = await readBody(event)
  const codigo = Number(codigoBody)

  if (!codigo) return { status: 'failed', mensagem: 'Código inválido' }

  try {
    const db = await useDb()
    
    // 1. Busca dados principais
    const query = `
      SELECT 
        codigo, projeto, contaVinculada, tipoMovimentacao, valorMovimentacao, dataMovimentacao, 
        classificacaoLancamento, motivo, dataOficio, valorOficio, dataResposta, dataEntrada, 
        status, classificacaoOficio, numeroOficio
      FROM operacao.lancamentoReembolso
      WHERE codigo = ${codigo}
    `
    const result = await db.request().query(query)

    if (result.recordset.length === 0) {
      return { status: 'failed', mensagem: 'Registro não encontrado' }
    }

    const data = result.recordset[0]

    // Formatar datas para o padrão do frontend (DD/MM/AAAA) usando o utilitário comum
    data.dataMovimentacao = comum.formatarDataBr(data.dataMovimentacao)
    data.dataOficio = comum.formatarDataBr(data.dataOficio)
    data.dataResposta = comum.formatarDataBr(data.dataResposta)
    data.dataEntrada = comum.formatarDataBr(data.dataEntrada)

    // Formatar valores para string com vírgula para os inputs usando o utilitário comum
    data.valorMovimentacao = comum.validaValorRecupera(data.valorMovimentacao)
    data.valorOficio = comum.validaValorRecupera(data.valorOficio)

    // 2. Busca funcionários vinculados
    const queryFunc = `
      SELECT F.codigo, F.nomeCompleto AS funcionarioNome, RF.funcionario AS funcionarioId
      FROM operacao.lancamentoReembolsoFuncionario RF
      JOIN cadastro.funcionario F ON F.codigo = RF.funcionario
      WHERE RF.lancamentoReembolso = ${codigo}
    `
    const resultFunc = await db.request().query(queryFunc)
    data.funcionarios = resultFunc.recordset.map(f => ({
      ...f,
      tipoAlteracao: 0, // Indica que já existe no banco
      selecionadoParaRemover: false
    }))

    return { status: 'success', data }
  } catch (erro) {
    console.error('Erro ao recuperar reembolso:', erro)
    return { status: 'failed', mensagem: 'Erro técnico ao recuperar dados' }
  }
})
