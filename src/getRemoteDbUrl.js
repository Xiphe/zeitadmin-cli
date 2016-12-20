'use strict';

const keytar = require('keytar');
const SERVICE_NAME = require('./SERVICE_NAME');

function getRemoteDbFromConnection() {
  const connection = keytar.getPassword(`${SERVICE_NAME}.connection`, 'local');

  if (connection) {
    return JSON.parse(connection).remoteDb;
  }

  return undefined;
}


module.exports = (options) => {
  return options.remoteDB || getRemoteDbFromConnection();
};
