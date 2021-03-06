require('colors');
const inquirer = require('inquirer');
const getColleagues = require('../helpers/get-colleagues');
const mentors = require('./mentors');

const log = require('../../util/logger').create({ name: 'mentors' });

const run = async () => {
  log.empty();

  log.info('Fetching all colleagues...');

  const colleagues = await getColleagues();
  log.debug(`>> Found colleagues ${colleagues.length}`);

  const { office, method } = await inquirer.prompt([
    {
      name: 'office',
      type: 'list',
      message: 'Choose office',
      choices: [
        'berlin',
        'stockholm',
        'helsinki',
        'hamburg',
        'oslo',
        'munich',
        'copenhagen',
        'frankfurt',
        'zurich',
      ],
    },
    {
      name: 'method',
      type: 'list',
      message: "Choose what method you'd like to run",
      default: 'level',
      choices: [
        'local-mentors',
        'local-mentors-markdown',
        'mentors',
        'mentors-markdown',
        'mentors-by-office',
        'mentor-emails',
        'mentees',
      ],
    },
  ]);

  return mentors(colleagues, { office, method });
};

module.exports = run;
