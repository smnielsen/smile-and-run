require('colors');

const assert = require('assert');
const path = require('path');
const clipboardy = require('clipboardy');
const fs = require('fs').promises;
const markdownTable = require('markdown-table');
const LEVELS = require('../helpers/levels');
const log = require('../../util/logger').create({ name: 'netlighters' });
const config = require('../../config');
const getOfficeNetlighters = require('../helpers/getOfficeNetlighters');
const preAlignment = require('../helpers/preAlignment');
const sortNetlighters = require('../helpers/sortNetlighters');
const searchNetlighters = require('../helpers/searchNetlighters');
const { formatTime } = require('../helpers/formatTime');

const printNetlighters = (netlighters, { groupBy = 'office' } = {}) => {
  const reduced = netlighters.reduce((groups, nl, index) => {
    if (!groups[nl[groupBy]]) {
      groups[nl[groupBy]] = [];
    }
    groups[nl[groupBy]].push(nl);
    return groups;
  }, {});

  Object.keys(reduced).forEach(groupValue => {
    const nlers = reduced[groupValue];
    console.log(`# ${groupBy} = ${groupValue.bold} (${nlers.length})`);
    nlers.forEach(nl => {
      console.log(`>> (${nl.level}) ${nl.fullName} as ${nl.doing}`);
    });
    console.log('--------');
  });
};
const TIME_PER_LEVEL = {
  A: 90,
  AC: 90,
  C: 120,
  SrC: 120,
  AM: 120,
};
const LAF_COLUMNS = [
  '**Level**',
  '**Name**',
  '**Mentor**',
  '**TimeOnLevel**',
  '**Category**',
  '**Grade**',
  '**Comments**',
];
const printLafList = (
  netlighters,
  { sortOn = 'level', maxLevel = 'P' } = {},
) => {
  const sorted = sortNetlighters(netlighters, { sortOn });
  const summaryByLevel = {};
  const formattedAsTable = sorted.reduce(
    (memo, nl) => {
      if (LEVELS[nl.level] > LEVELS[maxLevel]) {
        return memo;
      }
      if (nl.mentor.fullName === 'unknown') {
        return memo;
      }
      const nextMemo = [...memo];
      if (!summaryByLevel[nl.level]) {
        summaryByLevel[nl.level] = {
          count: 0,
        };
      }
      summaryByLevel[nl.level].count++;

      if (memo[memo.length - 1][0] !== nl.level) {
        nextMemo.push([`**---${nl.level}---**`, ...LAF_COLUMNS.slice(1)]);
      }

      nextMemo.push([nl.level, nl.fullName, nl.mentor.fullName]);

      return nextMemo;
    },
    [LAF_COLUMNS],
  );

  // Create summary table
  const totalCounts = {
    count: 0,
    maxTimePerMentee: 0,
    totalTime: 0,
  };
  const summaryTable = Object.keys(summaryByLevel).reduce(
    (memo, level) => {
      const nextMemo = [...memo];
      const { count } = summaryByLevel[level];
      nextMemo.push([
        level,
        count,
        formatTime(TIME_PER_LEVEL[level]),
        formatTime(TIME_PER_LEVEL[level] * count),
      ]);
      totalCounts.count += count;
      totalCounts.maxTimePerMentee += TIME_PER_LEVEL[level];
      totalCounts.totalTime += TIME_PER_LEVEL[level] * count;
      return nextMemo;
    },
    [['**Level**', '**Count**', '**Max time per mentee**', '**Total time**']],
  );

  // Total times
  const totalSummaries = Object.keys(totalCounts).reduce((memo, key) => {
    return [
      ...memo,
      key === 'count' ? totalCounts[key] : formatTime(totalCounts[key]),
    ];
  }, []);
  summaryTable.push(['**Total**', ...totalSummaries]);
  // Printing
  log('-----------'.bold);
  const markdown = markdownTable(formattedAsTable);
  const summaryMarkdown = markdownTable(summaryTable);
  console.log(markdown);
  log.info('>> Summary');
  console.log(summaryMarkdown);
  log('-----------'.bold);
  try {
    clipboardy.writeSync(`${summaryMarkdown} \n ----- \n ${markdown}`);
    log.ok('=> Copied content to clipboard...'.white.bold);
  } catch (err) {
    log.error(`Could not copy to clipboard ${err.message}`, err);
  }
};

async function main(colleagues, { method: methodArg, office: officeArg } = {}) {
  const mainOffice = officeArg || process.argv[2];
  assert(mainOffice, 'Please define office as first parameter');
  const method = methodArg || process.argv[3] || 'by-doing';

  // Map data to personas
  // prettier-ignore
  let netlighters = colleagues.reduce((persons, [id, email, mentor, level, doing, link, office, fullName, phoneNumber, { "0": imageUrl }]) => {
    return [
      ...persons,
      {
        id, fullName, email, office, level, mentor, doing, link, imageUrl, phoneNumber
      }
    ]
  }, []);

  // Map Mentors (just copy them)
  netlighters = netlighters.map(({ mentor, ...rest }) => {
    let mentorData = netlighters.find(({ fullName }) => fullName === mentor);
    if (!mentorData) {
      // log(`Missing mentor data for ${rest.fullName}`.yellow);
      mentorData = {
        fullName: 'unknown',
        office: '',
      };
    }
    return {
      ...rest,
      mentor: mentorData,
    };
  });

  const netlightersInOffice = getOfficeNetlighters(netlighters, mainOffice);

  // Print methods
  switch (method) {
    case 'by-doing': {
      printNetlighters(netlightersInOffice, { groupBy: 'doing' });
      break;
    }
    case 'laf-list': {
      printLafList(netlightersInOffice, { sortBy: 'name', maxLevel: 'SrC' });
      break;
    }
    case 'pre-alignment': {
      await preAlignment(netlightersInOffice);
      break;
    }
    case 'search': {
      await searchNetlighters(netlightersInOffice);
      break;
    }
    default: {
      break;
    }
  }

  log('------------');

  // Pretty print all in level order with mentor

  log('...');
  log.ok(`✅ ${netlighters.length} in total`);
  log.ok(`✅ ${netlightersInOffice.length} in ${mainOffice}`.bold);

  await fs.writeFile(
    path.resolve(config.outputDir, `netlighters-${mainOffice}.json`),
    JSON.stringify(netlightersInOffice),
  );
}

module.exports = main;
