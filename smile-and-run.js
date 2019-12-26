#!/usr/bin/env node
// @ts-check
require('colors');
const fsLegacy = require('fs');
const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');
// eslint-disable-next-line security/detect-child-process
const childProcess = require('child_process');
const config = require('./src/config');
const log = require('./src/util/logger');

/**
 * @typedef {{ name: string, description: string, type: string, script?: any, scripts?: ScriptConfig[] }} ScriptConfig
 */
/**
 *
 * @param {ScriptConfig[]} scripts
 * @param {Function} next
 */
const promptScripts = async (scripts, next) => {
  log.debug('List available scripts');

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
const runScript = async ({ name, description, type, script, scripts }) => {
  // First check if a script exists
  if (script) {
    switch (type) {
      case 'sh': {
        childProcess.execSync(`sh ${path.resolve(__dirname, script)}`);
        return;
      }
      default:
        return script();
    }
  }

  if (scripts) {
    return promptScripts(scripts, runScript);
  }

  log.warn(`Nothing left to run...`);
};

const run = async () => {
  const files = await fs.readdir(path.resolve(__dirname, 'packages'));

  const scripts = files.reduce((memo, filename) => {
    // eslint-disable-next-line security/detect-non-literal-require
    const script = require(path.resolve(__dirname, 'packages', filename));

    return [...memo, script];
  }, []);

  log.info(`>> SMILE-AND-RUN`);
  log.info(`>> Scripts to help Simon`);
  return runScript({
    name: 'Root',
    description: 'Choose which package to use',
    type: 'node',
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
