import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const db = await useDb()

    const term = query.q as string

    if (!term || term.length < 3) {
        return { status: 'success', data: [] }
    }

    try {
        const request = db.request()
        request.input('term', `%${term}%`)

        let sql = `
            SELECT codigo as id, (apelido + ' - ' + descricao) as descricao, apelido
            FROM cadastro.projeto 
            WHERE (apelido LIKE @term COLLATE Latin1_general_CI_AI OR descricao LIKE @term COLLATE Latin1_general_CI_AI)
            AND ativo = 1
            ORDER BY apelido
        `

        const result = await request.query(sql)

        return {
            status: 'success',
            data: result.recordset
        }

    } catch (error: any) {
        console.error('Erro no autocomplete de projeto:', error)
        return { status: 'failed', mensagem: 'Erro na API de autocomplete: ' + error.message }
    }
})
