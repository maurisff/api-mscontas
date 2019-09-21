
const repository = require('../repositories/httpLog.repository');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line func-names
module.exports = async function (req, res) {
  if (process.env.HTTPLOG === 'true') {
    try {
      const data = {
        flow: 'req',
        method: req.originalMethod,
        url: req.originalUrl,
      };

      data.usuarioId = req.headers.usuarioId;
      data.negocioId = req.headers.negocioId;

      data.host = req.host;
      data.hostname = req.hostname;
      data.remoteAddress = req._remoteAddress;
      data.remoteIp = req.ip;
      data.protocol = req.protocol;
      data.httpVersion = req.httpVersion;
      data.connection = req.headers.connection;
      data.contentType = req.headers['content-Type'];
      data.userAgent = req.headers['user-agent'];
      if (req.headers) {
        data.headers = req.headers;
      }
      if (req.params) {
        data.params = req.params;
      }
      if (req.query) {
        data.query = req.query;
      }
      if (req.body) {
        data.body = req.body;
      }
      repository.create(data);
    } catch (error) {
      console.error('HttpLogProvider->Error: ', error);
    }
  }
};
