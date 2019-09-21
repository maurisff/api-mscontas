/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

const MD5 = require('md5');
const usuarioRepo = require('../repositories/usuario.repository');
const ResponseInfor = require('../util/ResponseInfo');
const processAllowedProps = require('../helper/processAllowedProps');


async function processErro(erro) {
  if (erro.name === 'MongoError') {
    return new ResponseInfor(false, erro.errmsg);
  }
  return new ResponseInfor(false, erro);
}

async function encrytPasswordUsuario(usuario, id = null) {
  if (usuario.senha) {
    const userId = id || usuario._id;
    const aux = await usuarioRepo.get(userId);
    if (!aux || aux.senha !== usuario.senha) {
      usuario.senha = MD5(usuario.senha);
    }
  }
  return usuario;
}

exports.create = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (Usuario) não foi informado!'));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (Usuario) não é um objeto validado'));
    } else {
      let usuario = await usuarioRepo.create(await encrytPasswordUsuario(req.body));
      console.log('ctrl.usuario.created: ', usuario);
      usuario = await processAllowedProps.execute(JSON.parse(JSON.stringify(usuario)), global.App.config.allowedPropsAuth);
      console.log('ctrl.usuario.created2: ', usuario);
      res.status(200).json(new ResponseInfor(true, usuario));
    }
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto (Usuario) não foi informado.'));
    } else if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (Usuario) não foi informado.'));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (Usuario) não é um objeto validado'));
    } else {
      let usuario = await usuarioRepo.update(req.params.id, await encrytPasswordUsuario(req.body, req.params.id));
      if (usuario) {
        usuario = await processAllowedProps.execute(JSON.parse(JSON.stringify(usuario)), global.App.config.allowedPropsAuth);
        res.status(200).json(new ResponseInfor(true, usuario));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto (Usuario), id (${req.params.id}) não encontrato ou não atualizado.`));
      }
    }
  } catch (error) {
    console.error('usuario.controller.update: ', error);
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.get = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto (Usuario) não foi informado.'));
    } else {
      let usuario = await usuarioRepo.get(req.params.id);
      if (usuario) {
        usuario = await processAllowedProps.execute(JSON.parse(JSON.stringify(usuario)), global.App.config.allowedPropsAuth);
        res.status(200).json(new ResponseInfor(true, usuario));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto (Usuario), id (${req.params.id}) não encontrato`));
      }
    }
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto (Usuario) não foi informado.'));
    } else {
      await usuarioRepo.delete(req.params.id);
      res.status(200).json(new ResponseInfor(true, `Objeto (Usuario), Id (${req.params.id}) Excluido com sucesso.`));
    }
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.list = async (req, res) => {
  try {
    let usuarios = [];
    if (req.query && Object.keys(req.query).length > 0) {
      usuarios = await usuarioRepo.listarByFilter(req.query);
    } else {
      usuarios = await usuarioRepo.listarTodos();
    }
    usuarios = await processAllowedProps.execute(JSON.parse(JSON.stringify(usuarios)), global.App.config.allowedPropsAuth);
    res.status(200).json(new ResponseInfor(true, usuarios));
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};
exports.validaSenha = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(false);
    } else {
      const usuario = await usuarioRepo.get(req.body.usuarioId);
      if (usuario && usuario.senha === MD5(req.body.senha)) {
        res.status(200).json(true);
      } else {
        res.status(200).json(false);
      }
    }
  } catch (error) {
    console.error('usuario.controller.validaSenha: ', error);
    res.status(200).json(false);
  }
};
exports.atualizaSenha = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Dados para atualização da senha não encontratos'));
    } else if (!req.body.senha) {
      res.status(200).json(new ResponseInfor(false, 'Senha não informada!'));
    } else {
      const usuario = await usuarioRepo.get(req.body.usuarioId);
      if (!usuario) {
        res.status(200).json(new ResponseInfor(false, `Usuario Não encontrato para o ID (${req.body.usuarioId})`));
      } else {
        const updated = await usuarioRepo.update(usuario._id, { senha: MD5(req.body.senha), alteraSenha: false });
        if (updated) {
          res.status(200).json(new ResponseInfor(true, ''));
        } else {
          res.status(200).json(new ResponseInfor(false, 'Usuario com ID () não atualizado. Contrate o administrador do sistema.'));
        }
      }
    }
  } catch (error) {
    console.error('usuario.controller.atualizaSenha: ', error);
    res.status(200).json(new ResponseInfor(false, error));
  }
};
