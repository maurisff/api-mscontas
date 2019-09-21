/* eslint-disable no-extend-native */

const moment = require('moment');
const numeral = require('numeral');

// load a locale
numeral.register('locale', 'pt-br', {
  delimiters: {
    thousands: '.',
    decimal: ',',
  },
  abbreviations: {
    thousand: 'k',
    million: 'm',
    billion: 'b',
    trillion: 't',
  },
  ordinal(number) {
    return number === 1 ? 'er' : 'ème';
  },
  currency: {
    symbol: 'R$',
  },
});

// switch between locales
numeral.locale('pt-br');

// TODO: String -----------------------------------------------------------------------------------
String.prototype.retornaNumeros = function () {
  return (isNaN(this.valueOf().replace(/[^\d.,-]/g, '').replace(/\./gi, '').replace(/\,/gi, '.')) ? 0 : Number(this.valueOf().replace(/[^\d.,-]/g, '').replace(/\./gi, '').replace(/\,/gi, '.')));
};
String.prototype.cPad = function (targetLength, padString = ' ') {
  if (typeof targetLength !== 'number') {
    throw new Error('cPad - targetLength invalid numer');
  }
  const value = this.valueOf().substring(0, targetLength) || '';
  let init = (targetLength - value.length) / 2;
  init = Math.floor((init < 0 ? -init : init));
  return padString.substring(0, init).padStart(init, padString) + value.padEnd((targetLength - init), padString);
};
String.prototype.lPad = function (targetLength, padString = ' ') {
  if (typeof targetLength !== 'number') {
    throw new Error('lPad - targetLength invalid numer');
  }
  return this.valueOf().substring(0, targetLength).padStart(targetLength, padString);
};
String.prototype.rPad = function (targetLength, padString = ' ') {
  if (typeof targetLength !== 'number') {
    throw new Error('rPad - targetLength invalid numer');
  }
  return this.valueOf().substring(0, targetLength).padEnd(targetLength, padString);
};

// TODO: Number -----------------------------------------------------------------------------------
Number.prototype.toStringPrice = function (decinal = 2) {
  const val = (this.valueOf() / 1).toFixed(decinal).replace('.', ',');
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
Number.prototype.toFormatt = function (mask) {
  return (this.valueOf() && mask ? numeral(this.valueOf()).format(mask).toString() : '');
};
// TODO: Date -----------------------------------------------------------------------------------
Date.prototype.trunc = function () {
  return new Date(new Date(this.valueOf()).setHours(0, 0, 0, 0));
};
Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};
Date.prototype.toStrDateVue = function () {
  const date = new Date(this.valueOf());
  return date.toISOString().split('T')[0];
};
Date.prototype.toStringFormatt = function (mask) {
  const date = new Date(this.valueOf());
  if (mask) {
    return moment(date).format(mask);
  }
  return date.toISOString();
};

// TODO: Array -----------------------------------------------------------------------------------
Array.prototype.arraySumProperty = function (property) {
  const array = this.valueOf();
  if (array && Array.isArray(array) && array.length > 0 && property) {
    return array.map((ar) => ar[property].toString().retornaNumeros()).reduce((a, b) => a + b, 0);
  }
  return 0;
};
