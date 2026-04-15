import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let codigo = Number(body.codigo) || 0
  const projeto = Number(body.projeto)
  let texto = body.texto

  // Usuário 1 como fallback se não houver contexto de sessão (admin padrão)
  const usuarioAlteracao = 1 

  try {
    const db = await useDb()
    const request = db.request()

    // 1. Verificamos se já existe uma parametrização para esse projeto para evitar duplicatas
    const checkResult = await request
        .input('projetoInternal', sql.Int, projeto)
        .query(`SELECT codigo FROM configuracao.parametroOficio WHERE projeto = @projetoInternal`)
    
    if (checkResult.recordset.length > 0) {
      codigo = checkResult.recordset[0].codigo
    }

    // 2. Buscamos o saldo do projeto para sincronizar com a parametrização
    const saldoResult = await db.request()
        .input('projetoRef', sql.Int, projeto)
        .query(`SELECT ISNULL(saldoOficio, 0) as saldoOficio FROM cadastro.projeto WHERE codigo = @projetoRef`)
    
    const saldoOficio = saldoResult.recordset.length > 0 ? saldoResult.recordset[0].saldoOficio : 0

    // 3. Executamos a atualização via Procedure (que gerencia o histórico internamente)
    await db.request()
        .input('codigo', sql.Int, codigo)
        .input('projeto', sql.Int, projeto)
        .input('unidade', sql.Int, null) // Parâmetro não utilizado conforme legado
        .input('saldoOficio', sql.Int, saldoOficio)
        .input('redacaoOficio', sql.VarChar, texto)
        .input('usuarioAlteracao', sql.Int, usuarioAlteracao)
        .query(`EXEC configuracao.parametroOficio_Atualiza @codigo, @projeto, @unidade, @saldoOficio, @redacaoOficio, @usuarioAlteracao`)

    return { status: 'success', mensagem: 'Parâmetros de ofício salvos com sucesso.' }
  } catch (error: any) {
    console.error('Erro ao gravar ofício:', error)
    return { status: 'failed', mensagem: 'Falha técnica ao gravar: ' + error.message }
  }
})