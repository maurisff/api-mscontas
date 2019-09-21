const repository = require('../repositories/pessoa.repository');
const ResponseInfor = require('../util/ResponseInfo');

const model = 'Pessoa';

exports.create = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfor(false, `Objeto (${model}) não foi informado!`));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, `Objeto (${model}) não é um objeto validado`));
    } else {
      const obj = { negocioId: req.headers.negocioId, ...req.body };
      const data = await repository.create(obj);
      res.status(200).json(new ResponseInfor(true, data));
    }
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, `Id do Objeto (${model}) não foi informado.`));
    } else if (!req.body) {
      res.status(200).json(new ResponseInfor(false, `Objeto (${model}) não foi informado.`));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, `Objeto (${model}) não é um objeto validado`));
    } else {
      const obj = { negocioId: req.headers.negocioId, ...req.body };
      const data = await repository.update(req.params.id, obj);
      if (data) {
        res.status(200).json(new ResponseInfor(true, data));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto (${model}), id (${req.params.id}) não encontrato ou não atualizado.`));
      }
    }
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, `Id do Objeto (${model}) não foi informado.`));
    } else {
      await repository.delete(req.params.id);
      res.status(200).json(new ResponseInfor(true, `Objeto (${model}), id (${req.params.id}) Excluido com sucesso.`));
    }
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.get = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, `Id do Objeto (${model}) não foi informado.`));
    } else {
      const data = await repository.get(req.params.id);
      if (data) {
        res.status(200).json(new ResponseInfor(true, data));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto (${model}), id (${req.params.id}) não encontrato`));
      }
    }
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.list = async (req, res) => {
  try {
    const filter = { negocioId: req.headers.negocioId, ...req.query };
    const data = await repository.listarByFilter(filter);
    res.status(200).json(new ResponseInfor(true, data));
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};
