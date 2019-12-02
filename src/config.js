require('dotenv').config();
const os = require('os');
const path = require('path');
const userHomeDir = os.homedir();
const dir = path.resolve(userHomeDir, '.sar');

module.exports = {
  outputDir: dir,
};
