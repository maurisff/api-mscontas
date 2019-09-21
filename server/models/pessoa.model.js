
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaTabela = new Schema({
  negocioId: {
    required: 'Negocio Required',
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Negocio',
  },
  nome: {
    type: String,
    required: 'Nome é obrigatório',
  },
  cpfcnpj: {
    type: String,
  },
  razaosocial: {
    type: String,
  },
  telefone: {
    type: String,
  },
  endereco: {
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
  },
  outrosEnderecos: [{
    tipo: String,
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});
SchemaTabela.index({ nome: 1 });
module.exports = mongoose.model('Pessoa', SchemaTabela);
