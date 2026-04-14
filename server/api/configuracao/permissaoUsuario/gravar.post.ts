import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const codigoUsuario = Number(body.codigo)
  const menuItem = Number(body.menuItem)
  const permissoesArr = body.permissoes || []

  if (!codigoUsuario || !menuItem) {
    return { status: 'failed', message: 'Usuário ou menu não informados na requisição.' }
  }

  // Identifica quais funcionalidades foram marcadas no frontend
  const marcadasIds = permissoesArr.filter((p: any) => p.marcado === 1 || p.marcado === true)
                                  .map((p: any) => Number(p.idFuncionalidade))

  try {
    const db = await useDb() 
    
    // 1. Busca apenas o que já existe no banco para este usuário e menu
    const queryAtuais = `
      SELECT codigo, funcionalidade, ativo 
      FROM configuracao.usuarioFuncionalidade 
      WHERE usuario = @usuario AND menuItem = @menu
    `
    const requestAtuais = db.request()
    requestAtuais.input('usuario', sql.Int, codigoUsuario)
    requestAtuais.input('menu', sql.Int, menuItem)
    const resultAtuais = await requestAtuais.query(queryAtuais)
    const atuais = resultAtuais.recordset || []

    const usuarioLogado = 1 

    // 2. Itera sobre as permissões que vieram do FRONTEND
    // (A tela envia todas as funcionalidades daquele menu)
    for (const p of permissoesArr) {
      const codigoFunc = Number(p.idFuncionalidade)
      const deveEstarAtivo = (p.marcado === 1 || p.marcado === true) ? 1 : 0
      
      const registroNoBanco = atuais.find((a: any) => a.funcionalidade === codigoFunc)
      const estaAtivoNoBanco = registroNoBanco ? (registroNoBanco.ativo ? 1 : 0) : null
      
      let executarProc = false

      // CASO A: Marcou no front mas não existe no banco ou está inativo
      if (deveEstarAtivo === 1 && estaAtivoNoBanco !== 1) {
        executarProc = true
      } 
      // CASO B: Desmarcou no front mas estava ativo no banco (Revogação)
      else if (deveEstarAtivo === 0 && estaAtivoNoBanco === 1) {
        executarProc = true
      }

      // Se houver mudança real de estado ou for uma nova ativação
      if (executarProc) {
         const requestExec = db.request()
         requestExec.input('registroCodigo', sql.Int, registroNoBanco ? registroNoBanco.codigo : 0)
         requestExec.input('usuario', sql.Int, codigoUsuario)
         requestExec.input('menu', sql.Int, menuItem)
         requestExec.input('funcionalidade', sql.Int, codigoFunc)
         requestExec.input('ativo', sql.Bit, deveEstarAtivo)
         requestExec.input('usuarioAlteracao', sql.Int, usuarioLogado)

         const queryExec = `EXEC configuracao.usuarioFuncionalidade_Atualiza @registroCodigo, @usuario, @menu, @funcionalidade, @ativo, @usuarioAlteracao`
         await requestExec.query(queryExec)
      }
    }

    return {
      status: 'success',
      message: 'Permissões atualizadas com sucesso!'
    }
  } catch (error: any) {
    console.error('Erro crítico ao gravar permissões:', error)
    return { status: 'failed', message: 'Erro no servidor: ' + error.message }
  }
})