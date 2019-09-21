
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaTabela = new Schema({
  login: {
    type: String,
    required: 'login é obrigatório',
    lowercase: true,
    trim: true,
  },
  senha: {
    type: String,
    required: 'senha Obrigatória',
  },
  nome: {
    type: String,
    required: 'Nome é Obrigatória',
  },
  verificado: {
    type: Boolean,
    default: false,
  },
  ativo: {
    type: Boolean,
    default: true,
  },
  alteraSenha: {
    type: Boolean,
    default: false,
  },
  acessos: {
    type: [String],
  },
  messagingToken: {
    type: [String],
  },
  admin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});
SchemaTabela.index({ login: 1 }, { unique: true });
SchemaTabela.index({ perfil: 1 });
module.exports = mongoose.model('Usuario', SchemaTabela);
