const LEVELS = require('./levels');

const getOfficeNetlighters = (
  netlighters,
  mainOffice,
  { sortOn = 'level' } = {},
) => {
  // Filter city
  const cityNl = netlighters.filter(
    ({ office }) => office.toLowerCase() === mainOffice.toLowerCase(),
  );

  const sorts = {
    name: ({ fullName: nameA }, { fullName: nameB }) => {
      return nameA < nameB ? -1 : 1;
    },
    level: ({ level: la }, { level: lb }) => {
      return LEVELS[la] < LEVELS[lb] ? -1 : 1;
    },
    match: (
      { office: oa, level: la, mentor: ma },
      { office: ob, level: lb, mentor: mb },
    ) => {
      if (ma.office === oa) {
        return 1;
      }
      if (mb.office === ob) {
        return -1;
      }
      if (LEVELS[ma.level] < 6) {
        if (LEVELS[mb.level] < 6) {
          return LEVELS[la] < LEVELS[lb] ? -1 : 1;
        }
        return -1;
      }
      if (LEVELS[mb.level] < 6) {
        if (LEVELS[ma.level] < 6) {
          return LEVELS[la] < LEVELS[lb] ? -1 : 1;
        }
        return 1;
      }
      return LEVELS[la] < LEVELS[lb] ? -1 : 1;
    },
  };
  const copy = [...cityNl];
  copy.sort(sorts[sortOn]);
  return copy;
};

module.exports = getOfficeNetlighters;
