require('colors');

const assert = require('assert');
const path = require('path');
const fs = require('fs').promises;
const CliTable = require('cli-table');
const log = require('../../util/logger').create({ name: 'mentors' });
const config = require('../../config');

const LEVELS = {
  A: 0,
  AC: 1,
  C: 2,
  SrC: 3,
  AM: 4,
  M: 5,
  SrM: 6,
  P: 7,
};

const writeOutput = async outputData => {
  const outputFile = path.resolve(config.outputDir, 'sar-mentors-output.log');
  await fs.writeFile(outputFile, outputData);

  log.info('Printed output to'.blue, `${outputFile}`);
};

const printMentors = async (mappedByMentor, mainOffice) => {
  Object.keys(mappedByMentor).forEach(mentorId => {
    const mentees = mappedByMentor[mentorId];
    const mentor = mentees[0].mentor;
    // eslint-disable-next-line no-console
    console.log(
      `${
        mentor.office.toLowerCase() === mainOffice.toLowerCase() ? '✅' : '⚠️'
      } ${mentor.fullName === 'unknown' ? 'No mentor' : mentor.fullName} in "${
        mentor.office
      }" (${mentees.length} mentees):`.bold,
    );
    mentees.sort(({ level: la }, { level: lb }) => {
      return LEVELS[la] < LEVELS[lb] ? -1 : 1;
    });
    mentees.forEach(nler => {
      const { fullName, level, office, mentor, doing } = nler;
      // eslint-disable-next-line no-console
      console.log(
        `   ${level}: ${
          office === mentor.office ? fullName.green : fullName.yellow
        } in "${office}" as "${doing}"`,
      );
    });
  });
};

const getOfficeNetlighters = (netlighters, mainOffice) => {
  // Filter city
  const cityNl = netlighters.filter(
    ({ office }) => office.toLowerCase() === mainOffice.toLowerCase(),
  );

  const sorts = {
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
  copy.sort(sorts.level);
  return copy;
};

const getSortedMentees = netlightersInOffice => {
  /**
   * Time to Print
   */
  const table = new CliTable({
    head: [
      '',
      'Level'.blue.bold,
      'Name'.blue.bold,
      'Role'.blue.bold,
      'Mentor'.blue.bold,
      'Mentor-Office'.blue.bold,
    ],
    colWidths: [7, 7, 30, 15, 30, 15],
  });

  const sortedMentees = netlightersInOffice.reduce(
    (split, nler) => {
      const { fullName, level, office, mentor, doing } = nler;
      const sameOffice = mentor.office === office;

      let update = {};
      const tableData = [];
      if (sameOffice) {
        tableData.push();
        table.push([
          'OK'.green.bold,
          level,
          fullName,
          doing,
          mentor.fullName,
          mentor.office,
        ]);
        update = {
          ...split,
          same: [...split.same, nler],
        };
      } else {
        const color = LEVELS[mentor.level] < 6 ? '$'.red.bold : '$'.yellow.bold;
        table.push([
          LEVELS[mentor.level] < 6 ? 'NO'.red.bold : 'MAYBE'.yellow.bold,
          color.replace('$', level),
          color.replace('$', fullName),
          color.replace('$', doing),
          color.replace('$', mentor.fullName),
          color.replace('$', mentor.office),
        ]);
        tableData.push();
        update = {
          ...split,
          others: [...split.others, nler],
          switchProposals: [
            ...split.switchProposals,
            LEVELS[mentor.level] < 6 ? nler : null,
          ].filter(n => n !== null),
          missing: [...split.missing, mentor.level ? nler : null].filter(
            n => n !== null,
          ),
        };
      }

      return update;
    },
    { same: [], others: [], switchProposals: [], missing: [] },
  );

  return { sortedMentees, table };
};

const matchMentors = sortedMentees => {};

async function main(colleagues, { method: methodArg, office: officeArg } = {}) {
  const mainOffice = officeArg || process.argv[2];
  assert(mainOffice, 'Please define office as first parameter');
  const method = methodArg || process.argv[3] || 'mentors';

  const isInOffice = nler =>
    nler.office.toLowerCase() === mainOffice.toLowerCase();
  // Map data to persons
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
  // Verify data, print me
  // log(`Myself`, netlighters.find(nl => nl.fullName === 'Simon Nielsen'));

  // Pretty print sorted by mentor
  const mappedByMentor = netlighters.reduce((memo, { mentor, ...rest }) => {
    if (isInOffice(mentor)) {
      if (!memo[mentor.id]) {
        memo[mentor.id] = [];
      }
      memo[mentor.id].push({
        ...rest,
        mentor,
      });
    }
    return memo;
  }, {});

  const netlightersInOffice = getOfficeNetlighters(netlighters, mainOffice);
  const { sortedMentees, table } = getSortedMentees(netlightersInOffice);
  // Print methods
  switch (method) {
    case 'mentors': {
      await printMentors(mappedByMentor, mainOffice);
      break;
    }
    case 'mentees': {
      // eslint-disable-next-line no-console
      console.log(table.toString());
      break;
    }
    case 'matching': {
      await matchMentors(sortedMentees);
      break;
    }
    default: {
      break;
    }
  }

  log('------------');

  // Pretty print all in level order with mentor

  log('...');
  log.info(`== ${mainOffice} == `);
  log.ok(`✅ ${sortedMentees.same.length} has match in same office`);
  log.info(`# ${sortedMentees.others.length} has mentors in other offices`);
  log.warn(
    `❌ ${sortedMentees.switchProposals.length} should switch mentor?`.blue,
  );
  log.warn(`⚠️  ${sortedMentees.missing.length} is missing a mentor!`.yellow);

  log.ok(`Done`.green);

  await writeOutput(table.toString());
  await fs.writeFile(
    path.resolve(config.outputDir, 'mentor-mentee-tree.json'),
    JSON.stringify(mappedByMentor),
  );
}

module.exports = main;
