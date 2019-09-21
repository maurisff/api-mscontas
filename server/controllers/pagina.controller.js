/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */

const paginaRepo = require('../repositories/pagina.repository');
const ResponseInfor = require('../util/ResponseInfo');


async function isEquivalent(objRouter, objPagina) {
  const propsIgnore = ['_id', 'updatedAt', 'createdAt'];
  // Create arrays of property names
  const objRouterProps = Object.keys(objRouter); // Object.getOwnPropertyNames(objRouter)
  const objPaginaProps = Object.keys(objPagina); // Object.getOwnPropertyNames(objPagina)

  // console.log('props.pagina: ', objPaginaProps)
  // console.log('props.router: ', objRouterProps)
  // If number of properties is different,
  // objects are not equivalent
  if (objRouterProps.length !== (objPaginaProps.length - 3)) {
    return false;
  }

  for (let i = 0; i < objPaginaProps.length; i++) {
    const propName = objPaginaProps[i];
    // console.log('prop(' + propName + '): ', objRouter[propName], objPagina[propName])
    if (propsIgnore.indexOf(propName) === -1) {
      if (Array.isArray(objPagina[propName])) {
        if (objRouter[propName].length !== objPagina[propName].length) {
          return false;
        }
        for (let j = 0; j < objPagina[propName].length; j++) {
          if (objRouter[propName][j] !== objPagina[propName][j]) {
            return false;
          }
        }
      } else if (objRouter[propName] !== objPagina[propName]) {
        return false;
      }
    }
    if (i + 1 === objPaginaProps.length) {
      return true;
    }
  }
  return false;
}

exports.create = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (pagina) não foi informado!'));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (pagina) não é um objeto validado'));
    } else {
      const pagina = await paginaRepo.create(req.body);
      res.status(200).json(new ResponseInfor(true, pagina));
    }
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto (pagina) não foi informado.'));
    } else if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (pagina) não foi informado.'));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (pagina) não é um objeto validado'));
    } else {
      const pagina = await paginaRepo.update(req.params.id, req.body);
      if (pagina) {
        res.status(200).json(new ResponseInfor(true, pagina));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto (pagina), id (${req.params.id}) não encontrato ou não atualizado.`));
      }
    }
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.get = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto (pagina) não foi informado.'));
    } else {
      const pagina = await paginaRepo.get(req.params.id);
      if (pagina) {
        res.status(200).json(new ResponseInfor(true, pagina));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto (pagina), id (${req.params.id}) não encontrato`));
      }
    }
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto (pagina) não foi informado.'));
    } else {
      await paginaRepo.delete(req.params.id);
      res.status(200).json(new ResponseInfor(true, `Objeto (pagina), Id (${req.params.id}) Excluido com sucesso.`));
    }
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.list = async (req, res) => {
  try {
    let paginas = [];
    if (req.query && Object.keys(req.query).length > 0) {
      if (await paginaRepo.validFilter(req.query)) {
        paginas = await paginaRepo.listarByFilter(req.query);
      }
    } else {
      paginas = await paginaRepo.listarTodos();
    }
    res.status(200).json(new ResponseInfor(true, paginas));
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.listSistema = async (req, res) => {
  try {
    const paginas = await paginaRepo.listarByFilter({ isAdmin: false });
    res.status(200).json(new ResponseInfor(true, paginas));
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.listAdmin = async (req, res) => {
  try {
    const paginas = await paginaRepo.listarByFilter({ isAdmin: true });
    res.status(200).json(new ResponseInfor(true, paginas));
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};

exports.checkUpdateAll = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (paginas) não foi informado.'));
    } else if (!Array.isArray(req.body)) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (paginas) não é um Array valido'));
    } else {
      await processPaginas(req.body).then((result) => {
        res.status(200).json(new ResponseInfor(result));
      }).catch((err) => {
        res.status(200).json(new ResponseInfor(false, `Na Lista de paginas, existe elementos ocom erros:\n ${err}`));
      });
    }
  } catch (error) {
    // console.log(error)
    res.status(400).json(new ResponseInfor(false, error));
  }
};

async function processPaginas(routers) {
  const erros = [];
  await global.util.asyncForEach(routers, async (pagina) => {
    if (pagina.path === undefined) {
      // console.log('pagina: ', pagina)
      erros.push(`Objeto da lista invalido. Ojeto (${JSON.stringify(pagina)})`);
    } else if (pagina.path !== '*' && pagina.meta && pagina.meta.isMenu) {
      const result = await checkOrUpdatePagina(pagina);
      if (result !== 'ok') {
        erros.push(`erro ao atualizar Pagina (${pagina.path}): ${result}`);
      }
    }
  });

  if (erros && erros.length > 0) {
    return Promise.reject(erros.join('\n'));
  }
  return Promise.resolve(true);


  /*
  for (let i = 0; i < routers.length; i++) {
    const pagina = routers[i]
    if (pagina.path === undefined) {
      // console.log('pagina: ', pagina)
      erros.push('Objeto da lista invalido. Ojeto (' + JSON.stringify(pagina) + ')')
    } else {
      if (pagina.path !== '*' && pagina.meta && pagina.meta.isMenu) {
        var result = await checkOrUpdatePagina(pagina)
        if (result !== 'ok') {
          erros.push('erro ao atualizar Pagina (' + pagina.path + '): ' + result)
        }
      }
    }
    if (i + 1 === routers.length) {
      if (erros && erros.length > 0) {
        return Promise.reject(erros.join('\n'))
      } else {
        return Promise.resolve(true)
      }
    }
  }
  */
}

async function checkOrUpdatePagina(objRouter) {
  const objeto = await paginaFromObjRouter(objRouter);
  // console.log('pagina x router: ', objeto, objRouter)
  const paginas = await paginaRepo.listarByFilter({ url: objeto.url });
  if (paginas && paginas.length === 1) {
    // console.log('ja existe...')
    const p = paginas[0];
    if (!isEquivalent(objeto, p._doc)) {
      // console.log('Existe.diferente...')
      try {
        // console.log('existe.atualizar...: ', objeto, paginas[0])
        const update = await Object.assign(paginas[0], objeto);
        // console.log('existe.atualizado: ', update)
        update.updateAt = Date.now;
        // console.log('existe.atualizado.updated: ', update)
        const updated = await paginaRepo.update(paginas[0]._id, update);
        if (!updated) {
          return `pagina (${objeto.url}) não Atualizada.`;
        }
        return 'ok';
      } catch (error) {
        if (error.errors) {
          return error.message;
        }
        throw error;
      }
    } else {
      return 'ok';
    }
  } else if (paginas && paginas.length > 1) {
    return `Econtrada mais de um pagina para url: ${objeto.url}`;
  } else {
    try {
      const novo = await paginaRepo.create(objeto);
      if (!novo) {
        return `pagina (${objeto.url}) não Criada`;
      }
      return 'ok';
    } catch (error) {
      if (error.errors) {
        return error.message;
      }
      throw error;
    }
  }
}

async function paginaFromObjRouter(objRouter) {
  const pagina = {};
  if (objRouter.path) {
    pagina.url = objRouter.path;
  }
  if (objRouter.meta.codigo) {
    pagina.codigo = objRouter.meta.codigo;
  }
  if (objRouter.meta.title) {
    pagina.pagina = objRouter.meta.title;
  }
  if (objRouter.meta.MenuTitle) {
    pagina.modulo = objRouter.meta.MenuTitle;
  }
  if (objRouter.meta.isMenu) {
    pagina.isMenu = objRouter.meta.isMenu;
  }
  if (objRouter.meta.requiresAdmin) {
    pagina.isAdmin = objRouter.meta.requiresAdmin;
  }
  if (objRouter.meta.pagePublic) {
    pagina.isPublic = objRouter.meta.pagePublic;
  }
  if (objRouter.meta.recursos) {
    pagina.recursos = objRouter.meta.recursos;
  }
  return pagina;
}
