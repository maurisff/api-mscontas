
module.exports = (app) => {
  const usuarioController = require('../controllers/usuario.controller');
  app.route('/usuario')
    .get(usuarioController.list)
    .post(usuarioController.create);

  app.route('/usuario/:id')
    .get(usuarioController.get)
    .put(usuarioController.update)
    .delete(usuarioController.delete);

  app.route('/usuario/validasenha')
    .post(usuarioController.validaSenha);

  app.route('/usuario/atualizasenha')
    .post(usuarioController.atualizaSenha);
};
