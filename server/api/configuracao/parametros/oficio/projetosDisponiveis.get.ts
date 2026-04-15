import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const db = await useDb()

    try {
        const request = db.request()
        
        // Seleciona apenas projetos ativos que AINDA NÃO possuem configuração de ofício
        const query = `
            SELECT CP.codigo, CP.descricao, CP.apelido 
            FROM cadastro.projeto CP
            WHERE CP.ativo = 1
            AND CP.codigo NOT IN (
                SELECT projeto 
                FROM configuracao.parametroOficio 
                WHERE projeto IS NOT NULL
            )
            ORDER BY CP.apelido ASC
        `
        const result = await request.query(query)

        return {
            status: 'success',
            data: result.recordset
        }
    } catch (error: any) {
        console.error('Erro ao buscar projetos disponíveis:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao buscar projetos disponíveis: ' + error.message
        })
    }
})
