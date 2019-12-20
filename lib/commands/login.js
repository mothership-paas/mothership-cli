const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const Readline = require('readline');
const { api, HOST } = require('../util/api');
const { table, getBorderCharacters } = require('table');

const promptForInput = (prompt) => {
  return new Promise((resolve, reject) => {
    const readline = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(prompt + '\n> ', (input) => {
      readline.close();
      resolve(input);
    });
  });
};

module.exports = async () => {
  // Prompt user for URL of their mothership
  const address = await promptForInput('Please enter the URL of your mothership: ');
  // Prompt user for username
  const username = await promptForInput('Username: ');
  // Prompt user for URL of their mothership
  const password = await promptForInput('Password: ');

  const configPath = path.join(homedir, '.mothership-cli');

  if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath);
  }

  fs.writeFileSync(path.join(configPath, 'host'), address);

  api.post(`${address}/api/login`, {
    username,
    password,
  }).then((response) => {   
    fs.writeFileSync(path.join(configPath, 'apiToken'), response.data);
  }).catch((error) => {
    console.log(error);
  }).finally(() => {});
}
