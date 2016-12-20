'use strict';

const GitHubApi = require('github');
const Deferred = require('../Deferred');

module.exports = token => (issue) => {
  const d = new Deferred();
  const github = new GitHubApi();

  github.authenticate({
    type: 'oauth',
    token,
  });

  github.issues.get(issue, (err, response) => {
    if (err) {
      try {
        d.reject(new Error(`Issue: ${JSON.parse(err.message).message}`));
      } catch (e) {
        d.reject(new Error('Issue: someting went wrong :('));
      }
      return;
    }

    d.resolve(Object.assign({}, response, issue));
  });

  return d.promise;
};
