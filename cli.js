#!/usr/bin/env node

'use strict';

const minimist = require('minimist');
const setup = require('./src/setup');
const listConnections = require('./src/listConnections');

const argv = minimist(process.argv.slice(2));

if (argv._[0] === 'setup') {
  return setup(argv);
} else if (argv._[0] === 'list-connections') {
  return listConnections(argv);
}
