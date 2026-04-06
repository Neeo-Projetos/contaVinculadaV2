import { defineEventHandler, readMultipartFormData } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) return { status: 'failed', message: 'Nenhum dado recebido.' }

  let anoCampo = ''
  let fileBuffer: Buffer | null = null

  formData.forEach((field) => {
    if (field.name === 'ano') anoCampo = field.data.toString()
    if (field.name === 'arquivo' || field.name === 'xmlNota[]') fileBuffer = field.data
  })

  if (!anoCampo || !fileBuffer) {
    return { status: 'failed', message: 'Mês/Ano ou arquivo não enviados.' }
  }

  const [mes, ano] = anoCampo.split('/')
  const mesReferente = `${ano}-${mes}-01`
  const usuarioLogado = 1 // TODO: Recuperar da sessão/auth

  // Função auxiliar interna
  const processarTotaisFuncionario = (func: any) => {
    if (func.tipoDeCalculo === 1) {
      func.salarioLiquido = func.salarioBase
    } else {
      func.salarioLiquido = func.salarioBase + (func.creditos || 0) - (func.debitos || 0)
    }
  }

  try {
    const pool = await useDb()

    // 1. Busca verbas para classificação de crédito/débito
    const verbasQuery = `SELECT codigoReferencia, tipo FROM cadastro.verbas WHERE ativo = 1`
    const verbasResult = await pool.request().query(verbasQuery)
    const codigosCredito: number[] = [5]
    const codigosDebito: number[] = []

    verbasResult.recordset.forEach((row: any) => {
      const codigo = parseInt(row.codigoReferencia)
      if (codigo === 5) return
      if (row.tipo === 1) codigosCredito.push(codigo)
      else codigosDebito.push(codigo)
    })

    // 2. Leitura do arquivo (Latin1 para emular Windows-1252)
    const textContent = (fileBuffer as any).toString('latin1')
    const linhas: string[] = textContent.split(/\r?\n/)

    let mesDoArquivoValidado = false
    let funcionarioAtual: any = null
    let contrachequesNoArquivo = 0
    let importadosOuAtualizados = 0

    const arrayContracheque: any[] = []

    for (const linhaRaw of linhas) {
      const linha = linhaRaw.trim()
      if (!linha) continue

      // Validação da data no arquivo
      if (!mesDoArquivoValidado && linha.toLowerCase().includes('referente ao mês de')) {
        const posicao = linha.toLowerCase().indexOf('referente ao mês de')
        const textoData = linha.substring(posicao + 19).trim()
        const partesData = textoData.split('/')

        if (partesData.length === 2) {
          const mesNome = (partesData[0] as string).toLowerCase()
          const anoArquivo = partesData[1] as string
          const mesesMapa: { [key: string]: string } = {
            'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
            'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
            'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
          }
          const mesNum = mesesMapa[mesNome] || '00'
          const mesDoArquivo = `${anoArquivo}-${mesNum}-01`

          if (mesDoArquivo !== mesReferente) {
            return { status: 'failed', message: 'Mês e ano informados não correspondem ao do arquivo.' }
          }
          mesDoArquivoValidado = true
        }
      }

      // Identificação de Funcionário (Adm e CPF)
      if (linha.includes('Adm:') && linha.includes('CPF:')) {
        if (funcionarioAtual) processarTotaisFuncionario(funcionarioAtual)

        contrachequesNoArquivo++
        const partes = linha.split(/\s+/)
        const matricula = partes[0]
        const cpfRaw = linha.substring(linha.indexOf('CPF:') + 4, linha.indexOf('CPF:') + 19).trim()
        const cpfVerificar = cpfRaw.replace(/\D/g, '')

        const sqlFunc = `
          SELECT F.codigo, F.projeto, P.tipoDeCalculo, PF.decimoTerceiro, PF.feriasConstitucional, PF.multaFgts, PF.submodulo 
          FROM cadastro.Funcionario F
          LEFT JOIN cadastro.projeto P ON F.projeto = P.codigo
          LEFT JOIN configuracao.parametroFinanceiro PF ON P.codigo = PF.projeto AND PF.ativo = 1
          WHERE F.cpf = '${cpfVerificar}'
        `
        const resFunc = await pool.request().query(sqlFunc)

        if (resFunc.recordset.length === 0) {
          funcionarioAtual = null
          continue
        }

        const funcData = resFunc.recordset[0]
        const vncQuery = `
          SELECT CV.codigoReferencia 
          FROM cadastro.projetoVerba PV
          LEFT JOIN cadastro.verbas CV ON PV.verba = CV.codigo
          WHERE PV.projeto = ${funcData.projeto}
        `
        const vncResult = await pool.request().query(vncQuery)
        const verbasNaoCalculadas = vncResult.recordset.map((r: any) => parseInt(r.codigoReferencia))

        funcionarioAtual = {
          funcionario: funcData.codigo,
          cpf: cpfVerificar,
          matricula,
          mesAno: mesReferente,
          salarioBase: 0.0, creditos: 0.0, debitos: 0.0, salarioLiquido: 0.0,
          projeto: funcData.projeto,
          tipoDeCalculo: funcData.tipoDeCalculo,
          verbasNaoCalculadas,
          parametros: funcData,
          verbasProcessadas: []
        }
        arrayContracheque.push(funcionarioAtual)
      }

      // Processamento de Verbas
      if (funcionarioAtual) {
        const colunas = linha.split(/\s+/)
        const vPrimeira = colunas[0]
        const vUltima = colunas[colunas.length - 1]

        if (colunas.length > 1 && vPrimeira && !isNaN(Number(vPrimeira)) && vUltima) {
          const codigoVerba = parseInt(vPrimeira)
          const valorString = vUltima

          if (!funcionarioAtual.verbasNaoCalculadas.includes(codigoVerba)) {
            const valorNumerico = parseFloat(valorString.replace(/\./g, '').replace(',', '.')) || 0

            const isBase = (codigoVerba === 5 || codigoVerba === 6005 || codigoVerba === 8006)
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

    if (funcionarioAtual) processarTotaisFuncionario(funcionarioAtual)

    // 3. Persistência
    for (const func of arrayContracheque) {
      if (func.salarioLiquido <= 0) continue

      const checkQuery = `SELECT codigo, valorLiquido, statusAprovacao FROM operacao.baseContracheque WHERE cpf = '${func.cpf}' AND mesAno = '${func.mesAno}'`
      const checkResult = await pool.request().query(checkQuery)

      let codigoExistente = 0
      let chamarProcedure = false

      if (checkResult.recordset.length === 0) {
        chamarProcedure = true
      } else {
        const dadosAntigos = checkResult.recordset[0]
        codigoExistente = dadosAntigos.codigo
        if (dadosAntigos.statusAprovacao === 0) {
          chamarProcedure = true
          codigoExistente = 0
        } else {
          if (Math.round(func.salarioLiquido * 100) !== Math.round(dadosAntigos.valorLiquido * 100)) {
            chamarProcedure = true
          }
        }
      }

      if (chamarProcedure) {
        const p = func.parametros
        const decimo = (func.salarioLiquido * (p.decimoTerceiro || 0)) / 100.0
        const ferias = (func.salarioLiquido * (p.feriasConstitucional || 0)) / 100.0
        const multa = (func.salarioLiquido * (p.multaFgts || 0)) / 100.0
        const submodulo = (func.salarioLiquido * (p.submodulo || 0)) / 100.0
        const totalRetencao = decimo + ferias + multa + submodulo

        const resultBase = await pool.request().query(`
          EXEC operacao.baseContracheque_Atualiza 
            ${codigoExistente}, ${func.funcionario}, '${func.cpf}', ${func.projeto}, 
            ${func.salarioLiquido}, '${func.matricula}', '${func.mesAno}', 
            ${decimo}, ${ferias}, ${multa}, ${submodulo}, ${totalRetencao}, 
            2, 1, ${usuarioLogado}
        `)

        const codigoBase = resultBase.recordset[0].codigo

        if (codigoBase > 0) {
          await pool.request().query(`DELETE FROM operacao.baseContrachequeDetalhes WHERE codigoContracheque = ${codigoBase}`)

          for (const v of func.verbasProcessadas) {
            const tipoMov = codigosCredito.includes(v.codigoVerba) ? 1 : 2
            const vDecimo = (v.valor * (p.decimoTerceiro || 0)) / 100.0
            const vFerias = (v.valor * (p.feriasConstitucional || 0)) / 100.0
            const vMulta = (v.valor * (p.multaFgts || 0)) / 100.0
            const vSub = (v.valor * (p.submodulo || 0)) / 100.0
            const vTotal = vDecimo + vFerias + vMulta + vSub

            await pool.request().query(`
              EXEC operacao.baseContrachequeDetalhes_Atualiza 
                ${codigoBase}, ${v.valor}, ${v.codigoVerba}, 
                ${vDecimo}, ${p.decimoTerceiro || 0}, 
                ${vFerias}, ${p.feriasConstitucional || 0}, 
                ${vMulta}, ${p.multaFgts || 0}, 
                ${vSub}, ${p.submodulo || 0}, 
                ${vTotal}, ${tipoMov}
            `)
          }
        }
        importadosOuAtualizados++
      }
    }

    if (contrachequesNoArquivo > 0 && importadosOuAtualizados === 0) {
      return { status: 'failed', message: 'Todos os contracheques deste arquivo já foram importados ou não sofreram alteração.' }
    }

    return { status: 'success', message: 'Importação realizada com sucesso!' }
  } catch (erro: any) {
    console.error('Erro na importação:', erro)
    return { status: 'failed', message: 'Erro ao processar o arquivo: ' + erro.message }
  }
})