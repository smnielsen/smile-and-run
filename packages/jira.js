module.exports = {
  name: 'JIRA',
  description: 'Run JIRA Scripts',
  type: 'node',
  scripts: [
    {
      name: 'API',
      description: 'Search through Jira API',
      type: 'sh',
      script: 'src/jira/api/jira-api.sh',
    },
  ],
};
