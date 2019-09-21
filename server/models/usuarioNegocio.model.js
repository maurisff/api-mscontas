
const mongoose = require('mongoose');

const SchemaTabela = new mongoose.Schema({
  usuarioId: {
    required: 'usuario Required',
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  negocioId: {
    required: 'Negócio Required',
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Negocio',
  },
  ativo: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
SchemaTabela.index({ usuarioId: 1, negocioId: 1 }, { unique: true });
module.exports = mongoose.model('UsuarioNegocio', SchemaTabela);
