
module.exports = (app) => {
  const controller = require('../controllers/pessoa.controller');
  app.route('/pessoa')
    .get(controller.list)
    .post(controller.create);

  app.route('/pessoa/:id')
    .get(controller.get)
    .put(controller.update)
    .delete(controller.delete);
};
