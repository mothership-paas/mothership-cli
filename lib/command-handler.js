const create = require('./commands/create');
const deploy = require('./commands/deploy');
const help   = require('./commands/help');
const list   = require('./commands/list');

module.exports = async function executeCommand(command, commandArgs) {
  // `command`
  // the command the user ran
  // `mothership list`
  // command: 'list'

  // `commandArgs`
  // an array of all remaining arguments after the initial command
  // i.e. `mothership create foo bar baz`
  // commandArgs: ['foo', 'bar', 'baz']

  if (command === 'create') {
    await create(commandArgs);
  } else if (command === 'deploy') {
    await deploy(commandArgs)
  } else if (command === 'list') {
    await list();
  } else if (command === 'help') {
    await help();
  } else if (command === 'setup') {
    console.log('Mothership setup is under construction.');
  } else {
    console.log(`Mothership: '${command}' is not a valid command.`);
    console.log(`Run "mothership help" for a list of commands.`);
  }
};
