
const MD5 = require('md5');
const jwt = require('jsonwebtoken');
const ResponseInfor = require('../util/ResponseInfo');
const processAllowedProps = require('../helper/processAllowedProps');
const usuarioRepo = require('../repositories/usuario.repository');
const negocioRepo = require('../repositories/negocio.repository');
const usuarioNegocioRepo = require('../repositories/usuarionegocio.repository');


const processAuth = async (usuario, negocio, token = null) => {
  let u = {};
  u = JSON.parse(JSON.stringify(usuario));
  u = await processAllowedProps.execute(u, global.App.config.allowedPropsAuth);
  let n = {};
  n = JSON.parse(JSON.stringify(negocio));
  n = await processAllowedProps.execute(n, global.App.config.allowedPropsAuth);
  const authUser = {};
  const data = {};
  authUser.usuario = u;
  authUser.negocio = n;
  data.usuario = authUser.usuario;
  data.negocio = authUser.negocio;
  data.acessos = [];
  data.token = token || await jwt.sign(JSON.stringify(authUser), process.env.JWT_SECRETKEY);
  return data;
};

exports.registration = async (req, res) => {
  // console.log('globalApp: ', global.App)
  // console.log('req.body: ', req.body)
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Dados de acesso não informados'));
    } else if (!req.body.usuario) {
      res.status(200).json(new ResponseInfor(false, 'Não informado usuario nos dados de acesso.'));
    } else if (!req.body.negocio) {
      res.status(200).json(new ResponseInfor(false, 'Não informado negocio nos dados de acesso.'));
    } else {
      let usuario = await usuarioRepo.get(req.body.usuario._id);
      if (!usuario) {
        const save = req.body.usuario;
        save.senha = MD5(save.senha);
        usuario = await usuarioRepo.create(save);
      }
      const negocio = await negocioRepo.create(req.body.negocio);
      await usuarioNegocioRepo.create({ usuarioId: usuario._id, negocioId: negocio._id, ativo: true });

      res.status(200).json(new ResponseInfor(true, 'OK'));
    }
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.check = async (req, res) => {
  // console.log('globalApp: ', global.App)
  // console.log('req.body: ', req.body)
  try {
    if (!req.body.login) {
      res.status(200).json(new ResponseInfor(false, 'login não informado.'));
    } else if (!req.body.senha) {
      res.status(200).json(new ResponseInfor(false, 'Senha não informada.'));
    } else {
      const usuario = await usuarioRepo.getOne({ login: req.body.login });
      if (!usuario) {
        res.status(200).json(new ResponseInfor(false, 'Usuário não cadastradao'));
      } else if (usuario.senha !== MD5(req.body.senha)) {
        res.status(200).json(new ResponseInfor(false, 'Senha do usuário não confere.'));
      } else if (!usuario.verificado) {
        res.status(200).json(new ResponseInfor(false, 'Conta do Usuario não verificada. Verifique seu email!'));
      } else if (!usuario.ativo) {
        res.status(200).json(new ResponseInfor(false, 'Usuario encontra-se bloqueado. Contate o administrador do sistema'));
      } else {
        res.status(200).json(new ResponseInfor(true, usuario));
      }
    }
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.auth = async (req, res) => {
  // console.log('globalApp: ', global.App)
  // console.log('req.body: ', req.body)
  try {
    if (!req.body.login) {
      res.status(200).json(new ResponseInfor(false, 'login não informado.'));
    } else if (!req.body.senha) {
      res.status(200).json(new ResponseInfor(false, 'Senha não informada.'));
    } else {
      const usuario = await usuarioRepo.getOne({ login: req.body.login });
      if (!usuario) {
        res.status(200).json(new ResponseInfor(false, 'Usuário não cadastradao'));
      } else if (usuario.senha !== MD5(req.body.senha)) {
        res.status(200).json(new ResponseInfor(false, 'Senha do usuário não confere.'));
      } else if (!usuario.verificado) {
        res.status(200).json(new ResponseInfor(false, 'Conta do Usuario não verificada. Verifique seu email!'));
      } else if (!usuario.ativo) {
        res.status(200).json(new ResponseInfor(false, 'Usuario encontra-se bloqueado. Contate o administrador do sistema'));
      } else if (!req.body.negocio) {
        const negocios = await usuarioNegocioRepo.listarByFilter({ usuarioId: usuario._id });
        if (negocios.length > 0) {
          res.status(200).json(new ResponseInfor(false, 'Selecione um Negócio para realizar o acesso!'));
        } else {
          res.status(200).json(new ResponseInfor(false, 'Ops! Algo de errado esta acontecendo, não foi possivel identificar o(s) Negócios em que o usuario está vinculado. Verifique os dados informado ou entre contato com Suporte!'));
        }
      } else {
        const negocio = await negocioRepo.get(req.body.negocio._id);
        let usuarioNegocio = null;
        if (usuario && negocio) {
          usuarioNegocio = await usuarioNegocioRepo.getOne({ usuarioId: usuario._id, negocioId: negocio._id });
        }
        if (!negocio) {
          res.status(200).json(new ResponseInfor(false, `Negocio (${req.body.negocio.nome}) não cadastrado.`));
        } else if (!usuarioNegocio) {
          res.status(200).json(new ResponseInfor(false, `Usuário (${req.body.login}) não possui acesso ao Negocio (${req.body.negocio.nome}).`));
        } else if (!negocio.ativo) {
          res.status(200).json(new ResponseInfor(false, `Negocio (${req.body.negocio.nome}) encontra-se Bloqueado. Contate o administrador do sistema`));
        } else if (!usuarioNegocio.ativo) {
          res.status(200).json(new ResponseInfor(false, `O acesso do usuário (${req.body.login}) ao Negocio (${req.body.negocio.nome}), encontra-se bloqueado. Contate o proprietario do negocio.`));
        } else {
          const data = await processAuth(usuario, negocio);
          res.status(200).json(new ResponseInfor(true, data));
        }
      }
    }
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.onAuth = async (req, res) => {
  try {
    const token = req.params.token || req.headers['x-access-token'];
    if (!token) {
      res.status(401).json(new ResponseInfor(false, 'token não informado'));
    } else {
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
          } else if (!usuario.verificado) {
            res.status(200).json(new ResponseInfor(false, 'Conta do Usuario não verificada. Verifique seu email!'));
          } else if (!negocio) {
            res.status(401).json(new ResponseInfor(false, `Negocio (${authUser.negocio.nome}) não cadastrado.`));
          } else if (!usuarioNegocio) {
            res.status(401).json(new ResponseInfor(false, `Usuário (${authUser.usuario.login}) não possui acesso ao Negocio (${authUser.negocio.nome}).`));
          } else if (!negocio.ativo) {
            res.status(401).json(new ResponseInfor(false, `Negocio (${authUser.negocio.nome}) encontra-se Bloqueado. Contate o administrador do sistema`));
          } else if (!usuarioNegocio.ativo) {
            res.status(401).json(new ResponseInfor(false, `O acesso do usuário (${authUser.usuario.login}) ao Negocio (${authUser.negocio.nome}), encontra-se bloqueado. Contate o proprietario do negocio.`));
          } else {
            const data = await processAuth(usuario, negocio, token);
            res.status(200).json(new ResponseInfor(true, data));
          }
        }
      });
    }
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, `Error: ${error}`));
  }
};

exports.users = async (req, res) => {
  try {
    const filter = req.query || {};
    const result = [];
    const usuarios = await usuarioRepo.selectByFilter({
      ativo: 3, login: 2, _id: 1,
    }, filter);
    await global.util.asyncForEach(usuarios, async (el) => {
      let ests = await usuarioNegocioRepo.negociosDoUsuario(el._id);
      ests = JSON.parse(JSON.stringify(ests));
      ests = ests.map((m) => ({
        _id: m.negocioId._id,
        nome: m.negocioId.nome,
        ativo: m.negocioId.ativo,
        acessoAtivo: m.ativo,
      }));
      result.push({
        login: el.login,
        ativo: el.ativo,
        acessos: ests,
      });
    });
    res.status(200).json(new ResponseInfor(true, result));
  } catch (error) {
    console.error(error);
    res.status(400).json(new ResponseInfor(false, `ERRO: ${error}`));
  }
};

exports.find = async (req, res) => {
  try {
    const usuarios = await usuarioRepo.selectByFilter({
      ativo: 3, login: 1, _id: -1,
    }, { login: req.params.login });
    let result = JSON.parse(JSON.stringify(usuarios));
    result = result.map((el) => ({
      login: el.login,
      ativo: el.ativo,
    }));
    res.status(200).json(new ResponseInfor(true, result));
  } catch (error) {
    console.error(error);
    res.status(400).json(new ResponseInfor(false, `ERRO: ${error}`));
  }
};
