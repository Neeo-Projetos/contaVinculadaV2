import { defineEventHandler, readMultipartFormData } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) return { status: 'failed', message: 'Nenhum dado recebido.' }

  let anoCampo = ''
  let fileBuffer: any = null 

  formData.forEach((field) => {
    if (field.name === 'ano') anoCampo = field.data.toString()
    if (field.name === 'arquivo') fileBuffer = field.data
  })

  if (!anoCampo || !fileBuffer) {
    return { status: 'failed', message: 'Mês/Ano ou arquivo não enviados.' }
  }

  const [mes, ano] = anoCampo.split('/')
  const mesReferente = `${ano}-${mes}-01`
  const usuarioLogado = 1

  try {
    const pool = await useDb()

    const verbasQuery = `SELECT codigoReferencia, tipo FROM cadastro.verbas WHERE ativo = 1`
    const verbasResult = await pool.request().query(verbasQuery)
    
    const codigosCredito = [5]
    const codigosDebito: number[] = []

    verbasResult.recordset.forEach((row: any) => {
      if (row.codigoReferencia == 5) return
      if (row.tipo == 1) codigosCredito.push(row.codigoReferencia)
      else codigosDebito.push(row.codigoReferencia)
    })

    const textContent = fileBuffer.toString('latin1')
    const linhas = textContent.split(/\r?\n/)

    let mesDoArquivoValidado = false
    let funcionarioAtual: any = null
    let chamouProcedure = false

    for (const linhaRaw of linhas) {
      const linha = linhaRaw.trim()
      if (!linha) continue

      if (!mesDoArquivoValidado && linha.includes('Referente ao mês de')) {
        const textoData = linha.substring(linha.indexOf('Referente ao mês de') + 19).trim()
        const partesData = textoData.split('/')
        if (partesData.length === 2) {
          const mesesMapa: Record<string, string> = {
            'janeiro': '01',
            'fevereiro': '02', 
            'março': '03', 
            'abril': '04',
            'maio': '05', 
            'junho': '06', 
            'julho': '07', 
            'agosto': '08',
            'setembro': '09', 
            'outubro': '10', 
            'novembro': '11', 
            'dezembro': '12'
          }
          const mesNum = mesesMapa[partesData[0].toLowerCase()] || '00'
          const mesDoArquivo = `${partesData[1]}-${mesNum}-01`
          
          if (mesDoArquivo !== mesReferente) {
            return { status: 'failed', message: 'Mês e ano informados não correspondem ao do arquivo.' }
          }
          mesDoArquivoValidado = true
        }
      }

      if (linha.includes('Adm:') && linha.includes('CPF:')) {
        if (funcionarioAtual) await processarFuncionarioNoBanco(pool, funcionarioAtual, codigosCredito, codigosDebito, usuarioLogado)

        const partes = linha.split(/\s+/)
        const matricula = partes[0]
        const cpfRaw = linha.substring(linha.indexOf('CPF:') + 4, linha.indexOf('CPF:') + 19).trim()
        const cpfVerificar = cpfRaw.replace(/\D/g, '')

        const projQuery = `
          SELECT F.codigo, F.projeto, P.tipoDeCalculo, PF.decimoTerceiro, PF.feriasConstitucional, PF.multaFgts, PF.submodulo 
          FROM cadastro.Funcionario F
          LEFT JOIN cadastro.projeto P ON F.projeto = P.codigo
          LEFT JOIN configuracao.parametroFinanceiro PF ON P.codigo = PF.projeto AND PF.ativo = 1
          WHERE F.cpf = '${cpfVerificar}'
        `
        const projResult = await pool.request().query(projQuery)

        if (projResult.recordset.length === 0) {
          funcionarioAtual = null
          continue
        }

        const funcData = projResult.recordset[0]

        const vncQuery = `
          SELECT CV.codigoReferencia 
          FROM cadastro.projetoVerba PV
          LEFT JOIN cadastro.verbas CV ON PV.verba = CV.codigo
          WHERE PV.projeto = ${funcData.projeto}
        `
        const vncResult = await pool.request().query(vncQuery)
        const verbasNaoCalculadas = vncResult.recordset.map((r: any) => r.codigoReferencia)

        funcionarioAtual = {
          funcionario: funcData.codigo,
          cpf: cpfVerificar,
          matricula,
          mesAno: mesReferente,
          salarioBase: 0, creditos: 0, debitos: 0, salarioLiquido: 0,
          projeto: funcData.projeto,
          tipoDeCalculo: funcData.tipoDeCalculo,
          verbasNaoCalculadas,
          parametros: funcData,
          verbasProcessadas: []
        }
      }

      if (funcionarioAtual) {
        const colunas = linha.split(/\s{2,}/)
        if (colunas.length > 1 && !isNaN(Number(colunas[0]))) {
          const codigoVerba = Number(colunas[0])
          const valorString = colunas[colunas.length - 1]

          if (!funcionarioAtual.verbasNaoCalculadas.includes(codigoVerba)) {
            const valorNumerico = Number(valorString.replace('.', '').replace(',', '.')) || 0
            
            const isBase = (codigoVerba == 5 || codigoVerba == 6005 || codigoVerba == 8006)
            const isCredito = codigosCredito.includes(codigoVerba)
            const isDebito = codigosDebito.includes(codigoVerba)

            if (isBase || isCredito || isDebito) {
              funcionarioAtual.verbasProcessadas.push({ codigoVerba, valor: valorNumerico })
              
              if (isBase) funcionarioAtual.salarioBase = valorNumerico
              else if (isCredito) funcionarioAtual.creditos += valorNumerico
              else if (isDebito) funcionarioAtual.debitos += valorNumerico
            }
          }
        }
      }
    }

    if (funcionarioAtual) {
      const executou = await processarFuncionarioNoBanco(pool, funcionarioAtual, codigosCredito, codigosDebito, usuarioLogado)
      if(executou) chamouProcedure = true
    }

    if (!chamouProcedure) {
      return { status: 'failed', message: 'Todos os contracheques deste arquivo já foram importados ou não sofreram alteração.' }
    }

    return { status: 'success', message: 'Operação realizada com sucesso.' }

  } catch (erro) {
    console.error('Erro ao importar contracheque:', erro)
    return { status: 'failed', message: 'Erro ao processar o arquivo de importação.' }
  }
})

async function processarFuncionarioNoBanco(pool: any, func: any, codigosCredito: number[], codigosDebito: number[], usuario: number) {
  if (func.tipoDeCalculo == 1) {
    func.salarioLiquido = func.salarioBase
  } else {
    func.salarioLiquido = func.salarioBase + func.creditos - func.debitos
  }

  if (func.salarioLiquido <= 0) return false

  const checkQuery = `SELECT codigo, valorLiquido, statusAprovacao FROM operacao.baseContracheque WHERE cpf = '${func.cpf}' AND mesAno = '${func.mesAno}'`
  const checkResult = await pool.request().query(checkQuery)

  let codigoExistente = 0
  let chamarProcedure = false

  if (checkResult.recordset.length === 0) {
    chamarProcedure = true
  } else {
    const dadosAntigos = checkResult.recordset[0]
    codigoExistente = dadosAntigos.codigo
    if (dadosAntigos.statusAprovacao == 0) {
      chamarProcedure = true
      codigoExistente = 0
    } else {
      if (Math.round(func.salarioLiquido * 100) !== Math.round(dadosAntigos.valorLiquido * 100)) {
        chamarProcedure = true
      }
    }
  }

  if (!chamarProcedure) return false

  const decimoTerceiro = (func.salarioLiquido * (func.parametros.decimoTerceiro || 0)) / 100.0
  const ferias = (func.salarioLiquido * (func.parametros.feriasConstitucional || 0)) / 100.0
  const multa = (func.salarioLiquido * (func.parametros.multaFgts || 0)) / 100.0
  const submodulo = (func.salarioLiquido * (func.parametros.submodulo || 0)) / 100.0
  const valorRetencao = decimoTerceiro + ferias + multa + submodulo

  // Grava Base
  const execBase = `
      EXEC operacao.baseContracheque_Atualiza 
      ${codigoExistente}, 
      ${func.funcionario}, 
      '${func.cpf}', 
      ${func.projeto}, 
      ${func.salarioLiquido}, 
      '${func.matricula}', 
      '${func.mesAno}', 
      ${decimoTerceiro}, 
      ${ferias}, 
      ${multa}, 
      ${submodulo}, 
      ${valorRetencao}, 
      2,
      1, 
      ${usuario}
      `
  const resultBase = await pool.request().query(execBase)
  const codigoContracheque = resultBase.recordset[0].codigo

  if (codigoContracheque > 0) {
    await pool.request().query(`DELETE FROM operacao.baseContrachequeDetalhes WHERE codigoContracheque = ${codigoContracheque}`)

    for (const v of func.verbasProcessadas) {
      let tipoMovimentacao = 0
      if (codigosCredito.includes(v.codigoVerba)) tipoMovimentacao = 1
      else if (codigosDebito.includes(v.codigoVerba)) tipoMovimentacao = 2

      const vDecimo = (v.valor * (func.parametros.decimoTerceiro || 0)) / 100.0
      const vFerias = (v.valor * (func.parametros.feriasConstitucional || 0)) / 100.0
      const vMulta = (v.valor * (func.parametros.multaFgts || 0)) / 100.0
      const vSub = (v.valor * (func.parametros.submodulo || 0)) / 100.0
      const valorTotal = vDecimo + vFerias + vMulta + vSub

      const execDetalhe = `
          EXEC operacao.baseContrachequeDetalhes_Atualiza 
          ${codigoContracheque}, 
          ${v.valor}, 
          ${v.codigoVerba}, 
          ${vDecimo}, 
          ${func.parametros.decimoTerceiro || 0}, 
          ${vFerias}, 
          ${func.parametros.feriasConstitucional || 0}, 
          ${vMulta}, 
          ${func.parametros.multaFgts || 0}, 
          ${vSub}, 
          ${func.parametros.submodulo || 0}, 
          ${valorTotal}, 
          ${tipoMovimentacao}
          `
      await pool.request().query(execDetalhe)
    }
  }

  return true
}