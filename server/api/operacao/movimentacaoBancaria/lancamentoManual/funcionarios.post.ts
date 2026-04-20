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

    // Busquei funcionários via autocomplete filtrando por termo e projeto
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

    // Recuperei os funcionários já vinculados ao lançamento informado
    if (codigo) {
      const query = `
        SELECT F.nomeCompleto AS funcionario, F.codigo
        FROM operacao.lancamentoManualFuncionario LM
        LEFT JOIN cadastro.funcionario F ON F.codigo = LM.funcionario
        WHERE LM.lancamentoManual = ${codigo}
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