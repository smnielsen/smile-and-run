const LEVELS = require('./levels');

const sorts = {
  name: ({ fullName: nameA }, { fullName: nameB }) => {
    return nameA < nameB ? -1 : 1;
  },
  mentorName: (
    { mentor: { fullName: nameA } },
    { mentor: { fullName: nameB } },
  ) => {
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

module.exports = (array, { sortOn = 'level' } = {}) => {
  const copy = [...array];
  copy.sort(sorts[sortOn] || sorts.level);
  return copy;
};
