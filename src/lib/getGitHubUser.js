'use strict';

const GitHubApi = require('github');
const Deferred = require('../Deferred');

module.exports = (token) => {
  const d = new Deferred();
  const github = new GitHubApi();

  github.authenticate({
    type: 'oauth',
    token,
  });

  github.users.get({}, (err, user) => {
    if (err) {
      try {
        d.reject(new Error(`User: ${JSON.parse(err.message).message}`));
      } catch (e) {
        d.reject(new Error('User: someting went wrong :('));
      }
      return;
    }

    d.resolve(user);
  });

  return d.promise;
};
