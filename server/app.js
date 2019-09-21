/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
require('./helper/prototypes');

global.App = {};
global.App.ENUM = require('./config/enum');
global.util = require('./util/Utils');
global.App.config = require('./config/config');
global.App.dbConfig = require('./config/dbConfig');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { readdirSync } = require('fs');
const inicializedDataBase = require('./helper/inicializedDataBase');

// import Model Schemas Mongoose
readdirSync(path.join(__dirname, './models')).forEach((fileName) => {
  const fullPath = path.join(__dirname, './models', fileName);
  // console.log('===========>require model: ', fullPath)
  require(fullPath);
});

const app = express();

app.set('appEnv', process.env);
// mongoose instance connection url connection
if (process.env.MONGO_DB) {
  mongoose.Promise = global.Promise;
  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
  }
  mongoose.set('useCreateIndex', true);
  mongoose.connect(process.env.MONGO_DB, global.App.dbConfig)
    .then(() => {
      console.log('Banco de dados conectado!');
      inicializedDataBase.start();
    }).catch((err) => {
      console.log(`Erro conexão DB: ${err}`);
    });
}

// body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());
// secure apps by setting various HTTP headers
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// use morgan to log requests to the console
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
// routes
const api = require('./routes');

app.use('/api', api);

if (process.env.NODE_ENV !== 'production') {
  const routs = api.stack || [];
  // eslint-disable-next-line no-use-before-define
  processDocs(app, routs);
}


module.exports = app;

async function processDocs(router, layers) {
  const docs = [];
  await global.util.asyncForEach(layers, async (layer) => {
    if (layer.route && layer.route.path && layer.route.path !== '*') {
      if (layer.route.methods) {
        await Object.keys(layer.route.methods).forEach(async (mt) => {
          docs.push({ path: `api${layer.route.path}`, method: mt });
        });
      } else {
        docs.push({ path: `api${layer.route.path}`, method: 'get' });
      }
    }
  });
  router.get('/doc', (req, res) => {
    res.json(docs);
  });
}
