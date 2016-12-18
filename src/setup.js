'use strict';

const inquirer = require('inquirer');
const GitHubApi = require('github');
const https = require('https');
const keytar = require('keytar');
const Deferred = require('./Deferred');
const userAgent = require('./userAgent');

const SERVICE_NAME = require('./SERVICE_NAME');

const github = new GitHubApi({
  version: '3.0.0',
});

function createToken(twoFactor, callback) {
  const headers = {
    'user-agent': userAgent,
  };

  if (twoFactor) {
    headers['X-GitHub-OTP'] = twoFactor;
  }

  github.authorization.create({
    scopes: ['public_repo', 'repo'],
    note: `zeitadmin-cli-${new Date().getTime().toString(36)}`,
    note_url: 'https://github.com/Xiphe/zeitadmin-cli',
    headers,
  }, callback);
}

const needTwoFactor = (err) => {
  return err.code === 401 &&
    err.message && /Must specify two-factor authentication/.test(err.message);
};

const setupToken = () => {
  return inquirer.prompt([{
    type: 'input',
    name: 'username',
    message: 'Welcome to Zeitadmin! - Let\'s connect to your GitHub account.\nWhat is your username on GitHub?',
  }, {
    type: 'password',
    name: 'password',
    message: 'Please enter your GitHub Password: (wont be stored)',
  }]).then((answers) => {
    const d = new Deferred();

    github.authenticate({
      type: 'basic',
      username: answers.username,
      password: answers.password,
    });

    createToken(null, (err, res) => {
      if (err && needTwoFactor(err)) {
        inquirer.prompt([{
          type: 'input',
          name: 'twoFactor',
          message: 'Please enter two-factor authentication code:',
        }]).then((twoFactorAnswer) => {
          createToken(twoFactorAnswer.twoFactor, (err2, res2) => {
            if (err2) {
              d.reject(new Error('authentication failed'));
            } else {
              d.resolve(res2.token);
            }
          });
        });
      } else if (err) {
        d.reject(new Error('authentication failed'));
      } else {
        d.resolve(res.token);
      }
    });

    return d.promise;
  });
};

const getToken = argv => () => {
  const d = new Deferred();

  if (argv.token) {
    d.resolve(argv.token);
  } else {
    return setupToken();
  }

  return d.promise;
};

const getZeitadminConnection = (token) => {
  const d = new Deferred();

  const options = {
    method: 'POST',
    hostname: 'uvc7c5o5ob.execute-api.eu-central-1.amazonaws.com',
    headers: {
      'user-agent': userAgent,
      Authorization: token,
    },
    path: '/prod',
  };

  const req = https.request(options, (res) => {
    const statusCode = res.statusCode;

    if (statusCode !== 201) {
      return d.reject(new Error('Could not create zeitadmin connection'));
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    return res.on('end', () => {
      try {
        return d.resolve(JSON.parse(rawData));
      } catch (err) {
        return d.reject(new Error('Zeitadmin connection response flawed'));
      }
    });
  });
  req.on('error', () => {
    d.reject(new Error('Error occured establishing zeitadmin connection'));
  });
  req.end();

  return d.promise;
};

const storeToken = (token) => {
  try {
    keytar.replacePassword(`${SERVICE_NAME}.token`, 'local', token);
  } catch (e) { /* noop */ }

  return token;
};

const storeConnection = (connection) => {
  try {
    keytar.replacePassword(`${SERVICE_NAME}.connection`, 'local', JSON.stringify(connection));
  } catch (e) { /* noop */ }

  return connection;
};

module.exports = (argv) => {
  Promise.resolve()
    .then(getToken(argv))
    .then(storeToken)
    .then(getZeitadminConnection)
    .then(storeConnection)
    .then((connection) => {
      console.log('[OK]  All done!');
    })
    .catch((err) => {
      console.eror(`[ERR] ${err.message}`);
    });
};
