'use strict';

const pkg = require('../package.json');
const platform = require('platform');

module.exports = `${pkg.name}/${pkg.version} (${platform.description})`;
