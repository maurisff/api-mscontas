require('dotenv').config();
require('./config/check-versions')();
const app = require('./app');

const port = process.env.PORT || process.env.API_PORT || 4001;

console.log('> Starting dev API server...');

const server = app.listen(port, () => {
  console.log('API Server escutando a porta: ', port);
});
const gracefulShutdown = require('./middleware/gracefulShutdown');

gracefulShutdown(server);
