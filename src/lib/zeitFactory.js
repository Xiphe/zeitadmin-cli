'use strict';

const uuid = require('uuid');

module.exports = gitHubIssue => (user) => {
  const zeit = {
    _id: uuid.v1(),
    user: user.id,
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
