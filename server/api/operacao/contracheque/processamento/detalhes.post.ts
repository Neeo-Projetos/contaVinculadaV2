import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigoContracheque = Number(body.codigoContracheque)

  if (!codigoContracheque) return { status: 'failed', message: 'Código não informado' }

  try {
    const pool = await useDb()
    const query = `
      SELECT D.*, V.descricao AS verbaDescricao FROM operacao.baseContrachequeDetalhes D
      LEFT JOIN cadastro.verbas V ON D.codigoVerba = V.codigoReferencia
      WHERE D.codigoContracheque = ${codigoContracheque}
    `
    const result = await pool.request().query(query)
    return { status: 'success', data: result.recordset }
  } catch (erro) {
    console.error('Erro ao buscar detalhes do contracheque:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco de dados.' }
  }
})