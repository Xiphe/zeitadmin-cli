#!/usr/bin/env node

'use strict';

const minimist = require('minimist');
const setup = require('./src/setup');
const listConnections = require('./src/listConnections');
const observe = require('./src/observe');
const startTimer = require('./src/timer/start');

const argv = minimist(process.argv.slice(2), {
  alias: {
    'remote-db': 'remoteDB',
  },
});

if (argv._[0] === 'setup') {
  return setup(argv);
} else if (argv._[0] === 'list-connections') {
  return listConnections(argv);
} else if (argv._[0] === 'observe') {
  return observe(argv);
}

startTimer(argv);
