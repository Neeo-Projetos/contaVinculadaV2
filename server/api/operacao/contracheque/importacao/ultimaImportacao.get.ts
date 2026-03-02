import { defineEventHandler } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async () => {
  try {
    const pool = await useDb()
    const query = `
      SELECT TOP 1 dataCadastro FROM operacao.baseContracheque 
      WHERE statusAprovacao = 2 
      ORDER BY dataCadastro DESC
    `
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) {
      const data = new Date(result.recordset[0].dataCadastro)
      const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()} - ${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`
      return { status: 'success', data: dataFormatada }
    }
    
    return { status: 'success', data: '' }
  } catch (erro) {
    console.error('Erro ao buscar última importação:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco.' }
  }
})