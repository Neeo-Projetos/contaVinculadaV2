import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    try {
        const request = db.request()

        let baseQuery = `
      SELECT DISTINCT 
        U.codigo, U.login, U.nomeUsuario as nome, U.cpf, U.email, U.telefone, U.ativo 
      FROM configuracao.usuario U
      LEFT JOIN configuracao.usuarioProjeto UP ON UP.usuario = U.codigo
      WHERE (1 = 1) AND U.tipoUsuario IS NULL
    `

        // Aplicando filtros dinâmicos
        if (body.login) {
            baseQuery += ` AND U.login LIKE @login`
            request.input('login', `%${body.login}%`)
        }

        if (body.usuario) {
            baseQuery += ` AND U.codigo = @usuario`
            request.input('usuario', body.usuario)
        }

        if (body.nome) {
            baseQuery += ` AND U.nomeUsuario LIKE @nome`
            request.input('nome', `%${body.nome}%`)
        }

        if (body.cpf) {
            baseQuery += ` AND U.cpf = @cpf`
            request.input('cpf', body.cpf.replace(/[^\d]/g, ''))
        }

        if (body.projeto) {
            baseQuery += ` AND UP.projeto = @projeto`
            request.input('projeto', body.projeto)
        }

        if (body.ativo !== '' && body.ativo !== undefined) {
            baseQuery += ` AND U.ativo = @ativo`
            request.input('ativo', parseInt(body.ativo))
        }

        // Ordenação padrão
        baseQuery += ` ORDER BY U.nomeUsuario ASC`

        const result = await request.query(baseQuery)

        return {
            status: 'success',
            results: result.recordset
        }

    } catch (error: any) {
        console.error('Erro na API de filtro de usuários:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao buscar usuários: ' + error.message
        })
    }
})
