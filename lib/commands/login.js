const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const { api, HOST } = require('../util/api');
const { table, getBorderCharacters } = require('table');

module.exports = function(commandArgs) {
  api.post(HOST + '/api/login', {
    username: commandArgs[0],
    password: commandArgs[1],
  }).then((response) => {
    const configPath = path.join(homedir, '.mothership-cli');

    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath);
    }
    
    fs.writeFileSync(path.join(configPath, 'apiToken'), response.data);
  }).catch((error) => {
    console.log(error);
  }).finally(() => {});
}
