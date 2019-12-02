module.exports = {
  name: 'Netlight',
  description: 'Run Netlight packages',
  type: 'node',
  scripts: [
    {
      name: 'Mentors',
      description: 'Scripts to print mentors',
      type: 'node',
      script: require('../src/netlight/mentors'),
    },
  ],
};
