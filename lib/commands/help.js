const { table, getBorderCharacters } = require('table');

module.exports = function() {
  const commands = [
    ['Command', 'Action'],
    ['mothership login username password', 'login to the PAAS with your username and password'],
    ['mothership help', 'Display this menu'],
    ['mothership list', 'Display list of Mothership\'s apps'],
    ['mothership open appname', 'Open app url in default browser'],
    ['mothership create appname', 'Create an app named \'appname\''],
    ['mothership deploy appname', 'Deploy current directory as \'appname\'']
  ];

  console.log(table(commands, {
    drawHorizontalLine: (index, size) => {
      return index === 0 || index === 1 || index === size;
    },
  }));
};
