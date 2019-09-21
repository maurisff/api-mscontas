/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-extraneous-dependencies */
const shortid = require('shortid');
const moment = require('moment');

// eslint-disable-next-line one-var
const _ = require('lodash'),
  glob = require('glob');

module.exports = {
  moment,
  fatorial(valor) {
    // para valores negativos
    if (valor < 0) {
      return 1;
      // para valor = 0  ou igual a 1
    } if ((valor === 0) || (valor === 1)) {
      return 1;
    }
    let acumula = 1;
    for (let x = valor; x > 1; x--) {
      acumula *= x;
    }
    return acumula;
  },
  getQtdCombinacoes(qtNumeros, qtDezenas) {
    if (!isNaN(qtNumeros) && !isNaN(qtDezenas) && qtNumeros > 0 && qtDezenas > 0) {
      let div = (this.fatorial(qtDezenas) * this.fatorial(qtNumeros - qtDezenas));
      if (div === 0) {
        div = 1;
      }
      return (this.fatorial(qtNumeros) / div);
    }
    return 0;
  },
  getShortid() {
    return shortid.generate().toString().toUpperCase().replace(/[^a-zA-Z0-9]/g, '') + new Date().valueOf();
  },
  encrypto(value) {
    if (value && typeof value === 'string') {
      return btoa(value);
    }
    return value;
  },
  decrypto(value) {
    if (value && typeof value === 'string') {
      return atob(value);
    }
    return null;
  },
  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },
  semanas: [
    { codigo: 1, dia: 'Domingo' },
    { codigo: 2, dia: 'Segunda-Feira' },
    { codigo: 3, dia: 'Terça-Feira' },
    { codigo: 4, dia: 'Quarta-Feira' },
    { codigo: 5, dia: 'Quinta-Feira' },
    { codigo: 6, dia: 'Sexta-Feira' },
    { codigo: 7, dia: 'Sabado' },
  ],
  operacao: [
    { codigo: 'D', descricao: 'Débito(-)' },
    { codigo: 'C', descricao: 'Crédito(+)' },
  ],
  tipoOperacao: [
    { tipo: 'TJ', descricao: 'TM-Jogos' },
    { tipo: 'TD', descricao: 'TM-Documentos' },
    { tipo: 'TF', descricao: 'TM-Op. Financeira' },
  ],
  tipoDocumentoTipo: [
    { codigo: 0, descricao: 'Boleto' },
    { codigo: 1, descricao: 'Guia' },
    { codigo: 2, descricao: 'Concecionária' },
    { codigo: 3, descricao: 'Carne' },
    { codigo: 4, descricao: 'Benefício' },
    { codigo: 999, descricao: 'Outros' },
  ],
  operacaoBancaria: [
    { tipo: 'D', descricao: 'Depósito', operacao: 'C' },
    { tipo: 'S', descricao: 'Saque', operacao: 'D' },
    { tipo: 'SBB', descricao: 'Saque BB', operacao: 'D' },
  ],
  async getGlobbedFiles(globPatterns, removeRoot) {
    // For context switching
    const _this = this;
    // URL paths regex
    // eslint-disable-next-line no-useless-escape
    const urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
    // The output array
    let output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
      globPatterns.forEach((globPattern) => {
        output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
      });
    } else if (_.isString(globPatterns)) {
      if (urlRegex.test(globPatterns)) {
        output.push(globPatterns);
      } else {
        glob(globPatterns, {
          sync: true,
        }, (_err, files) => {
          if (removeRoot) {
            files = files.map((file) => file.replace(removeRoot, ''));
          }
          output = _.union(output, files);
        });
      }
    }
    return output;
  },
};
