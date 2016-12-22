'use strict';

const uuid = require('uuid');

module.exports = gitHubIssue => () => {
  const zeit = {
    _id: uuid.v1(),
    issue: {
      title: gitHubIssue.title,
      url: gitHubIssue.html_url,
      owner: gitHubIssue.owner,
      repo: gitHubIssue.repo,
      number: gitHubIssue.number,
    },
  };

  return zeit;
};
