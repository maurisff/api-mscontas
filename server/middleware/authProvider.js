/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const jwt = require('jsonwebtoken');
const httpLogProvider = require('../middleware/httpLogProvider');
const ResponseInfor = require('../util/ResponseInfo');
const usuarioRepo = require('../repositories/usuario.repository');
const negocioRepo = require('../repositories/negocio.repository');
const usuarioNegocioRepo = require('../repositories/usuarionegocio.repository');

module.exports = async function (req, res, next) {
  // res.setHeader('Access-Control-Allow-Origin', '*')
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  // res.setHeader('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Credentials', true);
  // check header or url parameters or post parameters for token
  const token = req.headers['x-access-token'];
  req.headers.negocioId = null;
  req.headers.usuarioId = null;
  console.log(`req.path: ${req.path}`);
  // retorna server online
  if (req.method === 'OPTIONS') {
    res.status(200).json(new ResponseInfor(true, `server only ${new Date().toJSON()}`));
  // TODO: Se for rotas de atutenticação ou publica não valida nada
  // } else if (global.App.ENUM.PUBLICPATHS.indexOf(req.path) > -1) {
  } else if (req.path === '/' || global.App.ENUM.PUBLICPATHS.find((el) => req.path.toString().toLowerCase().indexOf(el.toString().toLowerCase()) > -1)) {
    next();
  // TODO:Verifica comfiguração se precisa de autenticação e faz validaçãoe acesso.
  } else if (process.env.AUTENTICATION === 'true') {
    // decode token
    if (token) {
      // verifies secret and checks exp
      await jwt.verify(token, process.env.JWT_SECRETKEY, async (err, authUser) => {
        if (err) {
          res.status(401).json(new ResponseInfor(false, `invalid x-access-token. error: ${err}`));
        } else {
          const usuario = await usuarioRepo.get(authUser.usuario._id);
          const negocio = await negocioRepo.get(authUser.negocio._id);
          let usuarioNegocio = null;
          if (usuario && negocio) {
            usuarioNegocio = await usuarioNegocioRepo.getOne({ usuarioId: usuario._id, negocioId: negocio._id });
          }
          if (!usuario) {
            res.status(401).json(new ResponseInfor(false, 'Usuário não cadastradao'));
          } else if (!usuario.ativo) {
            res.status(401).json(new ResponseInfor(false, 'Usuario encontra-se bloqueado. Contate o administrador do sistema'));
          } else if (!negocio) {
            res.status(401).json(new ResponseInfor(false, `Negócio (${authUser.negocio.nome}) não cadastrado.`));
          } else if (!usuarioNegocio) {
            res.status(401).json(new ResponseInfor(false, `Usuário (${authUser.usuario.login}) não possui acesso ao Negócio (${authUser.negocio.nome}).`));
          } else if (!negocio.ativo) {
            res.status(401).json(new ResponseInfor(false, `Negócio (${authUser.negocio.nome}) encontra-se Bloqueado. Contate o administrador do sistema`));
          } else if (!usuarioNegocio.ativo) {
            res.status(401).json(new ResponseInfor(false, `O acesso do usuário (${authUser.usuario.login}) ao Negócio (${authUser.negocio.nome}), encontra-se bloqueado. Contate o proprietario do Negócio.`));
          } else {
            req.headers.negocioId = negocio._id;
            req.headers.usuarioId = usuario._id;
            next();
          }
        }
      });
    } else {
      res.status(401).json(new ResponseInfor(false, 'No "x-access-token" provided.'));
    }
  } else {
    next();
  }
  httpLogProvider(req, res);
};
