import { defineEventHandler, getQuery } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const term = query.q as string

    if (!term || term.length < 2) {
        return { status: 'success', data: [] }
    }

    try {
        const db = await useDb()
        const sqlQuery = `
            SELECT TOP 10
                codigo as id,
                descricao as descricao
            FROM cadastro.verbas
            WHERE (descricao LIKE '%${term}%' OR CAST(codigoReferencia AS VARCHAR) LIKE '%${term}%')
            AND ativo = 1
            ORDER BY descricao
        `
        const result = await db.request().query(sqlQuery)

        return {
            status: 'success',
            data: result.recordset
        }
    } catch (error) {
        console.error('Erro no autocomplete de verbas:', error)
        return { status: 'error', message: 'Falha ao buscar verbas', data: [] }
    }
})
