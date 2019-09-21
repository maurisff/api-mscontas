/* eslint-disable func-names */

const mongoose = require('mongoose');

const serverClosed = (server, db, exitProcess = 0) => {
  server.close(() => {
    console.log('Http server closed.');
    // boolean means [force], see in mongoose doc
    // insere log no mongoDB.
    db.connection.close(false, () => {
      console.log('MongoDb connection closed.');
      console.log(`process exit: ${exitProcess}`);
      process.exit(exitProcess);
    });
  });
};

module.exports = function (server) {
  process.on('SIGHUP', () => {
    console.log('SIGHUP happened!');
    serverClosed(server, mongoose, 129);
  });
  process.on('SIGINT', () => {
    console.log('SIGINT happened!');
    serverClosed(server, mongoose, 130);
  });
  process.on('SIGTERM', () => {
    console.log('SIGTERM happened!');
    serverClosed(server, mongoose, 143);
  });
};
