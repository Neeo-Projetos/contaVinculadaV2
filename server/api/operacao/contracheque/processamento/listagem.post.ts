import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const { mesAno, projeto, cpf, status } = body

    try {
        const request = db.request()

        let sql = `
        SELECT C.codigo, F.nomeCompleto AS funcionario, C.cpf, P.descricao AS projeto, C.valorLiquido, C.matricula, C.mesAno, 
        C.decimoTerceiro, C.feriasConstitucional, C.multaFgts, C.submodulo, C.valorRetencao, C.statusAprovacao FROM operacao.baseContracheque C 
        LEFT JOIN cadastro.projeto P ON P.codigo = C.projeto
        LEFT JOIN cadastro.Funcionario F ON F.codigo = C.funcionario
        WHERE (1=1)
        `

        if (mesAno && mesAno !== '0') {
            const partes = mesAno.split('/')
            if (partes.length === 2) {
                request.input('mesAno', `${partes[1]}-${partes[0]}-01`)
                sql += ` AND C.mesAno = @mesAno `
            }
        }

        if (projeto && projeto !== '0' && projeto !== '') {
            request.input('projeto', parseInt(projeto))
            sql += ` AND C.projeto = @projeto `
        }

        if (cpf && cpf.trim() !== '') {
            request.input('cpf', cpf.trim())
            sql += ` AND C.cpf = @cpf `
        }

        if (status !== undefined && status !== null && status !== ' ' && status !== '') {
            request.input('status', parseInt(status))
            sql += ` AND C.statusAprovacao = @status `
        }

        const result = await request.query(sql)

        return {
            status: 'success',
            data: result.recordset 
        }

    } catch (error: any) {
        console.error('Erro na listagem de Contracheque:', error)
        return { status: 'failed', message: 'Erro ao buscar no banco de dados.' } 
    }
})