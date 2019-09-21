
const mongoose = require('mongoose');

const { Schema } = mongoose;

const PaginaSchema = new Schema({
  url: {
    type: String,
    required: 'url Required',
  },
  codigo: {
    type: String,
    uppercase: true,
    required: 'codigo Required',
  },
  pagina: {
    type: String,
    required: 'pagina Required',
  },
  modulo: {
    type: String,
    uppercase: true,
    default: 'GLOBAL',
  },
  recursos: {
    type: [String],
    uppercase: true,
  },
  isMenu: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
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
PaginaSchema.index({ url: 1 }, { unique: true });
PaginaSchema.index({ codigo: 1 }, { unique: true });
module.exports = mongoose.model('Pagina', PaginaSchema);
