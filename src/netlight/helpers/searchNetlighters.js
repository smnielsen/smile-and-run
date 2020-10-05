const inquirer = require('inquirer');
const log = require('../../util/logger').create({ name: 'netlighters' });

const searchNetlighters = async netlighters => {
  const firstNlerProperties = Object.keys(netlighters[0]);
  const { key, searchValue } = await inquirer.prompt([
    {
      name: 'key',
      type: 'list',
      message: 'Choose Key to search on',
      default: 'all',
      choices: ['all', ...firstNlerProperties],
    },
    {
      name: 'searchValue',
      type: 'input',
      message: 'Search for',
    },
  ]);

  if (searchValue === '') {
    log.warn('Searching for empty string is not allowed');
    return [];
  }

  log.info(`
  Key = "${key}".
  Search value: "${searchValue}"`);

  const results = netlighters.filter(nl => {
    if (key !== 'all') {
      let nlVal = nl[key];
      if (key === 'phoneNumber') {
        nlVal = nlVal.replace(/ /g, '');
      }
      return nlVal.search(searchValue) !== -1;
    }
    // TODO: Loop through
    return false;
  });

  console.log('Result: ', results);
};

module.exports = searchNetlighters;
