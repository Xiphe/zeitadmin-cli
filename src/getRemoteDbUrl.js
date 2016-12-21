'use strict';

const keytar = require('keytar');
const SERVICE_NAME = require('./SERVICE_NAME');

module.exports = (options) => {
  if (options.remoteDB) {
    return options.remoteDB;
  }

  if (options.dev) {
    return process.env.ZEITADMIN_DEV_DB_CONNECTION;
  }

  const connection = keytar.getPassword(`${SERVICE_NAME}.connection`, 'local');

  if (connection) {
    return JSON.parse(connection).remoteDb;
  }

  return undefined;
};
