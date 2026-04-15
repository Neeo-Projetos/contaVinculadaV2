import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const codigo = parseInt(query.codigo as string)

    if (!codigo) {
        return { status: 'failed', mensagem: 'Código não fornecido.' }
    }

    const db = await useDb()

    try {
        const request = db.request()
        request.input('codigo', codigo)

        const sql = `
            SELECT P.*, B.nomeBanco
            FROM cadastro.Projeto P
            LEFT JOIN (
                SELECT projeto, MAX(codigo) AS contaVinculadaId 
                FROM cadastro.projetoContaVinculada 
                GROUP BY projeto
            ) AS UC ON P.codigo = UC.projeto
            LEFT JOIN cadastro.projetoContaVinculada V ON V.codigo = UC.contaVinculadaId
            LEFT JOIN tabelaBasica.banco B ON B.codigo = V.banco 
            WHERE P.codigo = @codigo
        `
        const result = await request.query(sql)

        if (result.recordset.length > 0) {
            return {
                status: 'success',
                data: result.recordset[0]
            }
        } else {
            return { status: 'failed', mensagem: 'Projeto não encontrado.' }
        }
    } catch (error: any) {
        console.error('Erro ao recuperar projeto:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao recuperar projeto: ' + error.message
        })
    }
})
