/* eslint-disable global-require */

module.exports = (app) => {
  const controller = require('../controllers/authentication.controller');

  app.route('/authentication/auth')
    .post(controller.auth);
  app.route('/authentication/registration')
    .post(controller.registration);
  app.route('/authentication/onAuth')
    .get(controller.onAuth);
  app.route('/authentication/onAuth/:token')
    .get(controller.onAuth);
  app.route('/authentication/user/check')
    .post(controller.check);
  app.route('/authentication/user/list')
    .get(controller.users);
  app.route('/authentication/user/find/:login')
    .get(controller.find);
};
