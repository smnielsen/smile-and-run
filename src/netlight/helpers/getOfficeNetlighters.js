const sort = require('./sortNetlighters');

const getOfficeNetlighters = (
  netlighters,
  mainOffice,
  { sortOn = 'level' } = {},
) => {
  if (!mainOffice || mainOffice === 'all') {
    return sort(netlighters, { sortOn });
  }
  // Filter city
  const cityNl = netlighters.filter(
    ({ office }) => office.toLowerCase() === mainOffice.toLowerCase(),
  );
  const copy = sort(cityNl, { sortOn });
  return copy;
};

module.exports = getOfficeNetlighters;
