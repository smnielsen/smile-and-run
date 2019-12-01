#!/usr/bin/env node
require('colors');
const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');
const log = require('./src/util/logger');

const run = async () => {
  const files = await fs.readdir(path.resolve(__dirname, 'packages'));

  const modules = files.reduce((memo, filename) => {
    memo[filename.replace('.js', '')] = require(path.resolve(
      __dirname,
      'packages',
      filename,
    ));
    return memo;
  }, {});

  log.info('== SMILE AND RUN =='.bold);
  log.info('List available scripts');

  const { scriptName } = await inquirer.prompt([
    {
      name: 'scriptName',
      type: 'list',
      message: 'Choose script',
      choices: Object.keys(modules).map(
        key => `${modules[key].name}: ${modules[key].description}`,
      ),
    },
  ]);

  const script = modules[scriptName.split(':')[0].toLowerCase()].script;

  return script();
};

run()
  .then(() => {
    log.success('== ENDED SUCCESSFULLY :) ==');
    process.exit();
  })
  .catch(err => {
    log.error(`Script error: ${err.message.bold}`.red);
    process.exit();
  });
