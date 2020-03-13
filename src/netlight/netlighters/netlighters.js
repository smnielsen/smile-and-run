require('colors');

const assert = require('assert');
const path = require('path');
const fs = require('fs').promises;
const log = require('../../util/logger').create({ name: 'netlighters' });
const config = require('../../config');
const getOfficeNetlighters = require('../helpers/getOfficeNetlighters');
const preAlignment = require('../helpers/preAlignment');

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
    case 'pre-alignment': {
      await preAlignment(netlightersInOffice);
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
