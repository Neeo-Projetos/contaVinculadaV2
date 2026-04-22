import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import crypto from 'crypto' 

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { pin } = body
  const usuarioLogadoId = 6

  if (!pin) return { status: 'failed', mensagem: 'PIN não informado.' }

  const pinCripto = crypto.createHash('md5').update(pin).digest('hex')

  try {
    const db = await useDb()
    const request = db.request()
    request.input('pin', pinCripto)
    request.input('usuarioId', usuarioLogadoId)

    const query = `SELECT codigo FROM configuracao.usuario WHERE pin = @pin AND codigo = @usuarioId`
    const result = await request.query(query)

    if (result.recordset.length > 0) return { status: 'success', mensagem: 'PIN validado.' }
    
    return { status: 'failed', mensagem: 'PIN incorreto.' }
  } catch (erro) {
    console.error('Erro ao validar PIN:', erro)
    return { status: 'failed', mensagem: 'Erro ao validar PIN.' }
  }
})