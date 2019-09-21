
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaTabela = new Schema({
  flow: {
    type: String,
    required: 'Flow required',
    enum: ['req', 'res'],
  },
  method: {
    type: String,
    required: 'Method required',
  },
  url: {
    type: String,
    required: 'URL required',
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  negocioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Negocio',
  },
  host: {
    type: String,
  },
  hostname: {
    type: String,
  },
  remoteAddress: {
    type: String,
  },
  remoteIp: {
    type: String,
  },
  protocol: {
    type: String,
  },
  httpVersion: {
    type: String,
  },
  connection: {
    type: String,
  },
  contentType: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  headers: {
    type: Schema.Types.Mixed,
  },
  params: {
    type: Schema.Types.Mixed,
  },
  query: {
    type: Schema.Types.Mixed,
  },
  body: {
    type: Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
SchemaTabela.index({ flow: 1 });
SchemaTabela.index({ method: 1 });
SchemaTabela.index({ url: 1 });
SchemaTabela.index({ usuarioId: 1 });
SchemaTabela.index({ negocioId: 1 });

module.exports = mongoose.model('HttpLog', SchemaTabela);
