
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaTabela = new Schema({
  nome: {
    type: String,
    required: 'nome é obrigatório',
    uppercase: true,
    trim: true,
  },
  endereco: {
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    municipio: String,
    estado: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  ativo: {
    type: Boolean,
    default: true,
  },
});
module.exports = mongoose.model('Negocio', SchemaTabela);
