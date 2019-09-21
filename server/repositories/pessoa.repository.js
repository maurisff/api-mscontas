
const mongoose = require('mongoose');

const Model = mongoose.model('Pessoa');

exports.create = async (data) => new Model(data).save();

exports.update = async (id, data) => Model.findOneAndUpdate({ _id: id }, data, { new: true });

exports.delete = async (id) => Model.remove({ _id: id });

exports.get = async (id) => Model.findById(id);

exports.getOne = async (filter) => Model.findOne(filter);

exports.listarTodos = async () => Model.find({});

exports.listarByFilter = async (filter) => Model.find(filter);

exports.selectByFilter = async (fields = null, filter = null) => Model.find((filter || {})).select((fields || {}));

exports.validFilter = async (filter) => {
  await Object.keys(filter).forEach(async (fl) => {
    if (await Object.keys(Model.schema.obj).indexOf(fl) === -1) {
      throw new Error(`Filtro (${fl}) inválido para consulta.`);
    }
  });
};
