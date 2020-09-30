require('colors');

const assert = require('assert');
const path = require('path');
const clipboardy = require('clipboardy');

const fs = require('fs').promises;
const CliTable = require('cli-table');
const markdownTable = require('markdown-table');
const log = require('../../util/logger').create({ name: 'mentors' });
const config = require('../../config');
const getOfficeNetlighters = require('../helpers/getOfficeNetlighters');
const LEVELS = require('../helpers/levels');
const sort = require('../helpers/sortNetlighters');

const writeOutput = async outputData => {
  const outputFile = path.resolve(config.outputDir, 'sar-mentors-output.log');
  await fs.writeFile(outputFile, outputData);

  log.info('Printed output to'.blue, `${outputFile}`);
};

const printMentorsMarkdown = (
  mentorIdsOrdered,
  mappedByMentor,
  { showMentees = true },
) => {
  const summaryTable = [['**Office**', '**Mentors**', '**Mentees**']];
  let totalOffices = 0;
  let totalMentors = 0;
  let totalMentees = 0;
  let mentorsCount = 0;
  let menteesCount = 0;
  let currentOffice = '';
  const formattedAsTable = mentorIdsOrdered.reduce(
    (memo, mentorId) => {
      const mentees = mappedByMentor[mentorId];
      const mentor = mentees[0].mentor;

      const nextMemo = [...memo];
      if (mentor.id) {
        if (currentOffice !== mentor.office) {
          nextMemo.push([`#### **${mentor.office}**`]);
          if (currentOffice !== '') {
            summaryTable.push([currentOffice, mentorsCount, menteesCount]);
          }
          totalOffices++;
          currentOffice = mentor.office;
          mentorsCount = 0;
          menteesCount = 0;
        }
        totalMentors++;
        totalMentees += mentees.length;

        mentorsCount += 1;
        menteesCount += mentees.length;
        // First push in the mentor
        nextMemo.push([
          `**${mentor.fullName}**`,
          `**${mentees.length}**`,
          `**${mentor.office}**`,
          `**${mentor.level}**`,
          `**${LEVELS[mentor.level] > 4 ? 7 : 6}**`,
        ]);

        if (showMentees) {
          // Secondly all the mentees
          sort(mentees, { sortOn: 'level' }).forEach(mentee => {
            nextMemo.push([
              '', // we don't add anything on first level for mentees
              mentee.fullName,
              mentee.office,
              mentee.level,
              '',
            ]);
          });
        }
      }

      return nextMemo;
    },
    [['**Mentor**', '**Mentees**', '**Office**', '**Level**', '**Maximum**']],
  );
  // Need to push the last office
  summaryTable.push([currentOffice, mentorsCount, menteesCount]);
  summaryTable.push(['**TOTAL**']);
  summaryTable.push([totalOffices, totalMentors, totalMentees]);
  log('-----------'.bold);
  const markdown = markdownTable(formattedAsTable);
  const summaryMarkdown = markdownTable(summaryTable);
  console.log(markdown);
  log.info('>> Summary numbers');
  console.log(summaryMarkdown);
  log('-----------'.bold);
  try {
    clipboardy.writeSync(`${summaryMarkdown} \n ----- \n ${markdown}`);
    log.ok('=> Copied content to clipboard...'.white.bold);
  } catch (err) {
    log.error(`Could not copy to clipboard ${err.message}`, err);
  }
};

const printMentors = async (
  mappedByMentor,
  isInOffice,
  { groupBy, showMentees = true, markdown = false } = {},
) => {
  let mentorIds = Object.keys(mappedByMentor);

  // sort mentorIds
  mentorIds.sort((idA, idB) => {
    const mentorA = mappedByMentor[idA][0].mentor;
    const mentorB = mappedByMentor[idB][0].mentor;
    if (mentorA && mentorB) {
      if (mentorA.office === mentorB.office) {
        return mentorA.fullName < mentorB.fullName ? -1 : 1;
      } else if (isInOffice(mentorA)) {
        return -1;
      } else if (isInOffice(mentorB)) {
        return 1;
      } else {
        return mentorA.office < mentorB.office ? -1 : 1;
      }
    } else {
      return 0;
    }
  });

  if (groupBy) {
    mentorIds = Object.values(
      mentorIds.reduce((groups, mentorId) => {
        const mentor = (
          mappedByMentor[mentorId][0] || mappedByMentor[mentorId][1]
        ).mentor;
        if (mentor.id) {
          const groupByValue = mentor[groupBy];
          if (!groups[groupByValue]) {
            groups[groupByValue] = [];
          }
          const currentGroupMentorIds = groups[groupByValue];
          currentGroupMentorIds.push(mentor.id);
        } else {
          groups.undefined = [];
        }
        return groups;
      }, {}),
    ).flat();
  }

  if (markdown) {
    printMentorsMarkdown(mentorIds, mappedByMentor, { showMentees });
  } else {
    mentorIds.forEach(mentorId => {
      const mentees = mappedByMentor[mentorId];
      const mentor = mentees[0].mentor;
      // eslint-disable-next-line no-console
      console.log(
        `${isInOffice(mentor) ? '✅' : '❌'} ${
          mentor.fullName === 'unknown' ? 'No mentor' : mentor.fullName
        }(${mentees.length} mentees): in "${mentor.office}" with "${
          mentor.email
        }"`.bold,
      );
      mentees.sort(({ level: la }, { level: lb }) => {
        return LEVELS[la] < LEVELS[lb] ? -1 : 1;
      });
      if (showMentees) {
        mentees.forEach(nler => {
          const { fullName, level, office, mentor, doing } = nler;
          // eslint-disable-next-line no-console
          console.log(
            `   ${level}: ${
              office === mentor.office ? fullName.green : fullName.yellow
            } in "${office}" as "${doing}"`,
          );
        });
      }
    });
  }
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

const printMentorEmails = mentorsById => {
  console.log('-- Mentor Emails - long list --');
  const emails = Object.keys(mentorsById)
    .map(mentorId => {
      const mentees = mentorsById[mentorId];
      const mentor = mentees[0].mentor;
      console.log(`${mentor.fullName}: ${mentor.email}`);
      return mentor.email;
    })
    .join(',');
  console.log('-- Mentor Emails - Copy/Paste into email --');
  console.log('--------------------------');
  console.log(emails);
  console.log('--------------------------');
};

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

  // Only mentors that is situated in the mainOffice
  const sortedByName = sort(netlighters, { sortOn: 'name' });
  const localMentorsById = sortedByName.reduce((memo, { mentor, ...rest }) => {
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

  // All mentors with a mentee in the main office
  const officeMentorsById = sortedByName.reduce(
    (memo, { mentor, office, ...rest }) => {
      if (isInOffice(mentor) || isInOffice({ office })) {
        if (!memo[mentor.id]) {
          memo[mentor.id] = [];
        }
        memo[mentor.id].push({
          ...rest,
          office,
          mentor,
        });
      }
      return memo;
    },
    {},
  );

  const netlightersInOffice = getOfficeNetlighters(netlighters, mainOffice);
  const { sortedMentees, table } = getSortedMentees(netlightersInOffice);

  // Print methods
  switch (method) {
    case 'local-mentors': {
      printMentors(localMentorsById, isInOffice);
      break;
    }
    case 'local-mentors-markdown': {
      printMentors(localMentorsById, isInOffice, {
        showMentees: true,
        markdown: true,
      });
      break;
    }
    case 'mentors': {
      printMentors(officeMentorsById, isInOffice);
      break;
    }
    case 'mentors-markdown': {
      printMentors(officeMentorsById, isInOffice, {
        showMentees: true,
        markdown: true,
      });
      break;
    }
    case 'mentor-emails': {
      printMentorEmails(officeMentorsById);
      break;
    }
    case 'mentors-by-office': {
      await printMentors(officeMentorsById, isInOffice, {
        showMentees: true,
        groupBy: 'office',
      });
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
    JSON.stringify(localMentorsById),
  );
}

module.exports = main;
