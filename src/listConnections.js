'use strict';

const https = require('https');
const keytar = require('keytar');
const SERVICE_NAME = require('./SERVICE_NAME');
const Deferred = require('./Deferred');

const getToken = argv => () => {
  if (argv.token) {
    return argv.token;
  }

  return keytar.getPassword(`${SERVICE_NAME}.token`, 'local');
};

const listConnections = (token) => {
  const d = new Deferred();

  const options = {
    method: 'GET',
    hostname: 'uvc7c5o5ob.execute-api.eu-central-1.amazonaws.com',
    headers: {
      'user-agent': 'zeitadmin-cli',
      Authorization: token,
    },
    path: '/prod',
  };

  const req = https.request(options, (res) => {
    const statusCode = res.statusCode;

    if (statusCode !== 200) {
      return d.reject(new Error('Could not get connections'));
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    return res.on('end', () => {
      try {
        return d.resolve(JSON.parse(rawData).connections);
      } catch (err) {
        return d.reject(new Error('Zeitadmin connections response flawed'));
      }
    });
  });
  req.on('error', () => {
    d.reject(new Error('Error occured getting connections'));
  });
  req.end();

  return d.promise;
};

module.exports = (argv) => {
  Promise.resolve()
    .then(getToken(argv))
    .then((token) => {
      if (!token) {
        throw new Error('no auth token found, use --token or run setup');
      }
      return token;
    })
    .then(listConnections)
    .then((connections) => {
      const connectionStr = connections.sort((a, b) => {
        if (a.created > b.created) {
          return 1;
        } else if (b.created > a.created) {
          return -1;
        }
        return 0;
      }).map((connection) => {
        return `ID: ${connection.id} | created: ${new Date(connection.created)} | on: ${connection.userAgent}`;
      }).join('\n');

      console.log(connectionStr);
    })
    .catch((err) => {
      console.eror(`[ERR] ${err.message}`);
    });
};
