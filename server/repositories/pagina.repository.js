
const mongoose = require('mongoose');

const Pagina = mongoose.model('Pagina');

exports.create = async (data) => new Pagina(data).save();

exports.update = async (id, data) => Pagina.findOneAndUpdate({ _id: id }, data, { new: true });

exports.delete = async (id) => {
  await Pagina.remove({ _id: id }, (err) => {
    throw err;
  });
};

exports.get = async (id) => Pagina.findById(id, (err, pagina) => {
  if (err) throw err;
  return pagina;
});

exports.listarTodos = async () => Pagina.find({}, (err, paginas) => {
  if (err) throw err;
  return paginas;
});

exports.listarByFilter = async (filter) => Pagina.find(filter, (err, paginas) => {
  if (err) throw err;
  return paginas;
});

exports.validFilter = async (filter) => {
  // var r = Object.keys(filter)
  // console.log(r)
  await Object.keys(filter).forEach(async (fl) => {
    // var t = Object.keys(Pagina.schema.obj)
    // console.log(t)
    if (await Object.keys(Pagina.schema.obj).indexOf(fl) === -1) {
      throw new Error(`Filtro (${fl}) inválido para consulta.`);
    }
  });
};

function Erro(error) {
  this.erro = error;
}
Erro.prototype = new Error();
Erro.prototype.name = 'Erro';
