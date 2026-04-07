import { defineEventHandler, readMultipartFormData } from 'h3'
import { useDb } from '../../../../utils/db'
import { comum } from '../../../../utils/comum'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) return { status: 'failed', mensagem: 'Nenhum dado recebido.' }

  let anoCampo = ''
  let fileBuffer: Buffer | null = null

  formData.forEach((field) => {
    if (field.name === 'ano') anoCampo = field.data.toString()
    if (field.name === 'arquivo' || field.name === 'xmlNota[]') fileBuffer = field.data
  })

  if (!anoCampo || !fileBuffer) {
    return { status: 'failed', mensagem: 'Mês/Ano ou arquivo não enviados.' }
  }

  const [mes, ano] = anoCampo.split('/')
  const mesReferente = `${ano}-${mes}-01`
  const usuarioLogado = 1 // TODO: Recuperar da sessão/auth

  // Função auxiliar do salário
  const processarTotaisFuncionario = (func: any) => {
    if (func.tipoDeCalculo === 1) {
      func.salarioLiquido = func.salarioBase
    } else {
      const totalBruto = func.salarioBase + func.creditos
      func.salarioLiquido = totalBruto - func.debitos
    }
  }

  try {
    const pool = await useDb()

    // Select para buscar verbas
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

    // Leitura do arquivo (Windows-1252)
    const decoder = new TextDecoder('windows-1252')
    const textContent = decoder.decode(fileBuffer as Buffer)
    const linhas: string[] = textContent.split(/\r?\n/)

    let mesDoArquivoValidado = false
    let funcionarioAtual: any = null
    let contrachequesNoArquivo = 0
    const funcionariosNaoEncontrados: number[] = []

    const arrayContracheque: any[] = []

    for (const linhaRaw of linhas) {
      const linha = linhaRaw.trim()
      if (!linha) continue

      // Validação da data no arquivo
      if (!mesDoArquivoValidado && linha.toLowerCase().includes('referente ao mês de')) {
        const posicao = linha.toLowerCase().indexOf('referente ao mês de')
        const textoData = linha.substring(posicao + 'referente ao mês de'.length).trim()
        const partesData = textoData.split('/')

        if (partesData.length === 2) {
          const mesNome = (partesData[0] ?? '').toLowerCase()
          const anoArquivo = partesData[1] ?? ''
          const mesesMapa: { [key: string]: string } = {
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
          const mesNum = mesesMapa[mesNome] || '00'
          const mesDoArquivo = `${anoArquivo}-${mesNum}-01`

          if (mesDoArquivo !== mesReferente) {
            return { status: 'failed', mensagem: 'Mês e ano informados não correspondem ao do arquivo.' }
          }
          mesDoArquivoValidado = true
        }
      }

      // Busca por funcionário (Adm/CPF)
      if (linha.includes('Adm:') && linha.includes('CPF:')) {
        // Processo o funcionário anterior antes do novo
        if (funcionarioAtual !== null) {
          processarTotaisFuncionario(funcionarioAtual)
          if (funcionarioAtual.salarioLiquido > 0) {
            arrayContracheque.push(funcionarioAtual)
          }
        }

        contrachequesNoArquivo++
        const partes = linha.split(/\s+/)
        const matricula = partes[0]
        const posicaoCpf = linha.indexOf('CPF:')
        const cpfRaw = linha.substring(posicaoCpf + 4, posicaoCpf + 19).trim()

        const cpfVerificar = comum.formatarCpf(cpfRaw)

        // Busca projeto e parâmetros financeiros
        const sqlFunc = `
          SELECT F.codigo, F.projeto, P.tipoDeCalculo, PF.decimoTerceiro, PF.feriasConstitucional, PF.multaFgts, PF.submodulo 
          FROM cadastro.Funcionario F
          LEFT JOIN cadastro.projeto P ON F.projeto = P.codigo
          LEFT JOIN configuracao.parametroFinanceiro PF ON P.codigo = PF.projeto AND PF.ativo = 1
          WHERE F.cpf = '${cpfVerificar}'
        `
        const resFunc = await pool.request().query(sqlFunc)

        if (resFunc.recordset.length === 0) {
          funcionariosNaoEncontrados.push(0)
          funcionarioAtual = null
          continue
        }

        const funcData = resFunc.recordset[0]
        const funcionario = parseInt(funcData.codigo)
        const projeto = parseInt(funcData.projeto)
        const tipoDeCalculo = funcData.tipoDeCalculo

        const vncQuery = `
          SELECT CV.codigoReferencia 
          FROM cadastro.projetoVerba PV
          LEFT JOIN cadastro.verbas CV ON PV.verba = CV.codigo
          WHERE PV.projeto = ${projeto}
        `
        const vncResult = await pool.request().query(vncQuery)
        const verbasNaoCalculadas: number[] = []
        vncResult.recordset.forEach((r: any) => {
          if (r.codigoReferencia) {
            verbasNaoCalculadas.push(parseInt(r.codigoReferencia))
          }
        })

        funcionarioAtual = {
          funcionario,
          cpf: cpfVerificar,
          matricula,
          mesAno: mesReferente,
          salarioBase: 0.0,
          creditos: 0.0,
          debitos: 0.0,
          salarioLiquido: 0.0,
          projeto,
          tipoDeCalculo,
          verbasNaoCalculadas,
          parametroFinanceiros: funcData,
          verbasProcessadas: [] as any[]
        }

      }

      if (funcionarioAtual === null) continue

      // Split por 2+ espaços pra não quebrar as colunas
      const colunas = linha.split(/\s{2,}/)
      const primeiraColunaRaw = colunas[0] ?? ''
      const ultimaColunaRaw = colunas[colunas.length - 1] ?? ''
      if (colunas.length > 1 && !isNaN(Number(primeiraColunaRaw)) && primeiraColunaRaw.trim() !== '') {
        const codigoVerba = parseInt(primeiraColunaRaw)
        const valorString = ultimaColunaRaw

        if (funcionarioAtual.verbasNaoCalculadas.includes(codigoVerba)) {
          continue
        }

        if (/[\d.,]+/.test(valorString)) {
          const valorNumerico = parseFloat(valorString.replace(/\./g, '').replace(',', '.')) || 0

          const salarioBaseVerba = (codigoVerba === 5 || codigoVerba === 6005 || codigoVerba === 8006)
          const salarioCreditoVerba = codigosCredito.includes(codigoVerba)
          const salarioDebitoVerba = codigosDebito.includes(codigoVerba)

          if (salarioBaseVerba || salarioCreditoVerba || salarioDebitoVerba) {
            funcionarioAtual.verbasProcessadas.push({
              codigoVerba,
              valor: valorNumerico
            })

            if (salarioBaseVerba) {
              funcionarioAtual.salarioBase = valorNumerico
            } else if (salarioCreditoVerba) {
              funcionarioAtual.creditos += valorNumerico
            } else if (salarioDebitoVerba) {
              funcionarioAtual.debitos += valorNumerico
            }
          }
        }
      }
    }

    // Processo o último funcionário do arquivo
    if (funcionarioAtual !== null) {
      processarTotaisFuncionario(funcionarioAtual)
      if (funcionarioAtual.salarioLiquido > 0) {
        arrayContracheque.push(funcionarioAtual)
      }
    }

    const arrayContrachequeFiltro: any[] = []

    for (const row of arrayContracheque) {
      const checkQuery = `SELECT codigo, valorLiquido, statusAprovacao FROM operacao.baseContracheque WHERE cpf = '${row.cpf}' AND mesAno = '${row.mesAno}'`
      const checkResult = await pool.request().query(checkQuery)

      let codigoExistente = 0
      let chamarProcedure = false

      if (checkResult.recordset.length === 0) {
        chamarProcedure = true
      } else {
        const dadosAntigos = checkResult.recordset[0]
        codigoExistente = parseInt(dadosAntigos.codigo)
        const valorAntigo = parseFloat(dadosAntigos.valorLiquido)
        const statusAntigo = parseFloat(dadosAntigos.statusAprovacao)

        if (statusAntigo === 0) {
          chamarProcedure = true
          codigoExistente = 0
        } else {
          if (Math.round(row.salarioLiquido * 100) !== Math.round(valorAntigo * 100)) {
            chamarProcedure = true
          }
        }
      }

      if (chamarProcedure) {
        const salarioLiquido = row.salarioLiquido
        const p = row.parametroFinanceiros

        const decimoTerceiro = (salarioLiquido * (p.decimoTerceiro ?? 0)) / 100.0
        const feriasConstitucional = (salarioLiquido * (p.feriasConstitucional ?? 0)) / 100.0
        const multaFgts = (salarioLiquido * (p.multaFgts ?? 0)) / 100.0
        const submodulo = (salarioLiquido * (p.submodulo ?? 0)) / 100.0
        const valorRetencao = decimoTerceiro + feriasConstitucional + multaFgts + submodulo

        const funcionario = parseInt(row.funcionario)

        const resultBase = await pool.request().query(`
          EXEC operacao.baseContracheque_Atualiza 
            ${codigoExistente}, 
            ${funcionario}, 
            '${row.cpf}', 
            ${row.projeto}, 
            ${row.salarioLiquido}, 
            '${row.matricula}', 
            '${row.mesAno}', 
            ${decimoTerceiro}, 
            ${feriasConstitucional}, 
            ${multaFgts}, 
            ${submodulo}, 
            ${valorRetencao}, 
            2, 
            1, 
            ${usuarioLogado}
        `)

        const codigoContracheque = parseInt(resultBase.recordset[0].codigo)

        if (codigoContracheque > 0) {
          await pool.request().query(`DELETE FROM operacao.baseContrachequeDetalhes WHERE codigoContracheque = ${codigoContracheque}`)

          for (const rowDetalhes of row.verbasProcessadas) {
            const codigoVerba = rowDetalhes.codigoVerba
            const valorVerba = rowDetalhes.valor

            let tipoMovimentacao = 0
            if (codigosCredito.includes(codigoVerba)) {
              tipoMovimentacao = 1
            } else if (codigosDebito.includes(codigoVerba)) {
              tipoMovimentacao = 2
            }

            const percentualDecimo = p.decimoTerceiro ?? 0
            const percentualFerias = p.feriasConstitucional ?? 0
            const percentualMulta = p.multaFgts ?? 0
            const percentualSubmodulo = p.submodulo ?? 0

            const valorDecimo = (valorVerba * percentualDecimo) / 100.0
            const valorFerias = (valorVerba * percentualFerias) / 100.0
            const valorMulta = (valorVerba * percentualMulta) / 100.0
            const valorSubmodulo = (valorVerba * percentualSubmodulo) / 100.0
            const valorTotal = valorDecimo + valorFerias + valorMulta + valorSubmodulo

            await pool.request().query(`
              EXEC operacao.baseContrachequeDetalhes_Atualiza 
                ${codigoContracheque}, ${valorVerba}, ${codigoVerba}, 
                ${valorDecimo}, ${percentualDecimo}, 
                ${valorFerias}, ${percentualFerias}, 
                ${valorMulta}, ${percentualMulta}, 
                ${valorSubmodulo}, ${percentualSubmodulo}, 
                ${valorTotal}, ${tipoMovimentacao}
            `)
          }
        }

        arrayContrachequeFiltro.push(row)
      }
    }

    if (contrachequesNoArquivo > 0 && arrayContrachequeFiltro.length === 0) {
      return { status: 'failed', mensagem: 'Todos os contracheques deste arquivo já foram importados ou não sofreram alteração de valor.' }
    }

    return { status: 'success' }
  } catch (erro: any) {
    console.error('Erro na importação:', erro)
    return { status: 'failed', mensagem: 'Erro ao processar o arquivo: ' + erro.message }
  }
})