const fs    = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const login  = require('./commands/login');
const create = require('./commands/create');
const deploy = require('./commands/deploy');
const help   = require('./commands/help');
const list   = require('./commands/list');
const open   = require('./commands/open');

function isAuthenticated() {
  const configPath = path.join(homedir, '.mothership-cli');
  const apiTokenPath = path.join(configPath, 'apiToken');
  let apiToken;

  if (fs.existsSync(apiTokenPath)) {
    apiToken = fs.readFileSync(apiTokenPath);
  }

  return apiTokenPath && apiToken;
}

function logLoginMessage() {
  console.log('Please login first (see `mothership help`)');
}

module.exports = async function executeCommand(command, commandArgs) {
  // `command`
  // the command the user ran
  // `mothership list`
  // command: 'list'

  // `commandArgs`
  // an array of all remaining arguments after the initial command
  // i.e. `mothership create foo bar baz`
  // commandArgs: ['foo', 'bar', 'baz']

  if (command === 'login') {
    await login(commandArgs);
  } else if (command === 'create') {
    if (isAuthenticated()) {
      await create(commandArgs);
    } else {
      logLoginMessage();
    }
  } else if (command === 'deploy') {
    if (isAuthenticated()) {
      await deploy(commandArgs)
    } else {
      logLoginMessage();
    }
  } else if (command === 'open') {
    if (isAuthenticated()) {
      await open(commandArgs);
    } else {
      logLoginMessage();
    }
  } else if (command === 'list') {
    if (isAuthenticated()) {
      await list();
    } else {
      logLoginMessage();
    }
  } else if (command === 'help' || command === undefined) {
    await help();
  } else if (command === 'setup') {
    console.log('Mothership setup is under construction.');
  } else {
    console.log(`Mothership: '${command}' is not a valid command.`);
    console.log(`Run "mothership help" for a list of commands.`);
  }
};
