module.exports = (app) => {
  const paginaController = require('../controllers/pagina.controller');
  app.route('/pagina')
    .get(paginaController.list)
    .post(paginaController.create);

  app.route('/pagina/:id')
    .get(paginaController.get)
    .put(paginaController.update)
    .delete(paginaController.delete);

  app.route('/pagina/checkUpdateAll')
    .post(paginaController.checkUpdateAll);

  app.route('/paginaSistema')
    .get(paginaController.listSistema);

  app.route('/paginaAdmin')
    .get(paginaController.listAdmin);
};
