const clc = require('cli-color');
const momentHelpers = require('./momentHelpers');

/**
 * @typedef {{ trace: Function, debug: Function, info: Function, warn: Function, error: Function, fatal: Function, ok: Function, create: Function }} Logger
 */

const colors = {
  trace: clc.bold,
  debug: clc.cyan.bold,
  info: clc.blue.bold,
  ok: clc.green.bold,
  warn: clc.yellow.bold,
  error: clc.red.bold,
  fatal: clc.red.bold,
};

const DEFAULT_LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LEVELS = {
  TRACE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
  FATAL: 6,
  OK: 7,
};

const printTime = () => momentHelpers.getTimeString();
const printName = name => (name ? clc.cyan(`[${name}]`) : '');
const printLevel = level => colors[level](`${level.toUpperCase()}`);

/**
 * @typedef {('trace'|'debug'|'info'|'warn'|'error'|'fatal'|'ok')} LogLevel
 * @param {{ name: string, level: LogLevel}} param0
 * @returns {Logger}
 */
const createLogger = ({ name = '', level = DEFAULT_LOG_LEVEL } = {}) => {
  const options = {
    name,
    level: level.toUpperCase(),
  };

  /**
   *
   * @param {string} msg
   * @param {Function} logMethod
   * @param {LogLevel} level
   */
  const logIfSafe = (msg, logMethod, level) => {
    const upperLevel = level.toUpperCase();
    if (LEVELS[upperLevel] >= LEVELS[options.level]) {
      let prefix = '';
      if (LEVELS[upperLevel] > LEVELS.debug) {
        prefix = `${printTime()} | `;
      }
      prefix = `${prefix}${printName(name)} ${printLevel(level)}`;
      logMethod(prefix, msg[0], ...msg.slice(1));
    }
  };
  // Create result object
  const result = (...msg) => result.trace(...msg);

  Object.keys(LEVELS).forEach(key => {
    const keyLower = key.toLowerCase();
    // eslint-disable-next-line no-console
    let consoleMethod = console.log;
    // eslint-disable-next-line no-console
    if (console[keyLower] && keyLower !== 'trace') {
      // eslint-disable-next-line no-console
      consoleMethod = console[keyLower];
    }
    result[keyLower] = (...msg) => logIfSafe(msg, consoleMethod, keyLower);
  });

  // eslint-disable-next-line no-console
  result.empty = () => console.log();
  // eslint-disable-next-line no-console
  result.ok = (...msg) => logIfSafe(msg, console.log, 'ok');

  result.create = createLogger;
  return result;
};

module.exports = createLogger({ name: 'sac' });
