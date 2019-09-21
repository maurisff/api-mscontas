module.exports = (app) => {
  const controller = require('../controllers/httpLog.controller');
  app.route('/httplogprovider/list')
    .get(controller.list);
};
