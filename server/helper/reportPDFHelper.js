const PDFDocument = require('pdfkit');
const { Base64Encode } = require('base64-stream');
const ResponseInfor = require('../util/ResponseInfo');

const __page = {
  altura: 0,
  largura: 0,
  margens: {
    superior: 72,
    esquerda: 72,
    inferior: 72,
    direita: 72,
  },
  orientacao: 'retrato',
  fonteSize: null,
};

exports.reportDataToPDFResponse = async function (res, data, filename) {
  try {
    const outputFile = filename || 'report.pdf';
    // options.layout || 'portrait'; // process margins (Retrato ou Paisagem )
    const doc = await inicializar();
    // Set some headers
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/pdf');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Header to force download
    res.setHeader('Content-disposition', `attachment; filename=${outputFile}`);
    doc.pipe(res);
    await processaDocumento(doc, data);
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.reportDataToPDFBase64 = async function (res, data, filename) {
  try {
    const outputFile = filename || 'report.pdf';
    res.setHeader('PDFName', `filename=${outputFile}`);
    const doc = await inicializar();
    let finalString = ''; // contains the base64 string
    const stream = doc.pipe(new Base64Encode());

    await processaDocumento(doc, data);

    stream.on('data', (chunk) => {
      finalString += chunk;
    });

    stream.on('end', () => {
      res.status(200).json(new ResponseInfor(true, finalString));
    });
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

async function processaDados(doc, nivel = 0, configHeader, data) {
  const header = await configHeader.sort((a, b) => ((a.coluna > b.coluna) ? 1 : ((b.coluna > a.coluna) ? -1 : 0)));
  await global.util.asyncForEach(data, async (d) => {
    if (d.groupBy) {
      const headerPropQuebra = configHeader.find((f) => f.property === d.groupBy);
      let quebra = d.valor;
      if (quebra && !isNaN(quebra)) {
        quebra = parseFloat(quebra.toString()).toFormatt((headerPropQuebra && headerPropQuebra.formatt ? headerPropQuebra.formatt : '0,0[.]00'));
      } else if (quebra && !isNaN(Date.parse(quebra))) {
        quebra = new Date(quebra).toStringFormatt((headerPropQuebra && headerPropQuebra.formatt ? headerPropQuebra.formatt : 'DD/MM/YYYY'));
      }
      await abreQuebra(doc, nivel, d.label, quebra);
      await processaDados(doc, (nivel + 1), configHeader, d.data);
      await fechaQuebra(doc, nivel, d.label, quebra, configHeader, d.sumary);
    } else {
      const linha = await header.map((v) => {
        let prop = (d[v.property] ? d[v.property] : '');
        if (v.tipo.toLowerCase() === 'number' && v.formatt) {
          prop = parseFloat(prop.toString()).toFormatt(v.formatt);
        } else if (v.tipo.toLowerCase() === 'date' && v.formatt) {
          prop = new Date(prop).toStringFormatt(v.formatt);
        }
        if (v.align.toLowerCase() === 'left') {
          return prop.toString().rPad(v.largura);
        } if (v.align.toLowerCase() === 'rigth') {
          return prop.toString().lPad(v.largura);
        }
        return prop.toString().cPad(v.largura);
      }).join(' ');
      doc.text(linha);
    }
  });
}

async function processaDocumento(doc, data) {
  await addCabecalho(doc, data);
  // Listenig add new Pages
  doc.on('pageAdded', async () => {
    await addCabecalho(doc, data);
  });
  // draw some text
  await processaDados(doc, 0, data.configHeader, data.data);
  await addSumary(doc, 0, null, 'Geral', data.configHeader, data.sumary);

  await finalizar(doc, data);
}
async function addCabecalho(doc, data) {
  addSeparador(doc);
  doc.font('Courier-Bold');
  doc.text(data.nome, /* doc.x, doc.page.height - positioFooter, */{
    // lineBreak: false,
    align: 'left',
  });
  const vUnidade = ''; // nome da Unidade loterica
  doc.text(vUnidade, /* doc.x, doc.page.height - positioFooter, */{
    // lineBreak: false,
    align: 'left',
    continued: true,
  }).text(`Data: ${new Date().toStringFormatt('DD/MM/YYYY')}`, /* doc.page.margins.right, doc.page.height - positioFooter, */{
    // lineBreak: false,
    align: 'right',
    continued: false,
  });
  const vfiltros = (data.filtros ? `Filtros: ${data.filtros}` : '');
  doc.text(vfiltros, /* doc.x, doc.page.height - positioFooter, */{
    // lineBreak: false,
    align: 'left',
    continued: true,
  }).text(`Hora: ${new Date().toStringFormatt('HH:mm:ss').lPad(10)}`, /* doc.page.margins.right, doc.page.height - positioFooter, */{
    // lineBreak: false,
    align: 'right',
    continued: false,
  });
  if (data && data.configHeader && Array.isArray(data.configHeader)) {
    const linha = data.configHeader
      .sort((a, b) => ((a.coluna > b.coluna) ? 1 : ((b.coluna > a.coluna) ? -1 : 0)))
      .map((v) => {
        if (v.align.toLowerCase() === 'left') {
          return v.titulo.toString().rPad(v.largura);
        } if (v.align.toLowerCase() === 'rigth') {
          return v.titulo.toString().lPad(v.largura);
        }
        return v.titulo.toString().cPad(v.largura);
      }).join(' ');
    addSeparador(doc);
    doc.font('Courier-Bold').text(linha);
    addSeparador(doc);
  }
  doc.font('Courier');
}
async function addSeparador(doc) {
  // var tamanho = Math.floor((doc.page.width - doc.page.margins.right - doc.page.margins.left) / doc._fontSize)
  // doc.text('-'.lPad(tamanho, '-'))
  doc.moveTo(doc.x, doc.y - 1)
    .lineTo((doc.page.width - doc.page.margins.right), doc.y - 1)
    // .dash(5, {space: 2})
    .stroke();
}
async function abreQuebra(doc, nivel = 0, label, valor) {
  const identNivel = ''.lPad(((nivel || 0) + 1) * 2);
  doc.font('Courier-Bold').text(identNivel + (label ? `${label}: ` : '') + valor);
  doc.font('Courier');
}
async function fechaQuebra(doc, nivel = 0, label, valor, configHeader, sumary = []) {
  await addSumary(doc, nivel + 1, label, valor, configHeader, sumary);
}
async function addSumary(doc, nivel, label, valor, configHeader, sumary = []) {
  // draw some text
  if (sumary && Array.isArray(sumary) && sumary.length > 0 && configHeader && Array.isArray(configHeader) && configHeader.length > 0) {
    const identNivel = ''.lPad((nivel || 0) * 2);
    const strTotal = (label ? `Total ${label}: ` : 'Total: ');
    const grupoValue = identNivel + strTotal + valor.toString();
    let linha = configHeader
      .sort((a, b) => ((a.coluna > b.coluna) ? 1 : ((b.coluna > a.coluna) ? -1 : 0)))
      .map((v) => {
        const sum = sumary.find((f) => f.coluna === v.coluna);
        if (sum) {
          const vSum = parseFloat(sum.resultado.toString());
          const str = (sum.formatt ? vSum.toFormatt(sum.formatt) : vSum.toString());
          if (sum.align.toLowerCase() === 'left') {
            return str.toString().rPad(sum.largura);
          } if (sum.align.toLowerCase() === 'rigth') {
            return str.toString().lPad(sum.largura);
          }
          return str.toString().cPad(sum.largura);
        }
        return ''.rPad(v.largura);
      }).join(' ');
    linha = grupoValue + linha.substring(grupoValue.length, linha.length);
    // doc.lineWidth(12)
    doc.font('Courier-Bold').text(linha);
    // doc.lineWidth(12)
  }

  doc.font('Courier');
}
async function finalizar(doc, data) {
  doc.font('Courier-Bold');
  const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }
  for (let i = range.start; i < (range.start + range.count); i++) {
    doc.switchToPage(i);
    const pag = `Página: ${`${i + 1}/${range.count}`.lPad(10)}`;
    doc.text(pag, doc.page.margins.right, doc.page.margins.top, {
      align: 'right',
      continued: true,
    });
    // var vWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right)
    // vX= coluna
    const vX = doc.page.margins.left;
    // vY= linha
    const vY = (doc.page.height - doc.page.margins.bottom) + 2;
    doc.moveTo(vX, vY - 1).lineTo((doc.page.width - doc.page.margins.right), vY - 1).stroke();
    /*
    var rodape = 'GM Lotericas          www.gmloterica.com.br          (00) 0000-0000'
    doc.text(rodape,
      vX,
      vY, {
        lineBreak: false,
        width: vWidth,
        align: 'center',
        continued: false
      })
*/
    /*
    doc.text('GM Lotericas', vX, vY, {
      lineBreak: false,
      width: vWidth,
      align: 'left',
      continued: true
    })
      .text('www.gmloterica.com.br', {
        lineBreak: false,
        width: vWidth,
        align: 'center',
        continued: true
      })
      .text('(00) 0000-0000', {
        lineBreak: false,
        width: vWidth,
        align: 'right',
        continued: false
      })
      */
  }
  doc.end();
}
async function inicializar(options = {}) {
  let vOptions = { size: 'A4', margin: 20, bufferPages: true };
  vOptions = Object.assign(vOptions, options);
  const doc = new PDFDocument(vOptions);
  if (doc.page) {
    __page.orientacao = (doc.page.layout === 'portrait' ? 'retrato' : 'paisagem');
    __page.largura = doc.page.width;
    __page.altura = doc.page.height;
    if (doc.page.margins) {
      __page.margens.superior = doc.page.margins.top || __page.margens.superior;
      __page.margens.esquerda = doc.page.margins.left || __page.margens.esquerda;
      __page.margens.inferior = doc.page.margins.bottom || __page.margens.inferior;
      __page.margens.direita = doc.page.margins.right || __page.margens.direita;
    }
  }
  __page.fonteSize = vOptions.fontSize || 9;
  doc.font('Courier');
  doc.fontSize(__page.fonteSize);
  return doc;
}

async function processErro(erro) {
  if (erro.name === 'MongoError') {
    return new ResponseInfor(false, erro.errmsg);
  } if (erro.name === 'TypeError') {
    return new ResponseInfor(false, erro.message);
  }
  return new ResponseInfor(false, erro);
}
