'use strict';

const getRemoteDbUrl = require('./getRemoteDbUrl');
const observe = require('./timer/observe');
const getDb = require('./db');

module.exports = (argv) => {
  const options = {};

  Promise
    .resolve(getRemoteDbUrl(argv))
    .then(getDb)
    .then(observe(options));
};
