#!/usr/bin/env node
// @ts-check
require('colors');
const fsLegacy = require('fs');
const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');
const config = require('./src/config');
const log = require('./src/util/logger');

/**
 * @typedef {{ name: string, description: string, script?: function, scripts?: ScriptConfig[] }} ScriptConfig
 */
/**
 *
 * @param {ScriptConfig[]} scripts
 * @param {Function} next
 */
const promptScripts = async (scripts, next) => {
  log.info('List available scripts');

  if (!fsLegacy.existsSync(config.outputDir)) {
    log.info(`Creating cache dir ${config.outputDir}`);
    fsLegacy.mkdirSync(config.outputDir);
  }

  const { scriptKey } = await inquirer.prompt([
    {
      name: 'scriptKey',
      type: 'list',
      message: 'Choose script',
      choices: scripts.map(
        ({ name, description }) => `${name}: ${description}`,
      ),
    },
  ]);
  const scriptName = scriptKey.split(':')[0].toLowerCase();
  const nextScriptConfig = scripts.find(
    ({ name }) => name.toLowerCase() === scriptName,
  );

  return next(nextScriptConfig);
};

/**
 * @param {ScriptConfig} param0
 */
const runScript = async ({ name, description, script, scripts }) => {
  log.empty();

  // First check if a script exists
  if (script) {
    log.info(`${name.toUpperCase()}`.bold);
    log.ok(`>> ${description}`);
    return script();
  }

  if (scripts) {
    log.info(`== ${name.toUpperCase()} ==`.bold);
    log.info(`>> ${description}`);
    return promptScripts(scripts, runScript);
  }

  log.warn(`Nothing left to run...`);
};

const run = async () => {
  const files = await fs.readdir(path.resolve(__dirname, 'packages'));

  const scripts = files.reduce((memo, filename) => {
    const script = require(path.resolve(__dirname, 'packages', filename));

    return [...memo, script];
  }, []);

  return runScript({
    name: 'Smile and Run',
    description: 'Scripts to help out',
    scripts,
  });
};

run()
  .then(() => {
    log.ok('== ENDED SUCCESSFULLY :) ==');
    process.exit();
  })
  .catch(err => {
    log.error(`Script error: ${err.message.bold}`.red, err);
    process.exit();
  });
