'use strict';

const inquirer = require('inquirer');

module.exports = (argv) => {
  if (argv._[0]) {
    return argv._[0];
  }
  return inquirer.prompt([{
    type: 'input',
    name: 'issue',
    message: 'Which GitHub issue do you plan to work on?',
  }]).then(answers => answers.issue);
};
