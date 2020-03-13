const { Survey, Scale } = require('enquirer');

const result = {
  'A - Frederic Schneider': 4,
  'A - Jonathan Adam': 2,
  'A - Julian Gog': 3,
  'A - Kristina Krinizki': 4,
  'A - Leonard Koll': 3,
  'A - Michael Janke': 2,
  'A - Nino Chalati': 4,
  'A - Paul Arndt': 4,
  'A - Simone Egger': 4,
  'A - Sven Lehmann': 4,
  'AC - Afshin Loni': 3,
  'AC - Alexander Hans': 3,
  'AC - Jonas Jaszkowic': 2,
  'AC - Lisa Taute': 4,
  'AC - Marilyn Nowacka Barros': 4,
  'AC - Mascha Busch': 3,
  'AC - Nicla Lüken': 4,
  'AC - Pascal Ackermann': 4,
  'AC - Steffen Schröder': 4,
  'AC - Torben Meyer': 4,
  'C - Adrian Bartnik': 4,
  'C - Alexander Ernst': 2,
  'C - Dorian Wojda': 3,
  'C - Ellinor Hakansson': 4,
  'C - Erik Rieber-Mohn': 4,
  'C - Jasper Hahn': 1,
  'C - Judith Sommerfeld': 4,
  'C - Julia Vamboldt': 2,
  'C - Karen Piotrowski': 3,
  'C - Maria Perchyk': 1,
  'C - Mathias Peters': 2,
  'C - Miles Tester': 4,
  'C - Samuel Radimak': 3,
  'C - Sarah Leu': 2,
  'C - Taha Taha': 3,
  'C - Tetiana Mulenko': 0,
  'SrC - Corinna Von Den Driesch': 2,
  'SrC - Johan Henriksson': 2,
  'SrC - Johan Nilsson': 3,
  'SrC - Johannes Bärmann': 3,
  'SrC - Johannes Günther': 4,
  'SrC - Jonatan Kjellsson': 2,
  'SrC - Jonathan Herdt': 3,
  'SrC - Mario Bislick': 2,
  'SrC - Mina Kleid': 2,
  'SrC - Nigar Nazirova': 3,
  'SrC - Per-Victor Persson': 3,
  'SrC - Philipp Eiglsperger': 4,
  'SrC - Sebastian Schreck': 3,
  'SrC - Vilhelm Andersson Sturén': 2,
  'AM - Jan Carsten Lohmüller': 4,
  'AM - Marcus Månsson': 4,
  'AM - Sara Frisk': 0,
  'AM - Tomas Walander': 0,
  'M - Bastienne-Julie Zorr': 1,
  'M - Erik Allmér': 2,
  'M - Simon Nielsen': 0,
  'SrM - Maximilian Born': 2,
  'OPE - Viktoria Zarzycki': 4,
};

const sparaSparraSparka = async netlighters => {
  // All Netlighters
  console.log('netlighters', netlighters.length);
  const prompt = new Scale({
    name: 'experience',
    message: 'Pre Level Alignment',
    scale: [
      { name: '1', message: 'Strongly Disagree' },
      { name: '2', message: 'Disagree' },
      { name: '3', message: 'Neutral' },
      { name: '4', message: 'Agree' },
      { name: '5', message: 'Strongly Agree' },
    ],
    margin: [0, 0, 2, 1],
    choices: netlighters.slice(36).map(nl => `${nl.level} - ${nl.fullName}`),
  });

  const result = await prompt.run();

  console.log('Result', result);
};

module.exports = sparaSparraSparka;
