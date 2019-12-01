require('colors');

const { create } = require('../util/logger');
const inquirer = require('inquirer');
const log = create({ name: 'netlight' });

const mentors = require('./mentors');

const run = async () => {
  const netlightModules = {
    mentors: {
      description: 'List mentors in a specific Netlight office',
      script: mentors,
    },
  };
  log.empty();
  log.info('== NETLIGHT =='.bold);
  log('List available scripts');

  const { scriptName } = await inquirer.prompt([
    {
      name: 'scriptName',
      type: 'list',
      message: 'Choose your script',
      choices: Object.keys(netlightModules).map(
        name => `${name}: ${netlightModules[name].description}`,
      ),
    },
  ]);

  const script = netlightModules[scriptName.split(':')[0]].script;

  return script();
};

module.exports = run;
