const { table } = require('table');

module.exports = function() {
  const commands = [
    ['Command', 'Action'],
    ['mothership login', 'Log in to Mothership'],
    ['mothership help', 'Display this menu'],
    ['mothership list', 'Display list of Mothership\'s apps'],
    ['mothership create appname', 'Create an app named \'appname\''],
    ['mothership deploy appname', 'Deploy current directory as \'appname\''],
    ['mothership open appname', 'Open \'appname\'s url in default browser'],
    ['mothership logs appname', 'Load and stream logs for \'appname\''],
    ['mothership db-backup appname', 'Download SQL dump of \'appname\'s database'],
  ];

  console.log(table(commands, {
    drawHorizontalLine: (index, size) => {
      return index === 0 || index === 1 || index === size;
    },
  }));
};
