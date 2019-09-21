exports.processaDadosRelatorio = async function (data, configHeader, quebra) {
  configHeader = configHeader || [];
  quebra = quebra || [];
  await validaHeader(configHeader);
  await validaQuebra(quebra);
  const dadosProcessados = await processaQuebra(data, configHeader, quebra);

  const configSumary = await getPropertisSumaries(configHeader);
  const sumary = await sumarizar(data, configSumary);

  if (dadosProcessados && dadosProcessados.length > 0) {
    return { data: dadosProcessados, sumary };
  }
  return { data, sumary: sumary || [] };
};
// www-Falta Adicionar validação
async function validaHeader(configHeader) {
  // throw new Error('Filtro (' + fl + ') inválido para consulta.')
  /*
  {
    coluna: Number,
    property: String,
    titulo: String,
    align: String, // "left", "center", "rigth"
    largura: Number,
    tipo: String, // Text, Number, Date
    formatt: String, // formattMask, dd/mm/yyyy
    sumary: String // 'max', 'min', 'sum', 'avg', 'count'
  }
  */
}
// www-Falta Adicionar validação
async function validaQuebra(quebra) {
  // throw new Error('Filtro (' + fl + ') inválido para consulta.')
  /*
  { index: i, property: v.property, label: v.label }
  */
}
// Agrupa um array de dados pela Proprierada Passada
async function groupArrayByProperty(array, property) {
  const vArray = array || [];
  return vArray.map((v) => v[property]).filter((value, index, self) => self.map((v) => (v || '').toString()).indexOf((value || '').toString()) === index);
}
// retorna um array com as colunas e propriedades para sumarização.
async function getPropertisSumaries(configHeader) {
  const methodSumarys = ['max', 'min', 'sum', 'avg', 'count'];
  return configHeader.filter((t) => t.tipo && t.tipo.toString().toUpperCase() === 'NUMBER' && t.sumary && methodSumarys.indexOf(t.sumary.toString().toLowerCase()) > -1)
    .map((t) => ({
      coluna: t.coluna,
      property: t.property,
      align: t.align,
      largura: t.largura,
      formatt: t.formatt,
      sumary: t.sumary.toString().toLowerCase(),
      resultado: 0,
      max: null,
      min: null,
      sum: 0,
      count: 0,
      avg: 0,
    }));
}
// calcula campo sumarizado
async function processaSumario(arrayData, config, valorQuebra) {
  const sAux = {
    max: null,
    min: null,
    sum: 0,
    count: 0,
    avg: 0,
    ...config,
  };
  // var vJSONAntes = JSON.stringify(sAux)
  await global.util.asyncForEach(arrayData, async (d) => {
    if (d[sAux.property]) {
      sAux.max = await (!sAux.max || d[sAux.property] > sAux.max ? d[sAux.property] : sAux.max);
      sAux.min = await (!sAux.min || d[sAux.property] < sAux.min ? d[sAux.property] : sAux.min);
      sAux.sum = await sAux.sum + d[sAux.property];
      sAux.count = await sAux.count + 1;
      sAux.avg = await sAux.sum / sAux.count;
    }
  });
  sAux.resultado = await sAux[sAux.sumary];
  /*
  if (sAux && sAux.count !== arrayData.length) {
    console.log('Pre Sumary: ', vJSONAntes)
    console.log('post Sumary: ', JSON.stringify(sAux))
    throw new Error('Sumarizador Invalido, contagem sumarizada (' + sAux.count +
                    ') diferente da Quantidade de registros da quebra (' + arrayData.length +
                    ') - Quebra (' + valorQuebra + ') Propriedade Sumarizada (' + sAux.property + ')')
  }
  */
  return sAux;
}
// montar o array com os campos sumarizados
async function sumarizar(arrayData, configSumary, valorQuebra) {
  const array = [];
  await global.util.asyncForEach(configSumary, async (s) => {
    const r = await processaSumario(arrayData, s, valorQuebra);
    await array.push(r);
  });
  return (array && Array.isArray(array) ? array : []);
}

// Sumarizada os arrays
async function processaSumaryArray(sumaryResulto, sumary) {
  const sumaryGroup = sumaryResulto;
  if (sumaryGroup && sumary && sumaryGroup.property === sumary.property) {
    sumaryGroup.max = await (!sumaryGroup.max || sumary.max > sumaryGroup.max ? sumary.max : sumaryGroup.max);
    sumaryGroup.min = await (!sumaryGroup.min || sumary.min < sumaryGroup.min ? sumary.min : sumaryGroup.min);
    sumaryGroup.sum = await sumaryGroup.sum + sumary.sum;
    sumaryGroup.count = await sumaryGroup.count + sumary.count;
    sumaryGroup.avg = await sumaryGroup.sum / sumaryGroup.count;
  }
  return JSON.parse(JSON.stringify(sumaryGroup));
}

// montar o array com os campos sumarizados
async function sumarizarForArray(array, configSumary) {
  const vArray = [];
  await global.util.asyncForEach(configSumary, async (s) => {
    let sAux = {
      max: null, min: null, sum: 0, count: 0, avg: 0, ...s,
    };
    // var vJSONAntes = JSON.stringify(sAux)
    await global.util.asyncForEach(array, async (doc) => {
      if (doc.groupBy && doc.sumary && Array.isArray(doc.sumary) && doc.sumary.length > 0) {
        const r = await doc.sumary.find((f) => f && s && f.property === s.property);
        sAux = await processaSumaryArray(sAux, r);
      }
    });
    sAux.resultado = sAux[sAux.sumary];
    await vArray.push(JSON.parse(JSON.stringify(sAux)));
  });
  return (vArray && Array.isArray(vArray) ? vArray : []);
}
// Processa os dados retornados para gerar o relatório.
async function processaQuebra(data, configHeader, quebra, indice = -1) {
  const result = [];
  let exit = false;
  const configSumary = await getPropertisSumaries(configHeader);
  // doc => { index: i, property: v.property }
  await global.util.asyncForEach(quebra, async (doc) => {
    if (doc && doc.index > indice && !exit) {
      // Verifica se é o ultimo nivel da quebra
      if (doc.index === (quebra.length - 1)) {
        const grp = await groupArrayByProperty(data, doc.property);
        await global.util.asyncForEach(grp, async (g) => {
          let dataGp = [];
          // carrega os dados do agrupamento
          dataGp = await data.filter((t) => (t[doc.property] || '').toString() === (g || '').toString());
          /*
          await global.util.asyncForEach(data, async d => {
            if (d && d[doc.property] === g) {
              await dataGp.push(d)
            }
          })
          */
          const sumary = await sumarizar(dataGp, configSumary, g);
          /*
          if (sumary && sumary.length > 0 && sumary[0].count !== dataGp.length) {
            throw new Error('Sumarizador Invalido, contagem sumarizada (' + sumary[0].count +
                            ') diferente da Quantidade de registros da quebra (' + dataGp.length +
                            ') - Propriedade (' + doc.property + '), valor (' + g +
                            ') Nivel (' + (indice + 1) + ')')
          }
          */
          const q = {
            groupBy: doc.property, label: doc.label, valor: g, data: dataGp, sumary,
          };
          await result.push(JSON.parse(JSON.stringify(q)));
        });
      } else {
        const gp = await groupArrayByProperty(data, doc.property);
        await global.util.asyncForEach(gp, async (d) => {
          const dataFiltrada = await data.filter((t) => (t[doc.property] || '').toString() === (d || '').toString());
          const dt = await processaQuebra(dataFiltrada, configHeader, quebra, doc.index);
          const sumary = await sumarizarForArray(dt, configSumary);
          const q = {
            groupBy: doc.property, label: doc.label, valor: d, data: dt, sumary,
          };
          await result.push(JSON.parse(JSON.stringify(q)));
        });
      }
      exit = true;
    }
  });
  return result;
}
