'use strict';

const keytar = require('keytar');
const createZeit = require('../lib/createZeit');
const startZeit = require('../lib/startZeit');
const getIssue = require('./getIssue');
const getDB = require('../db');
const spreadFn = require('../lib/spreadFn');
const SERVICE_NAME = require('../SERVICE_NAME');
const getRemoteDbUrl = require('../getRemoteDbUrl');
const observe = require('./observe');

module.exports = function start(argv) {
  const token = argv.token || keytar.getPassword(`${SERVICE_NAME}.token`, 'local');

  const options = {
    token,
    duration: argv.duration,
  };

  const dbPromise = Promise
    .resolve(getRemoteDbUrl(argv))
    .then(getDB(argv.dev ? '-dev' : '-prod'));

  const zeitPromise = Promise
    .resolve(argv)
    .then(getIssue)
    .then(createZeit(options));

  Promise
    .all([
      dbPromise,
      zeitPromise,
    ])
    .then(spreadFn(db => (rawZeit) => {
      return startZeit(options)(db)(rawZeit)
        .then(() => observe(options)(db));
    }))
    .catch((err) => {
      console.error(`[ERR] ${err.message}`);
    });
};
