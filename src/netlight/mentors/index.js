require('colors');
const inquirer = require('inquirer');
const getColleagues = require('../util/get-colleagues');
const mentors = require('./mentors');

const log = require('../../util/logger').create({ name: 'mentors' });
const run = async () => {
  log.empty();
  log.info('== MENTORS =='.bold);

  const colleagues = await getColleagues();

  log(`== ${colleagues.length} colleagues ==`.green.bold);
  const { office, sorting } = await inquirer.prompt([
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
      name: 'sorting',
      type: 'list',
      message: 'Choose sorting',
      default: 'level',
      choices: ['level', 'match'],
    },
  ]);

  return mentors(colleagues, { office, sorting });
};

module.exports = run;
