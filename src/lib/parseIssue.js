'use strict';

function stripGithub(issue) {
  const match = issue.match(/github\.com\/(.*)/);

  if (match) {
    return match[1].split('?')[0].split('#')[0];
  }

  return issue;
}

function normalize(issue) {
  return issue.replace(/\/(issues|pull)\//, '#');
}

module.exports = function parseIssue(issue) {
  const tokens = normalize(stripGithub(issue)).split('/');
  const errStr = `Could not parse issue "${issue}", please use github url or owner/repo#1 formart`;

  if (tokens.length !== 2) {
    throw new Error(errStr);
  }

  const owner = tokens[0];
  const moreTokens = tokens[1].split('#');

  if (moreTokens.length !== 2) {
    throw new Error(errStr);
  }

  const repo = moreTokens[0];
  const number = moreTokens[1];

  return {
    owner,
    repo,
    number,
  };
};
