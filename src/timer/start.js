'use strict';

const getDB = require('../db');
const getRemoteDbUrl = require('../getRemoteDbUrl');
const observe = require('./observe');
const ZeitadminClient = require('zeitadmin-client');
const ms = require('ms');

module.exports = function start(argv) {
  const durationMs = /^\d+$/.test(argv.duration) ?
    parseInt(argv.duration, 10) : ms(argv.duration);

  Promise
    .resolve(getRemoteDbUrl(argv))
    .then(getDB(argv.dev ? '-dev' : '-prod'))
    .then((db) => {
      const zeitadminClient = new ZeitadminClient({ db });
      return zeitadminClient
        .start(argv._[0], { duration: durationMs })
        .then(() => observe({})(db));
    })
    .catch((err) => {
      console.error(`[ERR] ${err.message}`);
    });
};
