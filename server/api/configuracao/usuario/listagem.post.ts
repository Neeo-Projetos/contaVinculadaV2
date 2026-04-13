import { useDb } from '../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    
    try {
        const db = await useDb()
        const request = db.request()

        let baseQuery = `
          SELECT DISTINCT 
            U.codigo, U.login, U.nomeUsuario as nome, U.cpf, U.email, U.telefone, U.ativo 
          FROM configuracao.usuario U
          LEFT JOIN configuracao.usuarioProjeto UP ON UP.usuario = U.codigo
          WHERE (1 = 1) AND (U.tipoUsuario <> 'S' OR U.tipoUsuario IS NULL)
        `

        // Aplicando filtros dinâmicos
        if (body.login) {
            baseQuery += ` AND U.login LIKE @login`
            request.input('login', sql.VarChar, `%${body.login}%`)
        }

        if (body.nome) {
            baseQuery += ` AND U.nomeUsuario LIKE @nome`
            request.input('nome', sql.VarChar, `%${body.nome}%`)
        }

        if (body.cpf) {
            const cpfLimpo = body.cpf.replace(/[^\d]/g, '')
            if (cpfLimpo) {
                baseQuery += ` AND U.cpf = @cpf`
                request.input('cpf', sql.VarChar, cpfLimpo)
            }
        }

        if (body.projeto) {
            baseQuery += ` AND UP.projeto = @projeto`
            request.input('projeto', sql.Int, body.projeto)
        }

        // Filtro de Ativo Robusto (Aceitando NULL como Ativo)
        if (body.ativo !== '' && body.ativo !== undefined && body.ativo !== null) {
            const isAtivo = body.ativo === '1' || body.ativo === 1
            if (isAtivo) {
                baseQuery += ` AND (U.ativo = 1 OR U.ativo IS NULL)`
            } else {
                baseQuery += ` AND U.ativo = 0`
            }
        }

        // Ordenação padrão
        baseQuery += ` ORDER BY U.nomeUsuario ASC`

        const result = await request.query(baseQuery)

        return {
            status: 'success',
            data: result.recordset
        }

    } catch (error: any) {
        console.error('Erro na API de filtro de usuários:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao buscar usuários: ' + error.message
        })
    }
})
