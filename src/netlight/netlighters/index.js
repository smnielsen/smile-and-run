require('colors');
const inquirer = require('inquirer');
const getColleagues = require('../helpers/get-colleagues');
const mentors = require('./netlighters');

const log = require('../../util/logger').create({ name: 'netlighters' });

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
        'all',
      ],
    },
    {
      name: 'method',
      type: 'list',
      message: "Choose what method you'd like to run",
      default: 'search',
      choices: ['search', 'laf-list', 'by-doing', 'sss'],
    },
  ]);

  return mentors(colleagues, { office, method });
};

module.exports = run;
