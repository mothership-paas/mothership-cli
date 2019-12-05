const { table } = require('table');

module.exports = function() {
  const commands = [
    ['Command', 'Action'],
    ['list', 'Display list of Mothership\'s apps'],
    ['create <appName>', 'Create an app named <appName>'],
    ['deploy <appName>', 'Deploy current directory as <appName>']
  ];

  console.log(table(commands));
}
