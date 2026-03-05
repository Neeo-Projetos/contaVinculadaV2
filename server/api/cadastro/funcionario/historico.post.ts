import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const funcionarioId = Number(body.codigo) // Pega o código do funcionário enviado pelo frontend

  if (!funcionarioId) {
    return { status: 'failed', message: 'Código do funcionário não informado.' }
  }

  try {
    const db = await useDb()
    const request = db.request()
    request.input('funcionario', funcionarioId)

    // Mesma query braba do teu PHP
    const result = await request.query(`
      SELECT 
        H.codigo, H.nomeCompleto, H.cpf, H.matricula, H.email, 
        CP.descricao as projeto, H.dataAdmissao, H.dataAlteracao, 
        U.login AS usuarioAlteracao, H.ativo
      FROM cadastro.FuncionarioHistorico H 
      LEFT JOIN configuracao.usuario U ON U.codigo = H.usuarioAlteracao
      LEFT JOIN cadastro.projeto CP ON CP.codigo = H.projeto
      WHERE H.funcionario = @funcionario
      ORDER BY H.dataAlteracao DESC
    `)

    const rows = result.recordset
    const historicoFormatado = []

    // Dicionário pra traduzir o nome das colunas do banco pro usuário
    const dicionario: Record<string, string> = {
      nomeCompleto: 'Nome Completo',
      cpf: 'CPF',
      matricula: 'Número da Matrícula',
      email: 'E-mail',
      projeto: 'Nome do Projeto',
      dataAdmissao: 'Data de Admissão',
      ativo: 'Status'
    }

    // Funções auxiliares para formatar data (substituindo o `$comum->formataDataParaBR`)
    const formatarData = (dataStr: any) => dataStr ? new Date(dataStr).toLocaleDateString('pt-BR') : 'Vazio'
    const formatarDataHora = (dataStr: any) => dataStr ? new Date(dataStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Data desconhecida'

    // Loop comparando a linha atual com a linha anterior (o mesmo que teu FOR no PHP)
    for (let i = 0; i < rows.length; i++) {
      const atual = rows[i]
      const anterior = rows[i + 1] // Pega o registro mais antigo pra comparar

      const itemHistorico = {
        dataHora: formatarDataHora(atual.dataAlteracao),
        usuario: atual.usuarioAlteracao || 'Sistema',
        alteracoes: [] as any[]
      }

      if (anterior) {
        let teveAlteracao = false
        
        // Compara cada campo do dicionário (substituindo o array_diff_assoc)
        for (const key of Object.keys(dicionario)) {
          let valorAtual = atual[key]
          let valorAnterior = anterior[key]

          if (valorAtual !== valorAnterior) {
            teveAlteracao = true
            
            if (key === 'dataAdmissao') {
              valorAtual = formatarData(valorAtual)
              valorAnterior = formatarData(valorAnterior)
            }
            
            // Regra específica pro Status (Ativo/Inativo)
            if (key === 'ativo') {
               itemHistorico.alteracoes.push({
                 tipo: 'status',
                 mensagem: valorAtual ? '- O funcionário foi ativado.' : '- O funcionário foi desativado.'
               })
            } else {
               // Alteração de campo normal
               itemHistorico.alteracoes.push({
                 tipo: 'campo',
                 campo: dicionario[key],
                 valorAntigo: valorAnterior || 'Vazio',
                 valorNovo: valorAtual || 'Vazio'
               })
            }
          }
        }
        
        if (!teveAlteracao) {
          itemHistorico.alteracoes.push({ tipo: 'info', mensagem: '- Nenhuma alteração foi feita.' })
        }

      } else {
        // Se não tem "anterior", significa que chegamos no primeiro registro de todos
        itemHistorico.alteracoes.push({ tipo: 'criacao', mensagem: '- Funcionário cadastrado.' })
      }

      historicoFormatado.push(itemHistorico)
    }

    return {
      status: 'success',
      data: historicoFormatado
    }

  } catch (erro: any) {
    console.error('Erro ao recuperar histórico:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico: ' + erro.message }
  }
})