import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const db = await useDb()

    const term = query.q as string

    if (!term || term.length < 2) {
        return { status: 'success', data: [] }
    }

    try {
        const request = db.request()
        request.input('term', `%${term}%`)

        let sql = `
            SELECT codigo as id, nomeBanco as descricao 
            FROM tabelaBasica.banco 
            WHERE (nomeBanco LIKE @term OR codigoBanco LIKE @term) 
            AND ativo = 1
            ORDER BY nomeBanco
        `

        const result = await request.query(sql)

        return {
            status: 'success',
            data: result.recordset
        }

    } catch (error: any) {
        console.error('Erro no autocomplete de bancos:', error)
        return { status: 'failed', mensagem: 'Erro na API de autocomplete: ' + error.message }
    }
})
