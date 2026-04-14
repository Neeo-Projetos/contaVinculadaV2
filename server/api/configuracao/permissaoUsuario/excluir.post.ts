import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import sql from 'mssql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Padronização: 'codigo' vindo do formulário representa o usuário
  const codigoUsuario = Number(body.codigo)
  const menuItem = Number(body.menuItem)
  const permissoesArr = body.permissoes || []

  if (!codigoUsuario || !menuItem) {
    return { status: 'failed', message: 'Usuário ou menu não informados na requisição.' }
  }

  // IDs das funcionalidades que devem ter o acesso revogado (ativo = 0)
  // permissoesArr pode vir como array de IDs ou array de objetos contendo idFuncionalidade
  const revogarIds = permissoesArr.map((p: any) => typeof p === 'object' ? Number(p.idFuncionalidade) : Number(p))

  if (revogarIds.length === 0) {
    return { status: 'failed', message: 'Nenhuma permissão selecionada para revogação.' }
  }

  try {
    const db = await useDb() 
    
    // Busca os registros atuais para identificar o PK (codigo) de cada vínculo
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

    for (const codigoFunc of revogarIds) {
      const registroNoBanco = atuais.find((a: any) => a.funcionalidade === codigoFunc)
      
      // Só revoga se o registro existir e estiver ativo
      if (registroNoBanco && registroNoBanco.ativo === 1) {
         const requestExec = db.request()
         requestExec.input('registroCodigo', sql.Int, registroNoBanco.codigo)
         requestExec.input('usuario', sql.Int, codigoUsuario)
         requestExec.input('menu', sql.Int, menuItem)
         requestExec.input('funcionalidade', sql.Int, codigoFunc)
         requestExec.input('usuarioAlteracao', sql.Int, usuarioLogado)

         // Executa a Stored Procedure passando o código do registro para UPDATE (ativo = 0)
         const queryExec = `EXEC configuracao.usuarioFuncionalidade_Atualiza @registroCodigo, @usuario, @menu, @funcionalidade, 0, @usuarioAlteracao`
         await requestExec.query(queryExec)
      }
    }

    return {
      status: 'success',
      message: 'Permissões revogadas com sucesso.'
    }
  } catch (error: any) {
    console.error('Erro ao revogar permissões:', error)
    return { status: 'failed', message: 'Erro no servidor: ' + error.message }
  }
})