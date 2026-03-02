import { defineEventHandler, getQuery, setHeader } from 'h3'
import { useDb } from '../../../../utils/db'

// @ts-ignore
import PdfPrinter from 'pdfmake'
// @ts-ignore
import htmlToPdfmake from 'html-to-pdfmake'
import { JSDOM } from 'jsdom'

function valorPorExtenso(valor: number): string {
    const singular = ["centavo", "real", "mil", "milhão", "bilhão", "trilhão", "quatrilhão"]
    const plural = ["centavos", "reais", "mil", "milhões", "bilhões", "trilhões", "quatrilhões"]
    const c = ["", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"]
    const d = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
    const d10 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"]
    const u = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"]

    let z = 0
    let valStr = valor.toFixed(2)
    let inteiro = valStr.split(".")

    for (let i = 0; i < inteiro.length; i++) {
        while (inteiro[i]!.length < 3) inteiro[i] = "0" + inteiro[i]
    }

    let fim = inteiro.length - (parseInt(inteiro[inteiro.length - 1] as string) > 0 ? 1 : 2)
    let rt = ""

    for (let i = 0; i < inteiro.length; i++) {
        let v = inteiro[i] as string
        let vInt = parseInt(v)
        let rc = (vInt > 100 && vInt < 200) ? "cento" : c[parseInt(v[0] as string)]
        let rd = (parseInt(v[1] as string) < 2) ? "" : d[parseInt(v[1] as string)]
        let ru = (vInt > 0) ? ((parseInt(v[1] as string) === 1) ? d10[parseInt(v[2] as string)] : u[parseInt(v[2] as string)]) : ""

        let r = rc + ((rc && (rd || ru)) ? " e " : "") + rd + ((rd && ru) ? " e " : "") + ru
        let t = inteiro.length - 1 - i

        r += r ? " " + (vInt > 1 ? plural[t] : singular[t]) : ""
        if (v === "000") z++
        else if (z > 0) z--
        if (t === 1 && z > 0 && parseInt(inteiro[0] as string) > 0) {
            r += (z > 1 ? " de " : "") + plural[t]
        }
        if (r) {
            rt = rt + (((i > 0) && (i <= fim) && (parseInt(inteiro[0] as string) > 0) && (z < 1)) ? ((i < fim) ? ", " : " e ") : " ") + r
        }
    }

    rt = rt ? rt.trim() : "zero reais"
    return rt.charAt(0).toUpperCase() + rt.slice(1)
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const codigo = Number(query.codigo)

    if (!codigo) {
        return "Código do lançamento não informado."
    }

    try {
        const pool = await useDb()
        const sql = `
            SELECT LR.valorOficio, LR.dataOficio, LR.dataEntrada, LR.numeroOficio, C.descricao AS nomeClassificacao, PO.redacaoOficio, PR.apelido,
            PR.descricao as nomeOrgao, PR.cnpj, PR.numeroContrato, PR.logradouro + ', ' + CAST(PR.numeroEndereco AS VARCHAR) + ' - ' + PR.bairro + ' - ' 
            + PR.cidade + '/' + PR.uf as enderecoCompleto FROM operacao.lancamentoReembolso LR
            INNER JOIN cadastro.projeto PR ON PR.codigo = LR.projeto
            INNER JOIN configuracao.parametroOficio PO ON PO.projeto = PR.codigo
            LEFT JOIN tabelaBasica.classificacao C ON C.codigo = LR.classificacaoOficio
            WHERE LR.codigo = ${codigo}
            `
        const result = await pool.request().query(sql)

        if (result.recordset.length === 0) {
            return "Lançamento não encontrado ou projeto sem parâmetro de ofício vinculado."
        }

        const row = result.recordset[0]

        const dataBaseOficio = row.dataOficio ? new Date(row.dataOficio) : new Date()
        const dataBaseEntrada = row.dataEntrada ? new Date(row.dataEntrada) : new Date()

        const anoOficio = dataBaseOficio.getFullYear().toString()
        const periodo = `${String(dataBaseEntrada.getMonth() + 1).padStart(2, '0')}/${dataBaseEntrada.getFullYear()}`

        const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        const dataCabecalho = `${String(dataBaseOficio.getDate()).padStart(2, '0')} de ${meses[dataBaseOficio.getMonth() + 1]} de ${anoOficio}`
        const cidadeDataFormatado = `Rio de Janeiro, ${dataCabecalho}.`

        const valor = Number(row.valorOficio) || 0
        const valorFormatado = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const valorExtenso = valorPorExtenso(valor)

        const assunto = row.nomeClassificacao || 'Solicitação'
        const numOficio = row.numeroOficio || 'S/N'
        
        const setorNome = 'Departamento Pessoal'
        const assinaturaNome = 'Daiana Amorim'

        let textoCorpo = row.redacaoOficio || ''
        const mapReplaces: Record<string, string> = {
            '$nomeOrgao$': `<b>${(row.nomeOrgao || '').toUpperCase()}</b>`,
            '$cnpj$': row.cnpj || '',
            '$enderecoCompleto$': `<br>${row.enderecoCompleto || ''}`,
            '$numContrato$': `<b>${row.numeroContrato || ''}</b>`,
            '$numeroOficio$': numOficio,
            '$anoOficio$': anoOficio,
            '$assunto$': `<b>${assunto}</b>`,
            '$periodoReferencia$': `<b>${periodo}</b>`,
            '$valor$': `<b>${valorFormatado}</b>`,
            '$valorExtenso$': `<b>${valorExtenso}</b>`,
            '$cidadeData$': cidadeDataFormatado,
            '$signatarioNome$': '',
            '$setor$': ''
        }

        for (const [key, val] of Object.entries(mapReplaces)) {
            textoCorpo = textoCorpo.split(key).join(val)
        }

        textoCorpo = textoCorpo.replace(/&nbsp;/g, ' ')
        textoCorpo = textoCorpo.replace(/AO /g, '<br><br><b>AO</b><br>')
        textoCorpo = textoCorpo.replace(/Ofício nº/g, '<br><br><b>Ofício nº</b>')
        textoCorpo = textoCorpo.replace(/Ref:/g, '<br><br><b>Ref:</b>')
        textoCorpo = textoCorpo.replace(/Prezados Senhores,/g, '<br><br><b>Prezados Senhores,</b><br>')
        textoCorpo = textoCorpo.replace(/NTL Nova Tecnologia/g, '      <b>NTL Nova Tecnologia Ltda</b>')
        textoCorpo = textoCorpo.replace(/Solicitamos que/g, '<br><br>      Solicitamos que')
        textoCorpo = textoCorpo.replace(/Sendo o que/g, '<br><br>Sendo o que')

        textoCorpo = textoCorpo.replace(/<(?!\/?(b|i|u|a|br)\b)[^>]+>/gi, '')

        const fonts = {
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        }
        
        const Printer = PdfPrinter as any
        const printer = new Printer(fonts)

        const { window } = new JSDOM('')
        const htmlParsed = htmlToPdfmake(textoCorpo, { window })

        const docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [70, 60, 70, 80],
            defaultStyle: {
                font: 'Helvetica',
                fontSize: 11,
                lineHeight: 1.2
            },
            header: {
                canvas: [{ type: 'line', x1: 0, y1: 15, x2: 595, y2: 15, lineWidth: 4, lineColor: '#FF8C00' }],
                margin: [0, 0, 0, 0]
            },
            footer: () => {
                return {
                    stack: [
                        { canvas: [{ type: 'line', x1: 50, y1: 0, x2: 545, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }] },
                        { text: 'www.ntl.com.br', link: 'http://www.ntl.com.br', color: 'blue', alignment: 'center', margin: [0, 5, 0, 2], bold: true },
                        { text: '55(21) 3177-3395 | 55(21) 3529-2813 | contato@ntl.com.br', alignment: 'center', fontSize: 9, color: '#666666' }
                    ],
                    margin: [0, 10, 0, 0]
                }
            },
            content: [
                {
                    text: 'NTL', 
                    fontSize: 20, 
                    bold: true, 
                    color: '#666666',
                    margin: [0, -10, 0, 40]
                },
                ...htmlParsed,
                { text: '\n\n\n\n' },
                { text: '__________________________________________________', alignment: 'center' },
                { text: 'NTL Nova Tecnologia Ltda', alignment: 'center', bold: true, margin: [0, 5, 0, 0] },
                { text: assinaturaNome, alignment: 'center', margin: [0, 2, 0, 0] },
                { text: setorNome, alignment: 'center', margin: [0, 2, 0, 0] }
            ]
        }

        const pdfDoc = printer.createPdfKitDocument(docDefinition)
        
        return new Promise((resolve, reject) => {
            const chunks: any[] = []
            pdfDoc.on('data', (chunk: any) => chunks.push(chunk))
            pdfDoc.on('end', () => {
                const result = Buffer.concat(chunks)
                setHeader(event, 'Content-Type', 'application/pdf')
                setHeader(event, 'Content-Disposition', `inline; filename="Oficio_${row.apelido}_${numOficio}.pdf"`)
                resolve(result)
            })
            pdfDoc.on('error', reject)
            pdfDoc.end()
        })

    } catch (erro) {
        console.error('Erro ao gerar PDF:', erro)
        return "Erro interno ao gerar o PDF."
    }
})