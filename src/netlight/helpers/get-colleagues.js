const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const inquirer = require('inquirer');
const getCookieAuth = require('./get-cookie-auth');
const log = require('../../util/logger').create({ name: 'colleagues' });
const config = require('../../config');

const createCache = async () => {
  const filepath = path.resolve(config.outputDir, `input-mentors.json`);

  const getCache = async () => {
    try {
      const res = await fs.readFile(filepath);
      return JSON.parse(res).data;
    } catch (err) {
      log.warn(`Could not read cache ${err.message}`.yellow);
      return null;
    }
  };

  const writeCache = async data => {
    try {
      await fs.writeFile(filepath, JSON.stringify(data));
    } catch (err) {
      log.warn(`Could not write cache ${err.message}`.yellow);
      return false;
    }
    return true;
  };
  return {
    read: getCache,
    write: writeCache,
  };
};

module.exports = async () => {
  const cache = await createCache();
  const cacheData = await cache.read();

  if (cacheData) {
    const { useCache } = await inquirer.prompt([
      {
        name: 'useCache',
        type: 'list',
        message: 'Colleagues cache exists, use cache?',
        choices: ['yes', 'no'],
      },
    ]);
    if (useCache === 'yes') {
      return cacheData;
    }
  }

  log('>> Getting colleagues from API');
  const authCookie = await getCookieAuth();
  assert(authCookie, 'Missing authcookie');

  const url =
    'https://rebel.netlight.com/wp-admin/admin-ajax.php?action=contact_list';

  const res = await axios({
    method: 'get',
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: authCookie,
    },
  });

  if (res.status > 299) {
    throw new Error(`Could not get colleagues: ${res.statusText}`);
  }

  // Store cache
  await cache.write(res.data);

  return res.data.data;
};
