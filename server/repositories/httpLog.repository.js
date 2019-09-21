
const mongoose = require('mongoose');

const Model = mongoose.model('HttpLog');

exports.create = async (data) => new Model(data).save();

exports.selectByFilter = async (fields = null, filter = null) => Model.find((filter || {})).select((fields || {}));

exports.validFilter = async (filter) => {
  await Object.keys(filter).forEach(async (fl) => {
    if (await Object.keys(Model.schema.obj).indexOf(fl) === -1) {
      throw new Error(`Filtro (${fl}) inválido para consulta.`);
    }
  });
};
