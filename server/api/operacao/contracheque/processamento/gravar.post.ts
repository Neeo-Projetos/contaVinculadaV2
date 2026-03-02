import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const usuarioLogadoId = 1 
    const { matriculas, statusAprovacao } = body

    if (!matriculas || matriculas.length === 0) {
        return { status: 'failed', mensagem: 'Nenhum item selecionado.' }
    }

    try {
        for (const matricula of matriculas) {
            const checkReq = db.request()
            checkReq.input('matricula', parseInt(matricula))
            const resBusca = await checkReq.query(`SELECT * FROM operacao.baseContracheque WHERE matricula = @matricula`)

            if (resBusca.recordset.length > 0) {
                const row = resBusca.recordset[0]

                const updateReq = db.request()
                updateReq.input('codigo', row.codigo)
                updateReq.input('funcionario', row.funcionario)
                updateReq.input('cpf', row.cpf)
                updateReq.input('projeto', row.projeto)
                updateReq.input('valorLiquido', row.valorLiquido)
                updateReq.input('matricula', row.matricula)

                let mesAnoString = row.mesAno
                if (row.mesAno instanceof Date) {
                    mesAnoString = row.mesAno.toISOString().split('T')[0] 
                }
                updateReq.input('mesAno', mesAnoString)

                updateReq.input('decimoTerceiro', row.decimoTerceiro || 0)
                updateReq.input('feriasConstitucional', row.feriasConstitucional || 0)
                updateReq.input('multaFgts', row.multaFgts || 0)
                updateReq.input('submodulo', row.submodulo || 0)
                updateReq.input('valorRetencao', row.valorRetencao || 0)
                updateReq.input('statusAprovacao', parseInt(statusAprovacao))
                updateReq.input('usuario', usuarioLogadoId)

                await updateReq.query(`
                EXEC operacao.baseContracheque_Atualiza 
                @codigo = @codigo,
                @funcionario = @funcionario,
                @cpf = @cpf,
                @projeto = @projeto,
                @valorLiquido = @valorLiquido,
                @matricula = @matricula,
                @mesAno = @mesAno,
                @decimoTerceiro = @decimoTerceiro,
                @feriasConstitucional = @feriasConstitucional,
                @multaFgts = @multaFgts,
                @submodulo = @submodulo,
                @valorRetencao = @valorRetencao,
                @statusAprovacao = @statusAprovacao,
                @usuario = @usuario
                `)
            }
        }

        return {
            status: 'success',
            mensagem: 'Operação realizada com sucesso.',
            statusAprovacao
        }

    } catch (error: any) {
        console.error('Erro no processamento do contracheque:', error)
        return { status: 'failed', message: 'Erro ao gravar no banco de dados.' } 
    }
})