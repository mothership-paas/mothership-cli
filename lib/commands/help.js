const { table } = require('table');

module.exports = function() {
  const commands = [
    ['Command', 'Action'],
    ['mothership help', 'Display this menu'],
    ['mothership list', 'Display list of Mothership\'s apps'],
    ['mothership create appname', 'Create an app named \'appname\''],
    ['mothership deploy appname', 'Deploy current directory as \'appname\'']
  ];

  console.log(table(commands));
};
