require('colors');

const createLog = ({ name } = {}) => {
  const printLevel = level => {
    switch (level) {
      case 'debug':
        return 'DEBUG'.cyan.bold;
      case 'info':
        return 'INFO'.blue.bold;
      case 'success':
        return 'SUCCESS'.green.bold;
      case 'warn':
        return 'WARN'.yellow.bold;
      case 'error':
        return 'ERROR'.blue.bold;
      default:
        return '';
    }
  };
  const start = level => `>> [${name}] ${printLevel(level)}`;
  // Create result object
  const result = (...msg) => result.log(...msg);

  // eslint-disable-next-line no-console
  result.empty = () => console.log('');
  // eslint-disable-next-line no-console
  result.log = (...msg) => console.log(start(), ...msg);
  // eslint-disable-next-line no-console
  result.debug = (...msg) => console.log(`${start('debug')}`, ...msg);
  // eslint-disable-next-line no-console
  result.info = (...msg) => console.log(`${start('info')}`, ...msg);
  // eslint-disable-next-line no-console
  result.success = (...msg) =>
    console.log(`${start('success')}`, msg[0].green, ...msg.slice(1));
  // eslint-disable-next-line no-console
  result.warn = (...msg) => console.warn(`${start('warn')}`.blue, ...msg);
  // eslint-disable-next-line no-console
  result.error = (...msg) => console.error(`${start('error')}`.blue, ...msg);

  result.create = opts => createLog(opts);

  return result;
};

module.exports = createLog({ name: 'smile-and-run' });
