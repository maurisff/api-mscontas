/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const express = require('express');
const path = require('path');
const filterFiles = require('filter-files');
const isDir = require('is-directory');
const authProvider = require('../middleware/authProvider');

const router = express.Router();
// Validações de token e acesso as rotas
router.use(authProvider);
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => {
  res.json({ status: 'OK', dateTime: new Date().toJSON() });
});

const isRouteFile = (fileName) => /((router)|(route))\.js$/.test(fileName);

// eslint-disable-next-line no-unused-vars
const getRoutesFilesFromDirname = (dirname) => filterFiles.sync(dirname, (fp, dir, files, recurse) => {
  if (isRouteFile(fp)) {
    return true;
  }
  return isDir.sync(path.join(dir, fp));
}, true);
getRoutesFilesFromDirname(path.join(__dirname, './')).forEach((fileName) => {
  require(fileName)(router);
});
router.get('*', (req, res) => {
  res.status(400).json({
    message: 'API Not Found',
    method: req.originalMethod,
    endpoint: req.originalUrl,
  });
});
module.exports = router;
