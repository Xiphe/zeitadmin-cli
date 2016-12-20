'use strict';

const parseIssue = require('./parseIssue');
const getIssueFromGitHub = require('./getIssueFromGitHub');
const getGitHubUser = require('./getGitHubUser');
const spreadFn = require('./spreadFn');
const zeitFactory = require('./zeitFactory');

module.exports = options => (soneIssue) => {
  if (!options.token) {
    throw new Error('missing token');
  }

  const issue = parseIssue(soneIssue);
  const gitHubIssuePromise = Promise.resolve(issue)
    .then(getIssueFromGitHub(options.token));
  const userPromise = Promise.resolve(options.token)
    .then(getGitHubUser);

  return Promise.all([
    gitHubIssuePromise,
    userPromise,
  ]).then(spreadFn(zeitFactory));
};
