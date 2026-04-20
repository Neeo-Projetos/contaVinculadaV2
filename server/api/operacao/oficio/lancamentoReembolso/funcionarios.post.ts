import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const { codigo: codigoBody, termo, projeto: projetoBody } = await readBody(event)
  const codigo = codigoBody ? Number(codigoBody) : null
  const buscaTermo = termo || ''
  const projeto = projetoBody ? Number(projetoBody) : null

  try {
    const db = await useDb()
    const request = db.request()

    // 1. Busca funcionários via autocomplete filtrando por termo e projeto
    if (buscaTermo || (projeto && !codigo)) {
      request.input('term', `%${buscaTermo}%`)
      let sql = `
        SELECT codigo, nomeCompleto 
        FROM cadastro.Funcionario 
        WHERE ativo = 1
      `

      if (buscaTermo) {
        sql += ` AND nomeCompleto LIKE @term COLLATE Latin1_general_CI_AI `
      }

      if (projeto) {
        request.input('projeto', projeto)
        sql += ` AND projeto = @projeto `
      }

      sql += ` ORDER BY nomeCompleto `
      
      const result = await request.query(sql)
      return { status: 'success', data: result.recordset }
    }

    // 2. Recuperei os funcionários já vinculados ao lançamento informado (para edição se necessário)
    if (codigo) {
      const query = `
        SELECT F.codigo as funcionarioId, F.nomeCompleto AS funcionarioNome
        FROM operacao.lancamentoReembolsoFuncionario RF
        INNER JOIN cadastro.funcionario F ON F.codigo = RF.funcionario
        WHERE RF.lancamentoReembolso = ${codigo}
      `
      const result = await request.query(query)
      return { status: 'success', data: result.recordset }
    }

    return { status: 'success', data: [] }
    
  } catch (erro) {
    console.error('Erro na API de funcionários:', erro)
    return { status: 'failed', mensagem: 'Erro ao processar requisição.' }
  }
})