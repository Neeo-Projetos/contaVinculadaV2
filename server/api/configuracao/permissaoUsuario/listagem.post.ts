import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    
    try {
        const db = await useDb()
        const request = db.request()

        let baseQuery = `
          SELECT DISTINCT 
            U.codigo, U.login, U.nomeUsuario, U.cpf, U.ativo 
          FROM configuracao.usuario U
          WHERE (1 = 1) AND (ISNULL(U.tipoUsuario, '') <> 'S')
        `

        // Aplicando filtros dinâmicos padronizados
        if (body.login) {
            baseQuery += ` AND U.login LIKE @login`
            request.input('login', sql.VarChar, `%${body.login}%`)
        }

        if (body.nomeUsuario) {
            baseQuery += ` AND U.nomeUsuario LIKE @nomeUsuario`
            request.input('nomeUsuario', sql.VarChar, `%${body.nomeUsuario}%`)
        }

        if (body.cpf) {
            const cpfLimpo = body.cpf.replace(/[^\d]/g, '')
            if (cpfLimpo) {
                baseQuery += ` AND REPLACE(REPLACE(U.cpf, '.', ''), '-', '') LIKE @cpf`
                request.input('cpf', sql.VarChar, `%${cpfLimpo}%`)
            }
        }

        // Filtro de Ativo (Baseado na lógica de Usuários)
        if (body.ativoParam !== '' && body.ativoParam !== undefined && body.ativoParam !== null) {
            const isAtivo = body.ativoParam === '1' || body.ativoParam === 1
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
        console.error('Erro na API de filtro de permissões:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao buscar usuários para permissão: ' + error.message
        })
    }
})